#!/usr/bin/env node
/**
 * Copies the game's screenshots, painted art and icons into the site and
 * makes them web-sized. The game repository is the source of truth; the
 * outputs are committed so the site builds without it.
 *
 *   npm run sync-assets [-- --game <dir>] [-- --version <x.y.z>]
 *
 * --game     the game repository (default $GAME_DIR, else ../dragon-hunter)
 * --version  the App Store screenshot run to use, a folder of
 *            build/app-store/ (default: the newest version folder)
 * --cards    the printed cards, as drawn by the game's card tool
 *            (default <game>/build/card-shots; make them with
 *            godot --path . --always-on-top -s tools/card_shots.gd -- build/card-shots adept region)
 *
 * Every input is checked before anything is written: if one is missing the
 * script names it and exits 1 with the site untouched. Output is identical
 * from run to run for the same inputs (no clock times are written).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ---------------------------------------------------------------- selection

/** The App Store shots, in the order the site shows them. */
const SCREENSHOTS = [
  ["01-title", "title"],
  ["02-trial", "trial"],
  ["03-dragons", "dragons"],
  ["04-showdown", "showdown"],
  ["05-won", "won"],
];
/** In unlock order. */
const DRAGONS = ["lightning", "water", "fire", "shadow"];
/** Every road and foe, region by region, as the game's ui/model/art.gd lists them. */
const JOURNEYS = [
  "peaks", "waterfall", "mountain-road", "cave-entrance",
  "swamp", "river", "willow-tree", "cliff-crossing",
  "volcano", "desert", "lava", "underground-cave",
  "rope-bridge", "stone-path", "burning-forest", "forest-entrance",
];
const ENEMIES = [
  "panda-fighter", "lion-archer", "crane-monk", "monkey-brawler",
  "marsh-treant", "axe-gnome", "club-ogre", "horned-goblin",
  "twin-ghoul", "twin-ogre", "naga", "boar-shaman",
  "goblin-hexer", "hedge-wizard", "antler-horror", "gath-brute",
];
const ICONS = [
  "crown", "level_up", "book", "trophy", "star", "reshuffle",
  // The stats on a foe or road, and the four Essences.
  "hp", "initiative", "attack", "armor", "mp", "time", "xp",
  "fire", "water", "lightning", "shadow",
];
/** The printed cards. Regions in road order, then a hand of Adept Cards (one
 * per Essence) and the two fire cards fanned under the hero's deck. */
const REGION_CARDS = [1, 2, 3, 4];
const ADEPT_CARDS = [
  ["02_C15", "ember-dash"],
  ["06_C06", "lightning-step"],
  ["11_C11", "shadow-stride"],
  ["13_C02", "blinding-blade"],
  ["01_C14", "cold-blaze"],
  ["03_C16", "static-rush"],
];

// ---------------------------------------------------------------- arguments

function parseArgs(argv) {
  const out = { game: process.env.GAME_DIR || join(SITE, "..", "dragon-hunter"), version: null, cards: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--game") out.game = argv[++i];
    else if (a === "--version") out.version = argv[++i];
    else if (a === "--cards") out.cards = argv[++i];
    else fail(`Unknown argument: ${a} (see --help)`);
  }
  out.game = resolve(out.game ?? "");
  return out;
}

function fail(message) {
  console.error(`sync-assets: ${message}`);
  process.exit(1);
}

const HELP = readFileSync(fileURLToPath(import.meta.url), "utf8")
  .split("\n").slice(2, 18).map((l) => l.replace(/^ \* ?/, "")).join("\n");

// ---------------------------------------------------------------- inputs

function semverKey(v) {
  return v.split(".").map((n) => n.padStart(6, "0")).join(".");
}

function pickVersion(game, wanted) {
  const root = join(game, "build", "app-store");
  if (!existsSync(root)) fail(`No store screenshots at ${root}. Run scripts/dev store in the game first.`);
  const versions = readdirSync(root).filter((d) => /^\d+\.\d+\.\d+$/.test(d));
  if (wanted) {
    if (!versions.includes(wanted)) fail(`No store screenshot run ${wanted} in ${root} (have: ${versions.join(", ") || "none"}).`);
    return wanted;
  }
  if (versions.length === 0) fail(`No versioned store screenshot run in ${root}.`);
  return versions.sort((a, b) => semverKey(a).localeCompare(semverKey(b))).at(-1);
}

/** Every job: a source file, an output path under the site, and how to make it. */
/** A card render cut from its table: the margin trimmed, the corners rounded
 * to transparent so cards can overlap on any ground. */
async function cutCard(src, width) {
  const trimmed = await sharp(src).trim({ threshold: 6 }).resize({ width, withoutEnlargement: true }).toBuffer();
  const { width: w, height: h } = await sharp(trimmed).metadata();
  const r = Math.round(w * 0.04);
  const mask = Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}"/></svg>`);
  return sharp(trimmed).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).webp({ quality: 86, alphaQuality: 95 }).toBuffer();
}

