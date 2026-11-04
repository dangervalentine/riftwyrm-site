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
 *            godot --path . --always-on-top -s tools/card_shots.gd -- build/card-shots --scale 2 adept region dragon)
 *            and each Adept Card at every Level, for the strategy guide, with
 *            godot --path . -s tools/card_level_shots.gd -- build/card-shots --scale 2 adept
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
 * per Essence) and the cards fanned out from under the hero's deck. */
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
async function lightFigure(src, light) {
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
  return sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function litFigure(src, light, width, trim = false) {
  // Trimmed to the figure's own edges when asked, so the picture's corners are the figure's.
  const lit = trim ? await sharp(await lightFigure(src, light)).trim().toBuffer() : await lightFigure(src, light);
  return sharp(lit)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: ART_QUALITY, alphaQuality: 95 })
    .toBuffer();
}

/** A foe's panel is 0.445 of a Region Card's width by 0.22 of its height, the card 5 by 7
 * (region_card.gd LAYOUT); its art fills the panel right of the badges, from 0.17 of its width. */
const ENEMY_ASPECT = 0.445 / (0.22 * 1.4);
const ENEMY_ART_LEFT = 0.17;

/**
 * Where a foe's square of art lies in a picture of aspect `ratio`, as shares of
 * that picture (trial_face.gd enemy_crop, creature.gd art_rect): the picture's
 * shape cut from the square's full height, set back left of the middle, then
 * grown about the figure's feet by its size.
 */
function enemySquare(place, ratio) {
  let cw = ratio;
  let ch = 1;
  let cx = 0.5 - cw / 2 + cw * place.back;
  let cy = 0;
  const [bx, by, bw, bh] = place.box;
  if (place.size !== 1) {
    const fx = bx + bw / 2;
    const fy = by + bh;
    const ax = (fx - cx) / cw;
    const ay = (fy - cy) / ch;
    cw /= place.size;
    ch /= place.size;
    cx = fx - ax * cw;
    cy = fy - ay * ch;
  }
  return { left: -cx / cw, top: -cy / ch, width: 1 / cw, height: 1 / ch };
}

/**
 * A foe on its scene as one picture, so it arrives whole: its backdrop filling
 * a `width`-wide picture of the panel's shape, and in the art's part of it
 * (from `artLeft` of the width) a glow of its attack's Essence behind the
 * figure, lit as the game lights it, standing where the game stands it.
 */
async function enemyScene({ figure, backdrop, light, place, glow, artLeft, width }) {
  const W = width;
  const H = Math.round(W / ENEMY_ASPECT);
  const x0 = Math.round(W * artLeft);
  const aw = W - x0;
  const sq = enemySquare(place, aw / H);
  const layers = [];
  if (glow) {
    const [bx, by, bw, bh] = place.box;
    const reach = 0.35;
    const g = {
      x: (sq.left + (bx - bw * reach) * sq.width) * aw,
      y: (sq.top + (by - bh * reach) * sq.height) * H,
      w: bw * (1 + 2 * reach) * sq.width * aw,
      h: bh * (1 + 2 * reach) * sq.height * H,
    };
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${aw}" height="${H}"><defs><radialGradient id="g">` +
      `<stop offset="0" stop-color="#${glow}" stop-opacity="0.32"/><stop offset="1" stop-color="#${glow}" stop-opacity="0"/>` +
      `</radialGradient></defs><rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" fill="url(#g)"/></svg>`;
    layers.push({ input: Buffer.from(svg), left: x0, top: 0 });
  }
  // The figure, drawn at its size and cut to the art's part of the picture.
  const fw = Math.round(sq.width * aw);
  const fh = Math.round(sq.height * H);
  const fx = Math.round(sq.left * aw);
  const fy = Math.round(sq.top * H);
  const cut = { left: Math.max(0, -fx), top: Math.max(0, -fy) };
  cut.width = Math.min(fw, aw - fx) - cut.left;
  cut.height = Math.min(fh, H - fy) - cut.top;
  if (cut.width > 0 && cut.height > 0) {
    const drawn = await sharp(await lightFigure(figure, light)).resize(fw, fh, { kernel: "lanczos3" }).extract(cut).png().toBuffer();
    layers.push({ input: drawn, left: x0 + fx + cut.left, top: fy + cut.top });
  }
  return sharp(backdrop).resize(W, H, { fit: "cover" }).composite(layers).webp({ quality: ART_QUALITY }).toBuffer();
}

/** WebP quality for painted art and cards: high, as the site serves these files as they are. */
const ART_QUALITY = 90;

