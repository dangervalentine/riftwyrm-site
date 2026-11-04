/**
 * TestFlight from the command line, with the same settings as the site
 * (environment or .env.local; see lib/testflight.ts):
 *
 *   npm run testflight -- groups   list the team's tester groups and their ids
 *   npm run testflight -- sync     put every Apple ID on the beta list in the group
 *                                  (safe to repeat; for sign-ups made before the
 *                                  key was set, or whose invite failed)
 */
import nextEnv from "@next/env";
import { readSignups } from "../lib/beta.ts";
import { inviteTester, listGroups, splitName, testflightConfig } from "../lib/testflight.ts";

nextEnv.loadEnvConfig(process.cwd());
const cfg = testflightConfig();
if (!cfg) {
  console.error("Set ASC_ISSUER_ID, ASC_KEY_ID and ASC_PRIVATE_KEY_PATH (see lib/testflight.ts).");
  process.exit(1);
}

const cmd = process.argv[2];
if (cmd === "groups") {
  for (const g of await listGroups(cfg)) {
    console.log(`${g.id}  ${g.name}  [${g.internal ? "internal: App Store Connect users only" : "external"}]  ${g.app}`);
  }
} else if (cmd === "sync") {
  const seen = new Set<string>();
  let failed = 0;
  for (const s of await readSignups()) {
    if (!s.apple || seen.has(s.apple)) continue;
    seen.add(s.apple);
    try {
      console.log(`${await inviteTester(cfg, { email: s.apple, ...splitName(s.name) })}  ${s.apple}`);
    } catch (e) {
      failed++;
      console.error(`FAILED  ${s.apple}  ${e instanceof Error ? e.message : e}`);
    }
  }
  console.log(`${seen.size} Apple IDs, ${failed} failed.`);
  process.exit(failed ? 1 : 0);
} else {
  console.error("Usage: npm run testflight -- groups | sync");
  process.exit(1);
}
