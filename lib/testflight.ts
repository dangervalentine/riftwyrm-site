import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";

/**
 * Adds testers to a TestFlight group through the App Store Connect API, so an
 * Apple ID given on /beta gets Apple's invitation without anyone exporting a
 * list. Kept free of the "@/" alias and of TypeScript-only constructs, so
 * scripts/testflight.mts can run it under plain Node as well as the site.
 *
 *   ASC_ISSUER_ID         App Store Connect → Users and Access → Integrations → Issuer ID
 *   ASC_KEY_ID            the API key's Key ID (role: App Manager)
 *   ASC_PRIVATE_KEY_PATH  the key's AuthKey_<KEY_ID>.p8 file, kept on the host only
 *   ASC_BETA_GROUP_ID     the external tester group (`npm run testflight -- groups` lists them)
 */
export type TestflightConfig = { issuer: string; keyId: string; keyPath: string; groupId: string };

const API = "https://api.appstoreconnect.apple.com/v1";

/** The settings, or null while any of them is missing (the feature is off). */
export function testflightConfig(env: NodeJS.ProcessEnv = process.env): TestflightConfig | null {
  const issuer = env.ASC_ISSUER_ID;
  const keyId = env.ASC_KEY_ID;
  const keyPath = env.ASC_PRIVATE_KEY_PATH;
  const groupId = env.ASC_BETA_GROUP_ID || "";
  return issuer && keyId && keyPath ? { issuer, keyId, keyPath, groupId } : null;
}

const b64url = (b: Buffer | string) => Buffer.from(b).toString("base64url");

/** A 10-minute ES256 token, as App Store Connect asks for. */
async function token(cfg: TestflightConfig): Promise<string> {
  const key = await readFile(cfg.keyPath, "utf8");
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "ES256", kid: cfg.keyId, typ: "JWT" }));
  const body = b64url(JSON.stringify({ iss: cfg.issuer, iat: now, exp: now + 600, aud: "appstoreconnect-v1" }));
  const sig = createSign("SHA256").update(`${head}.${body}`).sign({ key, dsaEncoding: "ieee-p1363" });
  return `${head}.${body}.${b64url(sig)}`;
}

async function call(cfg: TestflightConfig, method: string, path: string, json?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${await token(cfg)}`, "Content-Type": "application/json" },
    body: json === undefined ? undefined : JSON.stringify(json),
    signal: AbortSignal.timeout(20_000),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  return { status: res.status, data };
}

/** Apple's own words for a failed call, for the log and the notification. */
function why(r: { status: number; data: { errors?: { title?: string; detail?: string }[] } | null }): string {
  const e = r.data?.errors?.[0];
  return `HTTP ${r.status}${e ? `: ${e.detail || e.title}` : ""}`;
}

/**
 * Puts one Apple ID in the group. A new tester is created in it; one Apple
 * already knows (from another group or an earlier try) is added to it. Safe to
 * repeat. Returns "added" or "already" (was a tester before), or throws.
 */
export async function inviteTester(
  cfg: TestflightConfig,
  t: { email: string; firstName?: string; lastName?: string },
): Promise<"added" | "already"> {
  if (!cfg.groupId) throw new Error("ASC_BETA_GROUP_ID is not set");
  const attributes: Record<string, string> = { email: t.email };
  if (t.firstName) attributes.firstName = t.firstName;
  if (t.lastName) attributes.lastName = t.lastName;

  const made = await call(cfg, "POST", "/betaTesters", {
    data: {
      type: "betaTesters",
      attributes,
      relationships: { betaGroups: { data: [{ type: "betaGroups", id: cfg.groupId }] } },
    },
  });
  if (made.status === 201) return "added";
  if (made.status !== 409) throw new Error(`TestFlight: ${why(made)}`);

  // Already a tester somewhere on the team: find them and add them to this group.
  const found = await call(cfg, "GET", `/betaTesters?filter[email]=${encodeURIComponent(t.email)}&limit=1`);
  const id = found.data?.data?.[0]?.id;
  if (found.status !== 200 || !id) throw new Error(`TestFlight lookup: ${why(found)}`);
  const linked = await call(cfg, "POST", `/betaGroups/${cfg.groupId}/relationships/betaTesters`, {
    data: [{ type: "betaTesters", id }],
  });
  if (linked.status !== 204) throw new Error(`TestFlight group: ${why(linked)}`);
  return "already";
}

/** Every tester group on the team, with its app, for choosing ASC_BETA_GROUP_ID. */
export async function listGroups(cfg: TestflightConfig) {
  const r = await call(cfg, "GET", "/betaGroups?include=app&fields[apps]=name,bundleId&limit=200");
  if (r.status !== 200) throw new Error(`TestFlight groups: ${why(r)}`);
  const apps = new Map<string, string>(
    (r.data.included || []).map((a: { id: string; attributes: { name: string; bundleId: string } }) => [
      a.id,
      `${a.attributes.name} (${a.attributes.bundleId})`,
    ]),
  );
  return r.data.data.map(
    (g: { id: string; attributes: { name: string; isInternalGroup: boolean }; relationships: { app: { data: { id: string } } } }) => ({
      id: g.id,
      name: g.attributes.name,
      internal: g.attributes.isInternalGroup,
      app: apps.get(g.relationships.app.data.id) || "?",
    }),
  );
}

/** "Ada Love Lace" → first "Ada", last "Love Lace". */
export function splitName(name: string): { firstName?: string; lastName?: string } {
  const [first, ...rest] = name.split(/\s+/).filter(Boolean);
  return { firstName: first, lastName: rest.join(" ") || undefined };
}