function plan(game, version, cardsDir) {
  const shots = join(game, "build", "app-store", version);
  const cards = cardsDir ?? join(game, "build", "card-shots");
  const art = join(game, "art");
  const jobs = [];
  const add = (key, src, out, make) => jobs.push({ key, src, out, make });

  for (const [file, id] of SCREENSHOTS)
    add(`screenshots.${id}`, join(shots, "iphone-6.9", `${file}.png`), `public/media/screenshots/${id}.webp`,
      (s) => s.resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 80 }));

  for (const id of DRAGONS) {
    add(`dragons.${id}.art`, join(art, "painted", "dragons", `dragon_${id}.png`), `public/media/dragons/${id}.webp`,
      (s) => s.resize({ width: 1024, withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 90 }));
    add(`dragons.${id}.head`, join(art, "painted", "dragons", `dragon_${id}-head.png`), `public/media/dragons/${id}-head.webp`,
      (s) => s.resize({ width: 512, withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 90 }));
    add(`dragons.${id}.lair`, join(art, "painted", "lairs", `dragon_${id}.png`), `public/media/dragons/${id}-lair.webp`,
      (s) => s.resize({ width: 832, withoutEnlargement: true }).webp({ quality: 78 }));
  }

  for (const name of JOURNEYS)
    add(`journeys.${name}`, join(art, "painted", "journeys", `${name}.png`), `public/media/world/journey-${name}.webp`,
      (s) => s.resize({ width: 420, withoutEnlargement: true }).webp({ quality: 78 }));

  for (const name of ENEMIES) {
    add(`enemies.${name}.art`, join(art, "painted", "enemies", `${name}.png`), `public/media/world/enemy-${name}.webp`,
      (s) => s.resize({ width: 420, withoutEnlargement: true }).webp({ quality: 80, alphaQuality: 90 }));
    add(`enemies.${name}.backdrop`, join(art, "painted", "backdrops", `${name}.png`), `public/media/world/backdrop-${name}.webp`,
      (s) => s.resize({ width: 600, withoutEnlargement: true }).webp({ quality: 76 }));
  }

  // The share image is drawn at build time by a renderer that reads PNG, not WebP.
  for (const n of REGION_CARDS)
    add(`cards.region${n}`, join(cards, "region", `region_${n}.png`), `public/media/cards/region-${n}.webp`, { card: 560 });
  for (const [file, name] of ADEPT_CARDS)
    add(`cards.${name.replace(/-/g, "_")}`, join(cards, "adept", `${file}.png`), `public/media/cards/adept-${name}.webp`, { card: 400 });

  add("og.lair", join(art, "painted", "lairs", "dragon_fire.png"), "assets/og-lair.png",
    (s) => s.resize({ width: 400 }).png({ compressionLevel: 9 }));
  add("og.dragon", join(art, "painted", "dragons", "dragon_fire.png"), "assets/og-dragon.png",
    (s) => s.resize({ width: 560 }).png({ compressionLevel: 9, palette: true, quality: 90 }));

  // App icons from the 1024 store icon.
  const icon = join(shots, "AppStore-icon-1024.png");
  add("icons.apple", icon, "app/apple-icon.png", (s) => s.resize(180, 180).flatten().png({ compressionLevel: 9 }));
  add("icons.192", icon, "public/icons/icon-192.png", (s) => s.resize(192, 192).png({ compressionLevel: 9 }));
  add("icons.512", icon, "public/icons/icon-512.png", (s) => s.resize(512, 512).png({ compressionLevel: 9 }));
  add("icons.ico", icon, "app/favicon.ico", "ico");

  for (const name of ICONS)
    add(`ui.${name}`, join(art, "icons", `${name}.svg`), `public/media/icons/${name}.svg`, "copy");

  return { jobs, manifest: join(shots, "manifest.txt") };
}

// ---------------------------------------------------------------- outputs

/** A PNG-in-ICO file: a 6-byte header, a 16-byte entry per image, the PNGs. */
async function makeIco(src) {
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map((n) => sharp(src).resize(n, n).ensureAlpha().png({ compressionLevel: 9, palette: false }).toBuffer()));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = 6 + 16 * sizes.length;
  const entries = sizes.map((n, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(n, 0);
    e.writeUInt8(n, 1);
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(pngs[i].length, 8);
    e.writeUInt32LE(offset, 12);
    offset += pngs[i].length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...pngs]);
}

