import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Beta sign-ups are kept on the host that runs the site, one JSON object per
 * line, and nowhere else: no form service, no database. BETA_SIGNUPS_FILE
 * moves the file (keep it outside the clone so a redeploy cannot touch it);
 * by default it is data/beta-signups.jsonl, which git ignores.
 * `npm run beta-export` turns it into TestFlight and Google Play lists.
 */
export const signupsFile = path.resolve(
  process.env.BETA_SIGNUPS_FILE || path.join(process.cwd(), "data", "beta-signups.jsonl"),
);

export type Signup = {
  at: string;
  name: string;
  /** The Apple ID email TestFlight invites go to, or "". */
  apple: string;
  /** The Google account email Play testing is opened to, or "". */
  google: string;
};

/** Every line a sign-up was written as; lines that do not parse are skipped. */
export async function readSignups(): Promise<Signup[]> {
  let text = "";
  try {
    text = await readFile(signupsFile, "utf8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
  return text.split("\n").flatMap((line) => {
    try {
      return line.trim() ? [JSON.parse(line) as Signup] : [];
    } catch {
      return [];
    }
  });
}

/** Adds a sign-up, unless every address in it is already on the list. */
export async function addSignup(s: Signup): Promise<void> {
  const have = await readSignups();
  const known = (key: "apple" | "google") => !s[key] || have.some((h) => h[key] === s[key]);
  if (known("apple") && known("google")) return;
  await mkdir(path.dirname(signupsFile), { recursive: true });
  await appendFile(signupsFile, JSON.stringify(s) + "\n", "utf8");
}
