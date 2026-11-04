/**
 * The Android tester group from the command line, with the site's settings
 * (environment or .env.local; see lib/googleGroup.ts):
 *
 *   npm run android-group -- add someone@gmail.com   put one Google account in the group
 *   npm run android-group -- sync                    put every Android sign-up in it (safe to repeat)
 *
 * Adding sends nothing; `npm run android-invite -- <email>` mails the invitation.
 */
import nextEnv from "@next/env";
import { readSignups } from "../lib/beta.ts";
import { addToGroup, groupConfig } from "../lib/googleGroup.ts";

nextEnv.loadEnvConfig(process.cwd());
const cfg = groupConfig();
if (!cfg) {
  console.error("Set ANDROID_GROUP_EMAIL and ANDROID_GROUP_KEY_PATH (see lib/googleGroup.ts).");
  process.exit(1);
}
const [cmd, ...rest] = process.argv.slice(2);
let emails: string[];
if (cmd === "add" && rest.length) emails = rest.map((e) => e.trim().toLowerCase());
else if (cmd === "sync") emails = [...new Set((await readSignups()).map((s) => s.google).filter(Boolean))];
else {
  console.error("Usage: npm run android-group -- add <email> [...] | sync");
  process.exit(1);
}
let failed = 0;
for (const email of emails) {
  try {
    console.log(`${await addToGroup(cfg, email)}  ${email}`);
  } catch (e) {
    failed++;
    console.error(`FAILED  ${email}  ${e instanceof Error ? e.message : e}`);
  }
}
console.log(`${emails.length} Google accounts, ${failed} failed (${cfg.group}).`);
process.exit(failed ? 1 : 0);
