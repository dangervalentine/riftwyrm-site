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
 * --dragon-card  the hero's Dragon Card in layers, as drawn by this site's
 *            scripts/dragon_card.gd (default <game>/build/site-dragon-card; make
 *            it from the game's folder with
 *            godot --path . --always-on-top -s <site>/scripts/dragon_card.gd -- build/site-dragon-card fire)
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
  // The shapes a Region Card prints its badges in, and every Trait's and Obstacle's mark.
  "attack_badge", "time_badge",
  "blight", "chill", "lumbering", "volley", "climb", "crumbling",
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
  const out = { game: process.env.GAME_DIR || join(SITE, "..", "dragon-hunter"), version: null, cards: null, dragonCard: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--game") out.game = argv[++i];
    else if (a === "--version") out.version = argv[++i];
    else if (a === "--cards") out.cards = argv[++i];
    else if (a === "--dragon-card") out.dragonCard = argv[++i];
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
/**
 * The light each painted figure stands in, as the game sets it on its scene
 * (ENEMY_LIGHT and DRAGON_LIGHT in the game's ui/model/art.gd): a fill colour
 * and how far it pulls the figure toward it, and a rim of light, its colour,
 * strength, the direction it comes from and its width as a share of the art.
 */
function sceneLights(game) {
  const src = readFileSync(join(game, "ui", "model", "art.gd"), "utf8");
  const table = (name) => {
    const start = src.indexOf(`const ${name} := {`);
    if (start < 0) fail(`No ${name} in ui/model/art.gd.`);
    const body = src.slice(start, src.indexOf("\n}", start));
    const out = {};
    const entry = /"([\w-]+)": \{"fill": "([0-9a-f]{6})", "fill_amount": ([\d.]+), "rim": "([0-9a-f]{6})", "rim_amount": ([\d.]+),\s*"rim_from": Vector2\(([-\d.]+), ([-\d.]+)\), "rim_width": ([\d.]+)\}/g;
    for (const m of body.matchAll(entry))
      out[m[1]] = { fill: m[2], fillAmount: +m[3], rim: m[4], rimAmount: +m[5], from: [+m[6], +m[7]], rimWidth: +m[8] };
    return out;
  };
  return { enemies: table("ENEMY_LIGHT"), dragons: table("DRAGON_LIGHT") };
}

const hex = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

/**
 * A figure lit as the game lights it on its scene, by the same sums as its
 * creature shader (ui/fx/shaders/creature_idle.gdshader): its colours pulled
 * toward the scene's fill, keeping their lightness, then a rim of light added
 * along the edges that face where the light comes from. Done once here, at the
 * art's full size, so the site serves the lit picture.
 */
async function litFigure(src, light, width) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const out = Buffer.from(data);
  if (light) {
    const fill = hex(light.fill);
    const rim = hex(light.rim);
    const len = Math.hypot(light.from[0], light.from[1]) || 1;
    // The rim's reach in pixels; the shader's UV runs 0..1 across each side.
    const dx = (light.from[0] / len) * light.rimWidth * w;
    const dy = (light.from[1] / len) * light.rimWidth * h;
    const alphaAt = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : data[(Math.round(y) * w + Math.round(x)) * 4 + 3] / 255);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const a = data[i + 3] / 255;
        if (a === 0) continue;
        let c = [data[i] / 255, data[i + 1] / 255, data[i + 2] / 255];
        if (light.fillAmount > 0) {
          const lum = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
          c = c.map((v, k) => {
            const lit = Math.min(1, Math.max(0, v * fill[k] * 1.6 * 0.65 + lum * fill[k] * 1.8 * 0.35));
            return v + (lit - v) * light.fillAmount;
          });
        }
        if (light.rimAmount > 0) {
          let open = 0;
          for (let k = 1; k <= 4; k++) open = Math.max(open, (1 - alphaAt(x + (dx * k) / 4, y + (dy * k) / 4)) * (1 - (k - 1) * 0.2));
          c = c.map((v, k) => Math.min(1, v + rim[k] * open * light.rimAmount));
        }
        out[i] = Math.round(c[0] * 255);
        out[i + 1] = Math.round(c[1] * 255);
        out[i + 2] = Math.round(c[2] * 255);
      }
    }
  }
  return sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 90 })
    .toBuffer();
}

async function cutCard(src, width) {
  const trimmed = await sharp(src).trim({ threshold: 6 }).resize({ width, withoutEnlargement: true }).toBuffer();
  const { width: w, height: h } = await sharp(trimmed).metadata();
  const r = Math.round(w * 0.04);
  const mask = Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}"/></svg>`);
  return sharp(trimmed).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).webp({ quality: 86, alphaQuality: 95 }).toBuffer();
}

/** The Dragon Card with its lair empty, its corners rounded as the game rounds them. */
async function roundCard(src, radius) {
  const { width: w, height: h } = await sharp(src).metadata();
  const r = Math.round(w * radius);
  const mask = Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}"/></svg>`);
  return sharp(src).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).webp({ quality: 86, alphaQuality: 95 }).toBuffer();
}

