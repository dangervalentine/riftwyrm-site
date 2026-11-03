/**
 * The strategy guide's words and the numbers that exist only in the playtest
 * report. Numbers the game itself holds (deck targets, Speed, First Strike,
 * card strength and Empower costs) come from guideStats, which
 * scripts/sync-assets.mjs generates from the game: never retype them here.
 *
 * Refreshing after a new playtest round or card set:
 *   1. In the game repo, regenerate data/deck_guide.json and the card shots.
 *   2. npm run sync-assets: deck targets, Speed, First Strike, card strength
 *      and art update themselves.
 *   3. Here, update `standing`, the picks and their reasons, the dragon
 *      descriptions, any lesson effects, and `edition`. Pick cards by the
 *      report's two rankings (by which decks won, and by the Showdown itself):
 *      Raise = high in one and not low in the other; Pass on = low in both;
 *      where they disagree, an aside ("good, not first"), never both lists.
 *   4. npm run lint && npm run build: the checks at the bottom of this file
 *      fail the build if a card is missing, listed twice, or a list too short.
 *
 * Cards are named by the game's id (C01 to C16): five names exist in two
 * Essences, and the id keeps the pair unambiguous.
 */
import { dragons, type DragonId } from "./content";
import { guideStats } from "./media.generated";

export type CardId = keyof typeof guideStats.cards;
export type Essence = (typeof guideStats.cards)[CardId]["essence"];
export type Evidence = "tested" | "observed" | "tested-dont";
export type DragonSlug = "thrallis" | "glaciarch" | "cindermaw" | "vesperath";

export const difficulties = [
  { id: "casual", label: "Casual" },
  { id: "easy", label: "Easy" },
  { id: "normal", label: "Normal" },
  { id: "hard", label: "Hard" },
  { id: "brutal", label: "Brutal" },
  { id: "dire", label: "Dire" },
] as const;
export type Difficulty = (typeof difficulties)[number]["id"];

/** The dragons in unlock order, each with its page's slug: the only place a slug is made. */
export const guideDragons = dragons.map((d) => ({ id: d.id, slug: d.name.toLowerCase() as DragonSlug }));

export function dragonBySlug(slug: string): DragonId | undefined {
  return guideDragons.find((d) => d.slug === slug)?.id;
}

export function slugOf(id: DragonId): DragonSlug {
  return guideDragons.find((d) => d.id === id)!.slug;
}

export function dragonOf(id: DragonId) {
  return dragons.find((d) => d.id === id)!;
}

/** The dragons either side, in unlock order, wrapping round. */
export function neighbours(id: DragonId): { prev: DragonId; next: DragonId } {
  const i = guideDragons.findIndex((d) => d.id === id);
  const n = guideDragons.length;
  return { prev: guideDragons[(i + n - 1) % n].id, next: guideDragons[(i + 1) % n].id };
}

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Cold Blaze (Water)": every card is named with its Essence. */
export function cardLabel(id: CardId): string {
  const c = guideStats.cards[id];
  return `${c.name} (${capital(c.essence)})`;
}

export function essenceLabel(e: Essence | DragonId): string {
  return capital(e);
}

export const edition = { cardSet: "Classic", round: "Playtest round 2", updated: "2026-10-29" } as const;