/** Writes only when the bytes differ, through a temp file renamed into place. */
function writeIfChanged(path, data) {
  const full = join(SITE, path);
  if (existsSync(full) && readFileSync(full).equals(data)) return false;
  mkdirSync(dirname(full), { recursive: true });
  const tmp = `${full}.tmp-${process.pid}`;
  writeFileSync(tmp, data);
  renameSync(tmp, full);
  return true;
}

function setPath(obj, key, value) {
  const parts = key.split(".");
  let o = obj;
  for (const p of parts.slice(0, -1)) o = o[p] ??= {};
  o[parts.at(-1)] = value;
}

function sortKeys(v) {
  if (Array.isArray(v) || v === null || typeof v !== "object") return v;
  return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]));
}

/**
 * Every foe's and road's printed stats, region by region, in card order, from
 * the game's data/cards.json, with each Trait and Obstacle named as the game
 * names it (data/text.json, the term.<id> wording it shows).
 */
function regionStats(game) {
  const cards = JSON.parse(readFileSync(join(game, "data", "cards.json"), "utf8"));
  const text = JSON.parse(readFileSync(join(game, "data", "text.json"), "utf8")).keys;
  const term = (id) => {
    if (!id) return null;
    const name = text[`term.${id}`]?.official;
    if (!name) fail(`No name for "${id}" in data/text.json (term.${id}).`);
    return name;
  };
  return cards.regions.map((r) => ({
    region: r.region,
    enemies: r.enemies.map((e) => ({
      hp: e.hp,
      speed: e.initiative,
      attack: e.attack,
      armor: e.armor,
      xp: e.xp,
      trait: term(e.quirk),
    })),
    journeys: r.journeys.map((j) => ({ mp: j.mp, delay: j.time_cost, xp: j.xp, obstacle: term(j.obstacle) })),
  }));
}

function mediaModule(media, source, stats) {
  const body = (name, value) => `export const ${name} = ${JSON.stringify(sortKeys(value), null, 2)} as const;\n`;
  return [
    "// Generated by scripts/sync-assets.mjs from the game repository. Do not edit.",
    "// Every image the site shows from the game, with its real pixel size.",
    "",
    "export type MediaImage = { src: string; width: number; height: number };",
    "",
    body("source", source),
    body("screenshots", media.screenshots),
    body("dragons", media.dragons),
    body("journeys", media.journeys),
    body("enemies", media.enemies),
    body("cards", media.cards),
    "/** Each Region Card's foes and roads, in card order, as printed. */",
    `export const regionStats = ${JSON.stringify(stats, null, 2)} as const;\n`,
  ].join("\n");
}

// ---------------------------------------------------------------- main

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }
  if (!existsSync(args.game)) fail(`Game repository not found at ${args.game}. Pass --game <dir> or set GAME_DIR.`);
  const version = pickVersion(args.game, args.version);
  const { jobs, manifest } = plan(args.game, version, args.cards && resolve(args.cards));

  const missing = jobs.map((j) => j.src).concat(manifest, join(args.game, "data", "cards.json"), join(args.game, "data", "text.json")).filter((p) => !existsSync(p));
  if (missing.length) fail(`Missing source file(s), nothing written:\n  ${[...new Set(missing)].join("\n  ")}`);

  const made = /made (\d{4}-\d{2}-\d{2})/.exec(readFileSync(manifest, "utf8"))?.[1] ?? "unknown";

  // Render everything in memory first, so a failure part-way writes nothing.
  const rendered = [];
  for (const job of jobs) {
    let data;
    if (job.make === "copy") data = readFileSync(job.src);
    else if (job.make === "ico") data = await makeIco(job.src);
    else if (job.make.card) data = await cutCard(job.src, job.make.card);
    else data = await job.make(sharp(job.src)).toBuffer();
    rendered.push({ ...job, data });
  }

  const media = {};
  let written = 0;
  let total = 0;
  for (const job of rendered) {
    const changed = writeIfChanged(job.out, job.data);
    written += changed ? 1 : 0;
    total += job.data.length;
    console.log(`${changed ? "wrote " : "same  "} ${job.out.padEnd(48)} ${(job.data.length / 1024).toFixed(0).padStart(5)} KB`);
    if (job.out.startsWith("public/media/") && !job.out.endsWith(".svg")) {
      const { width, height } = await sharp(job.data).metadata();
      setPath(media, job.key, { src: job.out.slice("public".length), width, height });
    }
  }

  const generated = mediaModule(media, { gameVersion: version, made }, regionStats(args.game));
  const changed = writeIfChanged("components/media.generated.ts", Buffer.from(generated));
  written += changed ? 1 : 0;
  console.log(`${changed ? "wrote " : "same  "} components/media.generated.ts`);
  console.log(`\n${rendered.length + 1} files from store run ${version} (made ${made}), ${written} changed, ${(total / 1024 / 1024).toFixed(1)} MB in all.`);
}

main().catch((err) => fail(err.stack || String(err)));