/** The Dragon Card's figures alone: what differs between the card drawn with them
 * and without them, each pixel as opaque as it differs (fully past 30 of 255). */
async function figuresOnly(withThem, without) {
  const a = await sharp(withThem).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(without).ensureAlpha().raw().toBuffer();
  const { width, height } = a.info;
  const out = Buffer.from(a.data);
  for (let i = 0; i < width * height; i++) {
    const d = Math.max(Math.abs(a.data[i * 4] - b[i * 4]), Math.abs(a.data[i * 4 + 1] - b[i * 4 + 1]), Math.abs(a.data[i * 4 + 2] - b[i * 4 + 2]));
    out[i * 4 + 3] = Math.min(255, Math.round((d * 255) / 30));
  }
  return sharp(out, { raw: { width, height, channels: 4 } }).webp({ quality: 88, alphaQuality: 90 }).toBuffer();
}

function plan(game, version, cardsDir, dragonCardDir) {
  const shots = join(game, "build", "app-store", version);
  const cards = cardsDir ?? join(game, "build", "card-shots");
  const art = join(game, "art");
  const jobs = [];
  const add = (key, src, out, make) => jobs.push({ key, src, out, make });
  const lights = sceneLights(game);

  for (const [file, id] of SCREENSHOTS)
    add(`screenshots.${id}`, join(shots, "iphone-6.9", `${file}.png`), `public/media/screenshots/${id}.webp`,
      (s) => s.resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 80 }));

  for (const id of DRAGONS) {
    // Every place the site shows a dragon's body, it stands in its own lair: lit as the game lights it there.
    add(`dragons.${id}.art`, join(art, "painted", "dragons", `dragon_${id}.png`), `public/media/dragons/${id}.webp`,
      { lit: lights.dragons[`dragon_${id}`], width: 1024 });
    add(`dragons.${id}.head`, join(art, "painted", "dragons", `dragon_${id}-head.png`), `public/media/dragons/${id}-head.webp`,
      (s) => s.resize({ width: 512, withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 90 }));
    add(`dragons.${id}.lair`, join(art, "painted", "lairs", `dragon_${id}.png`), `public/media/dragons/${id}-lair.webp`,
      (s) => s.resize({ width: 832, withoutEnlargement: true }).webp({ quality: 78 }));
  }

  for (const name of JOURNEYS)
    add(`journeys.${name}`, join(art, "painted", "journeys", `${name}.png`), `public/media/world/journey-${name}.webp`,
      (s) => s.resize({ width: 420, withoutEnlargement: true }).webp({ quality: 78 }));

  // The hero's backdrop, as the game's dragon screen shows a Journey painting before a dragon
  // is chosen: full size, at its brightness of 0.45 (baked in, which also makes them smaller).
  for (const name of JOURNEYS)
    add(`scenes.${name}`, join(art, "painted", "journeys", `${name}.png`), `public/media/scenes/${name}.webp`,
      (s) => s.resize({ width: 896, withoutEnlargement: true }).linear(0.45, 0).webp({ quality: 72 }));

  for (const name of ENEMIES) {
    add(`enemies.${name}.art`, join(art, "painted", "enemies", `${name}.png`), `public/media/world/enemy-${name}.webp`,
      { lit: lights.enemies[name], width: 420 });
    add(`enemies.${name}.backdrop`, join(art, "painted", "backdrops", `${name}.png`), `public/media/world/backdrop-${name}.webp`,
      (s) => s.resize({ width: 600, withoutEnlargement: true }).webp({ quality: 76 }));
  }

  // The share image is drawn at build time by a renderer that reads PNG, not WebP.
  for (const n of REGION_CARDS)
    add(`cards.region${n}`, join(cards, "region", `region_${n}.png`), `public/media/cards/region-${n}.webp`, { card: 560 });
  for (const [file, name] of ADEPT_CARDS)
    add(`cards.${name.replace(/-/g, "_")}`, join(cards, "adept", `${file}.png`), `public/media/cards/adept-${name}.webp`, { card: 400 });

  // The hero's Dragon Card, in layers: the card, the dragon over it, its figures over that.
  const hero = dragonCardDir ?? join(game, "build", "site-dragon-card");
  const place = join(hero, "place.json");
  add("hero.card", join(hero, "card.png"), "public/media/hero/dragon-card.webp", { fn: () => roundCard(join(hero, "card.png"), JSON.parse(readFileSync(place, "utf8")).radius) });
  add("hero.figures", join(hero, "figures.png"), "public/media/hero/dragon-card-figures.webp", { fn: () => figuresOnly(join(hero, "card.png"), join(hero, "figures.png")) });
  add("hero.dragon", join(hero, "dragon.png"), "public/media/hero/dragon.webp",
    (s) => s.webp({ quality: 84, alphaQuality: 90 }));
  add("hero.place", place, null, "place");

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

  return { jobs, manifest: join(shots, "manifest.txt"), place };
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
      traitIcon: e.quirk ?? null,
    })),
    journeys: r.journeys.map((j) => ({ mp: j.mp, delay: j.time_cost, xp: j.xp, obstacle: term(j.obstacle), obstacleIcon: j.obstacle ?? null })),
  }));
}