export function editionDate(): string {
  return new Date(`${edition.updated}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** How often a strong player, one who sees only what a player at the table sees, won: per cent, by difficulty. */
export const standing: Record<DragonId, Record<Difficulty, number>> = {
  lightning: { casual: 99, easy: 97, normal: 88, hard: 94, brutal: 81, dire: 68 },
  water: { casual: 99, easy: 98, normal: 95, hard: 92, brutal: 79, dire: 73 },
  fire: { casual: 95, easy: 88, normal: 72, hard: 60, brutal: 40, dire: 25 },
  shadow: { casual: 99, easy: 97, normal: 89, hard: 88, brutal: 70, dire: 59 },
};

export const ceilingNote =
  "Even a player who knew the order of every card would win Dire against Cindermaw only about four times in five.";

type Pick = { card: CardId; why: string };

export type DragonGuide = {
  /** One line: how hard this hunt is. On the index card and under the page's title. */
  verdict: string;
  /** The page's meta description: at most 160 characters. */
  description: string;
  intro: string[];
  raise: Pick[];
  pass: Pick[];
  /** Cards the two rankings disagree on: good, not first. */
  aside?: { card: CardId; note: string }[];
  tips: string[];
  /** Lessons on the main guide page worth reading for this dragon. */
  lessonLinks?: string[];
};

const d = guideStats.dragons;

export const dragonGuides: Record<DragonId, DragonGuide> = {
  lightning: {
    verdict: "The first hunt, and a fair one.",
    description: `Beat Thrallis: bring a deck of ${d.lightning.deckEven} Levels (${d.lightning.deckLikely} to be safe), expect it to strike first, and raise Static Rush and Lightning Step.`,
    intro: [
      `Every hunt starts with Thrallis, and it is a fair teacher. A strong player beats it ${standing.lightning.normal}% of the time on Normal and still ${standing.lightning.dire}% on Dire. Bring a deck that adds up to ${d.lightning.deckEven} Levels when the Showdown begins and you are even money; ${d.lightning.deckLikely} and you win four times in five.`,
      `What sets Thrallis apart is its pace. At Speed ${d.lightning.speed} it is the fastest of the four, so in the Reckoning it will nearly always strike first. Build to take that blow rather than to outrun it.`,
    ],
    raise: [
      { card: "C16", why: "The most valuable Level you can carry against Thrallis, and its first Empowerment is the best bargain in the game." },
      { card: "C06", why: "The second most valuable Level against Thrallis, and a big jump in strength at every Level." },
      { card: "C04", why: "Its Levels pay off in the Showdown against Thrallis more than almost any other card's." },
      { card: "C09", why: "The third most valuable Level against Thrallis: a safe home for spare XP." },
    ],
    pass: [
      { card: "C03", why: "One of the least useful places for a Level against Thrallis: Brace with it before the others." },
      { card: "C02", why: "Its Levels add little to this hunt. Spend XP elsewhere." },
      { card: "C07", why: "Worth less than an average card here: let it take the Weakening." },
    ],
    aside: [
      { card: "C15", note: "Weak in the Showdown itself but useful across the whole hunt: not one to pass on, not one to lead with." },
      { card: "C12", note: "Strong in the Showdown, middling over a whole hunt." },
    ],
    tips: [
      `Speed ${d.lightning.speed} is the highest of the four: a Boost to Speed rarely lifts you past it, so plan to take the first strike and Brace for it.`,
      `Its First Strike is ${d.lightning.firstStrike}. Keep enough in your Hand to Brace it with as few cards as possible.`,
      "Thrallis is the dragon to learn the Empower habit on: buy the biggest jump in strength each time, not the cheapest Level.",
    ],
    lessonLinks: ["empower-biggest-jump", "weigh-the-dragon", "speed-in-the-reckoning"],
  },

  water: {
    verdict: "The most forgiving dragon at the top difficulties.",
    description: `Beat Glaciarch: a deck of ${d.water.deckEven} Levels (${d.water.deckLikely} to be safe), Speed ${d.water.speed} to beat, and the two Swift Current cards to raise.`,
    intro: [
      `Glaciarch is the second dragon to wake, but it is not the second hardest. It needs the smallest deck of the four, ${d.water.deckEven} Levels for an even chance and ${d.water.deckLikely} to win four times in five, and a strong player beats it ${standing.water.dire}% of the time even on Dire.`,
      "Here the plain rule is already the right one: Empower whichever card gains the most strength. Weighing the dragon you face, which helps against the other three, adds almost nothing against Glaciarch.",
    ],
    raise: [
      { card: "C09", why: "The most valuable Level you can carry against Glaciarch, by both measures." },
      { card: "C08", why: "Its twin from the other Essence, nearly as good, and its last Level is one of the best buys in the game." },
      { card: "C04", why: "Steadily valuable in Glaciarch's Showdown." },
      { card: "C11", why: "Among the most valuable Levels against Glaciarch." },
    ],
    pass: [
      { card: "C02", why: "A Level here is worth less than one on an average card against Glaciarch: Brace with it first." },
      { card: "C15", why: "Adds almost nothing to this hunt. Keep your XP for other cards." },
      { card: "C07", why: "Below average against Glaciarch: let it lose the Levels." },
    ],
    aside: [{ card: "C10", note: "Strong in the Showdown itself, middling over a whole hunt." }],
    tips: [
      `Speed ${d.water.speed} is within reach: in the Reckoning, a Boost aimed at Speed often lifts you past it, and then you strike first.`,
      `Its First Strike is only ${d.water.firstStrike}, the lightest of the four.`,
      "Trust the biggest-jump rule: against Glaciarch nothing cleverer is needed.",
    ],
    lessonLinks: ["empower-biggest-jump", "speed-in-the-reckoning"],
  },

  fire: {
    verdict: "The hardest hunt: bring the biggest deck.",
    description: `Beat Cindermaw: bring ${d.fire.deckEven} Levels to the Showdown (${d.fire.deckLikely} to be safe), get past Speed ${d.fire.speed}, and raise Cold Blaze and Scorch.`,
    intro: [
      `Cindermaw is the wall most hunts break on. A strong player wins only ${standing.fire.normal}% of the time on Normal and ${standing.fire.dire}% on Dire, against ${standing.water.dire}% for Glaciarch. It needs the biggest deck of the four: ${d.fire.deckEven} Levels for an even chance when the Showdown begins, ${d.fire.deckLikely} to win four times in five. That is roughly every card at Level 3.`,
      `The reason is how hard it hits. At the middle Grade it hits for 24 where the others hit for 20; at the top Grade, for 15 where the others hit for 11 to 13. Its top Grade has 32 HP to break, and its First Strike is ${d.fire.firstStrike}. Every one of those blows costs Levels to Brace, so the deck you bring must be big enough to lose some and still win.`,
    ],
    raise: [
      { card: "C04", why: "The most valuable Levels you can carry against Cindermaw, by both measures." },
      { card: "C03", why: "Among the best cards for this hunt: a Level here pays off more than almost anywhere else." },
      { card: "C09", why: "Strong in Cindermaw's Showdown and dependable across the hunt." },
      { card: "C14", why: "Judged by which decks won, the Fire Cold Blaze is as valuable here as its Water twin." },
    ],
    pass: [
      { card: "C02", why: "One of the weakest places for a Level against Cindermaw: Brace with it first." },
      { card: "C01", why: "Its Levels add little to this Showdown. Spend XP elsewhere." },
      { card: "C13", why: "Among the least valuable Levels against Cindermaw: let it take the Weakening." },
      { card: "C07", why: "The same story as its Fire twin: little value here." },
    ],
    aside: [{ card: "C11", note: "Valuable in the Showdown itself, middling over a whole hunt: good, not first." }],
    tips: [
      `Your Speed must be above ${d.fire.speed} or Cindermaw strikes first. It is the slowest dragon, so its Speed is the easiest of the four to pass.`,
      "Aim for every card at Level 3 or better by the Showdown, and do not Trash a Level 1 card when Weakening another would do.",
      `On Dire a strong player wins about one hunt in four. Losing here is not a sign you are playing badly; it is the hardest fight in the game.`,
    ],
    lessonLinks: ["empower-biggest-jump", "weigh-the-dragon", "brace-fewest"],
  },

  shadow: {
    verdict: "The last dragon, and the second hardest.",
    description: `Beat Vesperath: a deck of ${d.shadow.deckEven} Levels (${d.shadow.deckLikely} to be safe), Speed ${d.shadow.speed} to beat, and both Inferno cards and Shadow Stride to raise.`,
    intro: [
      `Vesperath wakes last and fights like it. A strong player beats it ${standing.shadow.normal}% of the time on Normal but only ${standing.shadow.dire}% on Dire. Bring ${d.shadow.deckEven} Levels to the Showdown for an even chance, ${d.shadow.deckLikely} to win four times in five.`,
      "More than any other dragon, Vesperath rewards knowing which cards matter. Its favourites are clear, and one card is worth clearly less than average: build around the first and Brace with the second.",
    ],
    raise: [
      { card: "C10", why: "The most valuable Level you can carry against Vesperath, by both measures." },
      { card: "C05", why: "Its twin from the Lightning Essence, almost as good." },
      { card: "C11", why: "The third card Vesperath's Showdown rewards most." },
    ],
    pass: [
      { card: "C15", why: "A Level on Ember Dash is worth clearly less than one on an average card here: Brace with it first." },
      { card: "C02", why: "Among the least useful Levels against Vesperath." },
    ],
    tips: [
      `Speed ${d.shadow.speed} is hard to pass. Expect to take the first strike, a First Strike of ${d.shadow.firstStrike}.`,
      "Brace with the dragon in mind: of the four, Vesperath is where giving up the right Levels helped most.",
      "Put your XP into the two Inferno cards and Shadow Stride before anything else.",
    ],
    lessonLinks: ["weigh-the-dragon", "brace-fewest"],
  },
};

export type Lesson = { id: string; title: string; body: string; evidence: Evidence; effect?: string };

const bySpeed = guideDragons
  .map(({ id }) => ({ name: dragonOf(id).name, speed: d[id].speed }))
  .sort((a, b) => a.speed - b.speed)
  .map((x) => `${x.name} ${x.speed}`)
  .join(", ");

export const lessons: Lesson[] = [
  {
    id: "regions-are-deck-building",
    title: "The Regions are deck building",
    body: "A strong player reached the Showdown in every game. Nothing is lost on the road; everything is decided at its end. So every choice you make in the Regions, every Empowerment, every Brace, every Detour, is really a choice about the deck you will bring to the dragon.",
    evidence: "observed",
  },
  {
    id: "empower-biggest-jump",
    title: "Empower the card that gains the most strength",
    body: "A card's strength is its best Spell figure plus its Boost. Before you spend XP, compare each card in your Hand now and at its next Level, and buy the biggest jump, even when it costs 3 to 5 XP rather than 1. Strong play spent about 4 XP per Level, mostly on cards already at Level 2 or 3. Raising whichever card is already strongest is a trap: it lost about 10 games in 100 against this rule.",
    evidence: "tested",
    effect: "About 12 more wins in 100 games.",
  },
  {
    id: "weigh-the-dragon",
    title: "Weigh the dragon you face",
    body: "When you Empower, count what a Level adds now and, twice over, what it adds to the Showdown against the dragon you are hunting. When you Brace, give up the Levels that dragon needs least. Each dragon's page lists its cards to raise and to pass on. It helped against every dragon, and least against Glaciarch, where the biggest jump is already right.",
    evidence: "tested",
    effect: "About 4 more wins in 100 games.",
  },
  {
    id: "brace-fewest",
    title: "Brace with the fewest cards",
    body: "Every card you Brace with loses a Level, so use as few as you can. Do not Trash a Level 1 card when Weakening another would do. Beyond that, which cards you use mattered little in testing, except that giving up the Levels this dragon needs least helps.",
    evidence: "tested",
  },
  {
    id: "detour-when-weak",
    title: "Detour when your best Play is weak",
    body: "If your best Play loses or only just wins, and its damage would cost you a Level for little XP, Detour your weakest card instead, at most twice a Trial. Strong players took about three Detours a game; weak players almost never did.",
    evidence: "tested",
    effect: "About 3 more wins in 100 games.",
  },
  {
    id: "meld-on-merit",
    title: "Do not Meld just to make a Spell Attuned",
    body: "Judge a Melded Play like any other, by what it wins and what it costs, and remember the tucked card is spent. Strong players Meld often, but because the moment suits it, not for its own sake.",
    evidence: "tested-dont",
    effect: "Favouring Melds cost about 11 wins in 100 games.",
  },
  {
    id: "speed-in-the-reckoning",
    title: "Do not chase Speed when you Empower; use it in the Reckoning",
    body: `In the Reckoning the dragon strikes first unless your Speed is above its own: ${bySpeed}. When a Boost aimed at Speed lifts you past it, take it. But do not buy Levels for Speed: it comes with a strong deck, and chasing it cost about 4 wins in 100.`,
    evidence: "tested-dont",
    effect: "Strong decks were struck first in about a quarter of fights; weaker ones in over a third.",
  },
  {
    id: "rally-on-the-approach",
    title: "Rally on the Approach when the draw is wrong",
    body: "Every card drawn for the Approach is discarded whatever you play, so those cards are lost to the Reckoning. If the seven you draw hold your hardest hitters, or lack the cards that move you, Rally once, giving up your weakest card.",
    evidence: "observed",
  },
];

/** Empower steps by card: 1 is Level 1 to 2, 2 is 2 to 3, 3 is 3 to 4. */
export type Step = readonly [CardId, 1 | 2 | 3];

export const empowerNotes: { best: Step[]; poorest: Step[] } = {
  best: [["C16", 1], ["C06", 1], ["C12", 1], ["C01", 2], ["C08", 3]],
  poorest: [["C03", 2], ["C15", 2], ["C15", 3], ["C06", 3]],
};

export function stepOf([card, step]: Step) {
  const c = guideStats.cards[card];
  return { gain: c.strength[step] - c.strength[step - 1], cost: c.stepCost[step - 1], from: step, to: step + 1 };
}

// ------------------------------------------------------------ checks
// Run when the module loads, so a bad edit fails `next build`.

const BANNED = /heuristic|oracle|honest search|mcnemar|p-value|bootstrap|\bseeds?\b|ladder|r2-|simulator|solver|playout|\bT0\d\d\b/i;

function check(ok: boolean, message: string) {
  if (!ok) throw new Error(`Strategy guide (components/guide.ts): ${message}`);
}

{
  const ids = new Set(Object.keys(guideStats.cards));
  check(guideDragons.length === 4 && new Set(guideDragons.map((g) => g.slug)).size === 4, "expected four dragons with distinct slugs.");
  const lessonIds = new Set(lessons.map((l) => l.id));
  check(lessonIds.size === lessons.length, "two lessons share an id.");

  for (const { id } of guideDragons) {
    const g = dragonGuides[id];
    const name = dragonOf(id).name;
    const all = [...g.raise.map((p) => p.card), ...g.pass.map((p) => p.card), ...(g.aside ?? []).map((a) => a.card)];
    for (const c of all) check(ids.has(c), `${name} names card ${c}, which the game does not have.`);
    check(new Set(all).size === all.length, `${name} lists a card twice across Raise, Pass on and Good, not first.`);
    check(g.raise.length >= 3, `${name} needs at least three cards to raise.`);
    check(g.pass.length >= 2, `${name} needs at least two cards to pass on.`);
    check(g.tips.length >= 1, `${name} needs at least one tip.`);
    check(g.description.length <= 160, `${name}'s description is ${g.description.length} characters; at most 160.`);
    for (const l of g.lessonLinks ?? []) check(lessonIds.has(l), `${name} links to lesson "${l}", which does not exist.`);
    for (const diff of difficulties) {
      const v = standing[id][diff.id];
      check(Number.isFinite(v) && v >= 0 && v <= 100, `${name}'s ${diff.label} win rate must be 0 to 100.`);
    }
  }

  for (const s of [...empowerNotes.best, ...empowerNotes.poorest]) check(ids.has(s[0]), `Empower step names card ${s[0]}, which the game does not have.`);
  const ratio = (s: Step) => stepOf(s).gain / stepOf(s).cost;
  const worstBest = Math.min(...empowerNotes.best.map(ratio));
  const bestPoor = Math.max(...empowerNotes.poorest.map(ratio));
  check(worstBest >= bestPoor, "a best-value Empower step gives less strength per XP than a poor one.");

  const words = JSON.stringify({ dragonGuides, lessons, ceilingNote, edition });
  const hit = BANNED.exec(words);
  check(!hit, `the copy uses "${hit?.[0]}", a word from the testing report that players should not see.`);
}