async function cutCard(src, width) {
  const trimmed = await sharp(src).trim({ threshold: 6 }).resize({ width, withoutEnlargement: true }).toBuffer();
  const { width: w, height: h } = await sharp(trimmed).metadata();
  const r = Math.round(w * 0.04);
  const mask = Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}"/></svg>`);
  return sharp(trimmed).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).webp({ quality: ART_QUALITY, alphaQuality: 95 }).toBuffer();
}

function plan(game, version, cardsDir, places, glows) {
  const shots = join(game, "build", "app-store", version);
  const cards = cardsDir ?? join(game, "build", "card-shots");
  const art = join(game, "art");
  const jobs = [];
  const add = (key, src, out, make, also = []) => jobs.push({ key, src, out, make, also });
  const lights = sceneLights(game);

  for (const [file, id] of SCREENSHOTS)
    add(`screenshots.${id}`, join(shots, "iphone-6.9", `${file}.png`), `public/media/screenshots/${id}.webp`,
      (s) => s.webp({ quality: 86 }));

  for (const id of DRAGONS) {
    // Every place the site shows a dragon's body, it stands in its own lair: lit as the game lights it there.
    add(`dragons.${id}.art`, join(art, "painted", "dragons", `dragon_${id}.png`), `public/media/dragons/${id}.webp`,
      { lit: lights.dragons[`dragon_${id}`], width: 1024 });
    add(`dragons.${id}.head`, join(art, "painted", "dragons", `dragon_${id}-head.png`), `public/media/dragons/${id}-head.webp`,
      (s) => s.resize({ width: 512, withoutEnlargement: true }).webp({ quality: ART_QUALITY, alphaQuality: 95 }));
    add(`dragons.${id}.lair`, join(art, "painted", "lairs", `dragon_${id}.png`), `public/media/dragons/${id}-lair.webp`,
      (s) => s.webp({ quality: 86 }));
  }

  for (const name of JOURNEYS)
    add(`journeys.${name}`, join(art, "painted", "journeys", `${name}.png`), `public/media/world/journey-${name}.webp`,
      (s) => s.webp({ quality: ART_QUALITY }));

  // The hero's backdrop, as the game's dragon screen shows a Journey painting before a dragon
  // is chosen: full size, at its brightness of 0.45 (baked in, which also makes them smaller).
  for (const name of JOURNEYS)
    add(`scenes.${name}`, join(art, "painted", "journeys", `${name}.png`), `public/media/scenes/${name}.webp`,
      (s) => s.linear(0.45, 0).webp({ quality: 80 }));

  // Each foe on its scene, baked into one picture of its panel's shape, so the two never arrive
  // apart. Drawn twice the width the road's highlight shows it at, for sharp screens.
  for (const name of ENEMIES) {
    const figure = join(art, "painted", "enemies", `${name}.png`);
    const backdrop = join(art, "painted", "backdrops", `${name}.png`);
    const scene = { figure, backdrop, light: lights.enemies[name], place: places[name] };
    add(`enemies.${name}.scene`, figure, `public/media/world/enemy-${name}.webp`,
      { scene: { ...scene, glow: glows[name], artLeft: ENEMY_ART_LEFT, width: 1280 } }, [backdrop]);
    // The goblin hexer by its door, at the end of the page: the whole picture its own, no glow.
    if (name === "goblin-hexer") {
      add(`enemies.${name}.finale`, figure, `public/media/world/finale-${name}.webp`,
        { scene: { ...scene, glow: null, artLeft: 0, width: 1120 } }, [backdrop]);
      // And by the beta form on its own, no backdrop: lit as on its scene, cut to its edges.
      add(`enemies.${name}.figure`, figure, `public/media/world/figure-${name}.webp`,
        { lit: lights.enemies[name], width: 640, trim: true });
    }
  }

  // The cards at about twice the width the site shows them at, for sharp screens (the card tool's
  // renders cap this: draw them at 2x or more). The share image is drawn at build time by a renderer that reads PNG, not WebP.
  for (const n of REGION_CARDS)
    add(`cards.region${n}`, join(cards, "region", `region_${n}.png`), `public/media/cards/region-${n}.webp`, { card: 720 });
  for (const id of DRAGONS)
    add(`cards.dragon_${id}`, join(cards, "dragon", `dragon_${id}.png`), `public/media/cards/dragon-${id}.webp`, { card: 480 });
  for (const [file, name] of ADEPT_CARDS)
    add(`cards.${name.replace(/-/g, "_")}`, join(cards, "adept", `${file}.png`), `public/media/cards/adept-${name}.webp`, { card: 480 });

  // Every Adept Card for the strategy guide, named by its card id (the card tool prefixes each file
  // with its place in the hand, NN_, which is not the card's identity).
  for (const { id, file, slug } of guideCards(game, cards))
    add(`cards.adept_${id}`, join(cards, "adept", file), `public/media/cards/adept-${slug}.webp`, { card: 480 });
  // And each at every Level, small, for the guide's before-and-after of an Empowerment
  // (drawn by the game's tools/card_level_shots.gd into <cards>/adept-levels/<id>_L<n>.png).
  for (const { id, slug } of guideCards(game, cards))
    for (const level of [1, 2, 3, 4])
      add(`cards.adept_${id}_L${level}`, join(cards, "adept-levels", `${id}_L${level}.png`),
        `public/media/cards/levels/${slug}-l${level}.webp`, { card: 400 });

  // Each dragon's share-image art for its guide page, drawn as the home page's share image is.
  for (const id of DRAGONS) {
    add(`og.${id}.lair`, join(art, "painted", "lairs", `dragon_${id}.png`), `assets/og/${id}-lair.png`,
      (s) => s.resize({ width: 400 }).png({ compressionLevel: 9 }));
    add(`og.${id}.dragon`, join(art, "painted", "dragons", `dragon_${id}.png`), `assets/og/${id}-dragon.png`,
      (s) => s.resize({ width: 560 }).png({ compressionLevel: 9, palette: true, quality: 90 }));
  }

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

const kebab = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** The game's Adept Cards by id, each named as the game prints it (data/text.json). */
function adeptCards(game) {
  const cards = JSON.parse(readFileSync(join(game, "data", "cards.json"), "utf8"));
  const text = JSON.parse(readFileSync(join(game, "data", "text.json"), "utf8")).keys;
  return cards.adept_cards.map((c) => {
    const name = text[c.name_key]?.official;
    if (!name) fail(`No name for Adept Card ${c.id} in data/text.json (${c.name_key}).`);
    if (c.levels.length !== 4) fail(`Adept Card ${c.id} has ${c.levels.length} Levels; the guide expects 4.`);
    return { ...c, name, slug: `${kebab(name)}-${c.affinity}` };
  });
}

/** The 16 Adept Card faces the card tool drew, matched to the cards by the id in each file name. */
function guideCards(game, cardsDir) {
  const dir = join(cardsDir, "adept");
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => /^\d+_C\d+\.png$/.test(f)) : [];
  const byId = Object.fromEntries(files.map((f) => [/_(C\d+)\.png$/.exec(f)[1], f]));
  const cards = adeptCards(game);
  if (files.length !== cards.length) fail(`${dir} has ${files.length} Adept Card faces; the game has ${cards.length}.`);
  return cards.map((c) => {
    if (!byId[c.id]) fail(`No face for Adept Card ${c.id} in ${dir}.`);
    return { id: c.id, file: byId[c.id], slug: c.slug };
  });
}