/**
 * Where each foe stands on its Region Card panel, as the game places it
 * (trial_face.gd enemy_crop): back, how far left of the art's middle it is set,
 * as a share of the art's width (T.ENEMY_SET_BACK less its Art.enemy_shift);
 * size, how large it is drawn (Art.enemy_size), grown about its feet; box, the
 * figure's own box in its square of art (figure_bounds: every pixel more than
 * 0.2 opaque), as shares of the square: left, top, width, height.
 */
async function enemyPlaces(game) {
  const art = readFileSync(join(game, "ui", "model", "art.gd"), "utf8");
  const tokens = readFileSync(join(game, "ui", "theme", "tokens.gd"), "utf8");
  const table = (name) => {
    const start = art.indexOf(`const ${name} := {`);
    if (start < 0) fail(`No ${name} in ui/model/art.gd.`);
    const body = art.slice(start, art.indexOf("\n}", start));
    return Object.fromEntries([...body.matchAll(/"([\w-]+)": (-?\d+)/g)].map((m) => [m[1], +m[2] / 100]));
  };
  const setBack = /const ENEMY_SET_BACK := ([\d.]+)/.exec(tokens)?.[1];
  if (!setBack) fail("No ENEMY_SET_BACK in ui/theme/tokens.gd.");
  const size = table("ENEMY_SIZE");
  const shift = table("ENEMY_SHIFT");
  const round = (v) => Math.round(v * 1e4) / 1e4;
  const out = {};
  for (const name of ENEMIES) {
    const { data, info } = await sharp(join(game, "art", "painted", "enemies", `${name}.png`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let [x0, y0, x1, y1] = [info.width, info.height, -1, -1];
    for (let y = 0; y < info.height; y += 2)
      for (let x = 0; x < info.width; x += 2)
        if (data[(y * info.width + x) * 4 + 3] > 0.2 * 255) {
          x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
        }
    const box = x1 < 0 ? [0, 0, 1, 1] : [x0 / info.width, y0 / info.height, (x1 - x0) / info.width, (y1 - y0) / info.height];
    out[name] = { back: round(+setBack - (shift[name] ?? 0)), size: size[name] ?? 1, box: box.map(round) };
  }
  return out;
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
    body("scenes", media.scenes),
    body("enemies", media.enemies),
    body("cards", media.cards),
    "/** The hero's Dragon Card in layers, and where the dragon stands on it: art is its\n * box (left, top, width, height) and cutTop the foot of the name band, as shares\n * of the card's width and height; radius is the corners' share of its width. */",
    body("hero", media.hero),
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
  const { jobs, manifest, place } = plan(args.game, version, args.cards && resolve(args.cards), args.dragonCard && resolve(args.dragonCard));

  const missing = jobs.map((j) => j.src).concat(manifest, join(args.game, "data", "cards.json"), join(args.game, "data", "text.json")).filter((p) => !existsSync(p));
  if (missing.length) fail(`Missing source file(s), nothing written:\n  ${[...new Set(missing)].join("\n  ")}`);

  const made = /made (\d{4}-\d{2}-\d{2})/.exec(readFileSync(manifest, "utf8"))?.[1] ?? "unknown";

  // Render everything in memory first, so a failure part-way writes nothing.
  const rendered = [];
  for (const job of jobs) {
    if (job.make === "place") continue;
    let data;
    if (job.make === "copy") data = readFileSync(job.src);
    else if (job.make === "ico") data = await makeIco(job.src);
    else if (job.make.fn) data = await job.make.fn();
    else if (job.make.card) data = await cutCard(job.src, job.make.card);
    else if ("lit" in job.make) data = await litFigure(job.src, job.make.lit, job.make.width);
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

  const p = JSON.parse(readFileSync(place, "utf8"));
  media.hero.place = { art: p.art.map((v) => Math.round(v * 1e5) / 1e5), cutTop: Math.round(p.cut_top * 1e5) / 1e5, radius: Math.round(p.radius * 1e5) / 1e5 };
  for (const [name, place] of Object.entries(await enemyPlaces(args.game))) media.enemies[name].place = place;
  const generated = mediaModule(media, { gameVersion: version, made }, regionStats(args.game));
  const changed = writeIfChanged("components/media.generated.ts", Buffer.from(generated));
  written += changed ? 1 : 0;
  console.log(`${changed ? "wrote " : "same  "} components/media.generated.ts`);
  console.log(`\n${rendered.length + 1} files from store run ${version} (made ${made}), ${written} changed, ${(total / 1024 / 1024).toFixed(1)} MB in all.`);
}

main().catch((err) => fail(err.stack || String(err)));
