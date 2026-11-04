import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";

/**
 * Adds Android testers to the Google Group that Play's "Closed testing - Public
 * Beta" track takes its testers from, through the Cloud Identity Groups API, so
 * a tester never has to find the group and join it. Only a group on a domain
 * managed by Cloud Identity or Workspace has this API (not googlegroups.com).
 * Kept free of the "@/" alias so scripts can import it.
 *
 *   ANDROID_GROUP_EMAIL     the group, e.g. beta-android@dangervalentine.com
 *   ANDROID_GROUP_KEY_PATH  a service account's JSON key; the account holds the
 *                           Groups Editor admin role in the Admin console
 *
 * With either unset the feature is off and the tester is emailed the open
 * group's join link instead (lib/notify.ts).
 */
export type GroupConfig = { group: string; keyPath: string };

export function groupConfig(env: NodeJS.ProcessEnv = process.env): GroupConfig | null {
  const group = env.ANDROID_GROUP_EMAIL;
  const keyPath = env.ANDROID_GROUP_KEY_PATH;
  return group && keyPath ? { group, keyPath } : null;
}

const API = "https://cloudidentity.googleapis.com/v1";
const SCOPE = "https://www.googleapis.com/auth/cloud-identity.groups";
const b64url = (b: Buffer | string) => Buffer.from(b).toString("base64url");

/** An access token for the service account, from Google's token endpoint. */
async function token(keyPath: string): Promise<string> {
  const sa = JSON.parse(await readFile(keyPath, "utf8")) as { client_email: string; private_key: string };
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = b64url(
    JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 600 }),
  );
  const sig = createSign("RSA-SHA256").update(`${head}.${body}`).sign(sa.private_key);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${head}.${body}.${b64url(sig)}` }),
    signal: AbortSignal.timeout(20_000),
  });
  const json = (await res.json()) as { access_token?: string; error_description?: string; error?: string };
  if (!json.access_token) throw new Error(`Google sign-in: ${json.error_description || json.error || res.status}`);
  return json.access_token;
}

async function call(tok: string, method: string, path: string, body?: unknown) {
  const res = await fetch(`${API}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  return { status: res.status, data };
}

const why = (r: { status: number; data: { error?: { message?: string } } }) =>
  `HTTP ${r.status}${r.data.error?.message ? `: ${r.data.error.message}` : ""}`;

/** The group's resource name ("groups/…"), looked up once per process. */
let groupName: Promise<string> | null = null;
function lookup(cfg: GroupConfig, tok: string): Promise<string> {
  groupName ??= call(tok, "GET", `groups:lookup?groupKey.id=${encodeURIComponent(cfg.group)}`).then((r) => {
    if (r.status !== 200 || !r.data.name) {
      groupName = null;
      throw new Error(`Group lookup: ${why(r)}`);
    }
    return r.data.name as string;
  });
  return groupName;
}

/** Puts one Google account in the group. "added", or "already" a member; throws otherwise. */
export async function addToGroup(cfg: GroupConfig, email: string): Promise<"added" | "already"> {
  const tok = await token(cfg.keyPath);
  const name = await lookup(cfg, tok);
  const r = await call(tok, "POST", `${name}/memberships`, {
    preferredMemberKey: { id: email },
    roles: [{ name: "MEMBER" }],
  });
  if (r.status === 200) return "added";
  if (r.status === 409) return "already";
  throw new Error(`Group membership: ${why(r)}`);
}