/**
 * The strategy guide's numbers from the game: each dragon's Speed and First
 * Strike (data/cards.json) and the decks to bring to its Showdown
 * (data/deck_guide.json), and each Adept Card's strength at each Level, its
 * best Spell figure plus its Boost, with the XP each Empower step costs.
 */
function guideStats(game) {
  const cards = JSON.parse(readFileSync(join(game, "data", "cards.json"), "utf8"));
  const guide = JSON.parse(readFileSync(join(game, "data", "deck_guide.json"), "utf8")).content.classic;
  const dragons = Object.fromEntries(DRAGONS.map((id) => {
    const d = cards.dragons.find((x) => x.id === `dragon_${id}`);
    const deck = guide[`dragon_${id}`];
    if (!d) fail(`No dragon_${id} in data/cards.json.`);
    if (!deck) fail(`No dragon_${id} in data/deck_guide.json.`);
    return [id, { speed: d.initiative, firstStrike: d.first_strike.value, deckEven: deck.even, deckLikely: deck.likely }];
  }));
  const adepts = Object.fromEntries(adeptCards(game).map((c) => [c.id, {
    name: c.name,
    essence: c.affinity,
    image: `/media/cards/adept-${c.slug}.webp`,
    strength: c.levels.map((l) => Math.max(l.basic.value, l.enhanced.value) + l.boost),
    stepCost: c.levels.slice(0, 3).map((l) => l.level_up_cost),
    // Every figure printed at each Level, for the guide's card viewer (as the game's card detail spells them out).
    levels: c.levels.map((l) => ({
      speed: l.initiative,
      basic: { type: l.basic.type, value: l.basic.value },
      attuned: { type: l.enhanced.type, value: l.enhanced.value, essence: l.enhanced.affinity },
      boost: l.boost,
      armor: { value: l.armor.value, essence: l.armor.affinity ?? null },
      empower: l.level_up_cost ?? null,
    })),
  }]));
  // What each Level of each card adds to the Showdown against each dragon, in points of win
  // chance, Level 1 to 4 (data/advisor_showdown.json: Trashed to 1, then 1 to 2, 2 to 3, 3 to 4).
  const solved = JSON.parse(readFileSync(join(game, "data", "advisor_showdown.json"), "utf8")).dragons;
  const showdown = Object.fromEntries(DRAGONS.map((id) => {
    const per = solved[`dragon_${id}`];
    if (!per) fail(`No dragon_${id} in data/advisor_showdown.json.`);
    return [id, Object.fromEntries(Object.keys(adepts).map((c) => {
      if (!per[c] || per[c].length !== 4) fail(`data/advisor_showdown.json has no four steps for ${c} against dragon_${id}.`);
      return [c, Math.round((per[c][1] + per[c][2] + per[c][3]) * 10) / 10];
    }))];
  }));
  return { dragons, cards: adepts, showdown };
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
  const missing = ENEMIES.map((n) => join(game, "art", "painted", "enemies", `${n}.png`)).filter((p) => !existsSync(p));
  if (missing.length) fail(`Missing source file(s), nothing written:\n  ${missing.join("\n  ")}`);
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

/**
 * The glow behind each foe: the bright of its attack's Essence (ESSENCE in the
 * game's ui/theme/tokens.gd), parchment when it has none. ENEMIES runs in the
 * same order as data/cards.json lists the foes, region by region.
 */
function enemyGlows(game) {
  const tokens = readFileSync(join(game, "ui", "theme", "tokens.gd"), "utf8");
  const bright = Object.fromEntries([...tokens.matchAll(/"(\w+)": \{"base": Color\("[0-9a-f]{6}"\), "bright": Color\("([0-9a-f]{6})"\)\}/g)].map((m) => [m[1], m[2]]));
  const parchment = /const PARCHMENT := Color\("([0-9a-f]{6})"\)/.exec(tokens)?.[1];
  if (!parchment || Object.keys(bright).length !== 4) fail("No ESSENCE or PARCHMENT colours in ui/theme/tokens.gd.");
  const foes = JSON.parse(readFileSync(join(game, "data", "cards.json"), "utf8")).regions.flatMap((r) => r.enemies);
  if (foes.length !== ENEMIES.length) fail(`data/cards.json has ${foes.length} foes; the site knows ${ENEMIES.length}.`);
  return Object.fromEntries(ENEMIES.map((name, i) => [name, bright[foes[i].attack.affinity] ?? parchment]));
}

function mediaModule(media, source, stats, guide) {
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
    "/** Each Region Card's foes and roads, in card order, as printed. */",
    `export const regionStats = ${JSON.stringify(stats, null, 2)} as const;\n`,
    "/** The strategy guide's numbers from the game: each dragon's Speed, First Strike and Showdown deck targets; each Adept Card's strength by Level and Empower costs. */",
    body("guideStats", guide),
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
  const places = await enemyPlaces(args.game);
  const glows = enemyGlows(args.game);
  const { jobs, manifest } = plan(args.game, version, args.cards && resolve(args.cards), places, glows);

  const missing = jobs.flatMap((j) => [j.src, ...j.also]).concat(manifest, join(args.game, "data", "cards.json"), join(args.game, "data", "text.json"), join(args.game, "data", "deck_guide.json"), join(args.game, "data", "advisor_showdown.json")).filter((p) => !existsSync(p));
  if (missing.length) fail(`Missing source file(s), nothing written:\n  ${[...new Set(missing)].join("\n  ")}`);

  const made = /made (\d{4}-\d{2}-\d{2})/.exec(readFileSync(manifest, "utf8"))?.[1] ?? "unknown";

  // Render everything in memory first, so a failure part-way writes nothing.
  const rendered = [];
  for (const job of jobs) {
    let data;
    if (job.make === "copy") data = readFileSync(job.src);
    else if (job.make === "ico") data = await makeIco(job.src);
    else if (job.make.card) data = await cutCard(job.src, job.make.card);
    else if (job.make.scene) data = await enemyScene(job.make.scene);
    else if ("lit" in job.make) data = await litFigure(job.src, job.make.lit, job.make.width, job.make.trim);
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

  const generated = mediaModule(media, { gameVersion: version, made }, regionStats(args.game), guideStats(args.game));
  const changed = writeIfChanged("components/media.generated.ts", Buffer.from(generated));
  written += changed ? 1 : 0;
  console.log(`${changed ? "wrote " : "same  "} components/media.generated.ts`);
  console.log(`\n${rendered.length + 1} files from store run ${version} (made ${made}), ${written} changed, ${(total / 1024 / 1024).toFixed(1)} MB in all.`);
}

main().catch((err) => fail(err.stack || String(err)));
