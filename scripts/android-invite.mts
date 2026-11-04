/**
 * Emails the Android beta invitation (group and opt-in links) to the Google
 * accounts named, using their names from the beta list if they signed up:
 *
 *   npm run android-invite -- someone@gmail.com [another@gmail.com ...]
 *
 * New sign-ups get it automatically; this is for anyone who signed up before
 * that, or whose email failed. Only the addresses given are mailed.
 */
import nextEnv from "@next/env";
import { readSignups } from "../lib/beta.ts";
import { sendAndroidInvite } from "../lib/notify.ts";

nextEnv.loadEnvConfig(process.cwd());
const to = process.argv.slice(2).map((a) => a.trim().toLowerCase()).filter(Boolean);
if (!to.length) {
  console.error("Usage: npm run android-invite -- someone@gmail.com [...]");
  process.exit(1);
}
const names = new Map((await readSignups()).filter((s) => s.google).map((s) => [s.google, s.name]));
let failed = 0;
for (const email of to) {
  try {
    if (!(await sendAndroidInvite(email, names.get(email) || ""))) {
      console.error("Set GMAIL_USER and GMAIL_APP_PASSWORD first.");
      process.exit(1);
    }
    console.log(`sent  ${email}${names.has(email) ? "" : "  (not on the beta list)"}`);
  } catch (e) {
    failed++;
    console.error(`FAILED  ${email}  ${e instanceof Error ? e.message : e}`);
  }
}
process.exit(failed ? 1 : 0);
