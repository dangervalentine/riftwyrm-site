#!/usr/bin/env node
/**
 * Turns the beta sign-ups (lib/beta.ts) into the two lists the stores import:
 *
 *   testflight.csv   First name, last name, email: App Store Connect →
 *                    TestFlight → a tester group → Add Testers → Import from CSV.
 *   google-play.csv  One email per line: Play Console → Testing → Closed
 *                    testing → Testers → an email list → Upload CSV file.
 *
 *   npm run beta-export                 # writes to beta-export/ (git ignores it)
 *   npm run beta-export -- --out <dir>
 *
 * Reads BETA_SIGNUPS_FILE if set, as the site does. Each address is listed once.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const outAt = args.indexOf("--out");
const out = path.resolve(outAt >= 0 ? args[outAt + 1] : "beta-export");
const file = path.resolve(process.env.BETA_SIGNUPS_FILE || path.join("data", "beta-signups.jsonl"));

let text;
try {
  text = await readFile(file, "utf8");
} catch (e) {
  if (e.code !== "ENOENT") throw e;
  console.error(`No sign-ups yet (${file} does not exist).`);
  process.exit(1);
}

const rows = text.split("\n").flatMap((l) => {
  try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; }
});

/** A CSV cell: quoted when it holds a comma, quote or line break. */
const cell = (s) => (/[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s);

const apple = new Map();
const google = new Set();
for (const r of rows) {
  if (r.apple && !apple.has(r.apple)) {
    const [first = "", ...rest] = (r.name || "").split(/\s+/).filter(Boolean);
    apple.set(r.apple, [first, rest.join(" "), r.apple].map(cell).join(","));
  }
  if (r.google) google.add(r.google);
}

await mkdir(out, { recursive: true });
await writeFile(path.join(out, "testflight.csv"), [...apple.values()].map((l) => l + "\n").join(""));
await writeFile(path.join(out, "google-play.csv"), [...google].map((e) => cell(e) + "\n").join(""));
console.log(`${rows.length} sign-ups: ${apple.size} Apple IDs, ${google.size} Google accounts → ${out}`);
