/**
 * The words on the home page that are not shared facts. Names, titles and
 * flavour lines are the game's own text, exactly as the game shows them
 * (data/text.json and ui/model/art.gd in the game). Every claim about the game
 * is one its README or this site's privacy policy already makes.
 */

export type ScreenshotId = "title" | "trial" | "dragons" | "showdown" | "won";

/** In the order the site shows them. Captions are at most 60 characters. */
export const screenshots: { id: ScreenshotId; caption: string; alt: string }[] = [
  {
    id: "title",
    caption: "Cross four regions and slay the dragon",
    alt: "The title screen: the Riftwyrm name beside a dragon in red-lit smoke, with Play, Learn to Play, Leaderboard, Achievements and Glossary buttons.",
  },
  {
    id: "trial",
    caption: "Meet each foe with the cards you hold",
    alt: "A fight in the Vile Mires: the foe's card, Black River, on the left and four cards from your hand in a row, with the Play button below.",
  },
  {
    id: "dragons",
    caption: "Four dragons, each its own hunt",
    alt: "Choosing a dragon: Glaciarch, Rime and Rock, with its speed, attack and armour, beside the list of all four dragons.",
  },
  {
    id: "showdown",
    caption: "Stand and fight at the dragon's lair",
    alt: "The showdown with Cindermaw: the dragon's approach card beside two rows of cards ready to play.",
  },
  {
    id: "won",
    caption: "Every win scored, your best ranked",
    alt: "A win: Cindermaw is defeated on Normal in 13 minutes 42, with a score of 46 and a new best on the leaderboard.",
  },
];

/** At most six. Titles up to 40 characters, bodies up to 140. Icons are the
 * game's own, under /media/icons/. Offline play is not claimed. */
export const features: { title: string; body: string; icon: string }[] = [
  {
    title: "A card game that fits in one hand",
    body: "Every fight is a foe on the road and a hand of cards. Read what it takes to win, then play the cards that do it.",
    icon: "/media/icons/deck.svg",
  },
  {
    title: "Four dragons to hunt",
    body: "Start with one. Beat it on Normal or harder and the next dragon wakes, each a harder hunt than the last.",
    icon: "/media/icons/crown.svg",
  },
  {
    title: "Four regions, then the lair",
    body: "Cross four regions of foes and hard roads, growing your cards as you go, before the final fight.",
    icon: "/media/icons/sigil_region.svg",
  },
  {
    title: "Six levels of difficulty",
    body: "From a gentle first hunt to a fight that wants every card. A win on one level opens the next.",
    icon: "/media/icons/star.svg",
  },
  {
    title: "Learn by playing",
    body: "Six short lessons on the real game screens teach the rules one move at a time.",
    icon: "/media/icons/book.svg",
  },
  {
    title: "Yours alone",
    body: "27 achievements and a leaderboard of your best wins. No ads, no tracking, no account.",
    icon: "/media/icons/trophy.svg",
  },
];

export type DragonId = "lightning" | "water" | "fire" | "shadow";

/** In unlock order. */
export const dragons: {
  id: DragonId;
  order: 1 | 2 | 3 | 4;
  name: string;
  title: string;
  line: string;
  alt: string;
}[] = [
  {
    id: "lightning",
    order: 1,
    name: "Thrallis",
    title: "The Stormcrown",
    line: "A thunderclap heard after its lightning-fast strikes is the only mark it leaves behind.",
    alt: "Thrallis, a grey dragon crackling with lightning, in a forest clearing under a storm.",
  },
  {
    id: "water",
    order: 2,
    name: "Glaciarch",
    title: "Rime and Rock",
    line: "Its icy scales are stone hard; only the most powerful spells can harm it.",
    alt: "Glaciarch, a heavy blue dragon with icy spines, before the mouth of an ice cave.",
  },
  {
    id: "fire",
    order: 3,
    name: "Cindermaw",
    title: "The Pyrewind",
    line: "Where its scorching wind passes, only pyres are left behind.",
    alt: "Cindermaw, a red winged dragon with a crest of flame, above mountains at sunset.",
  },
  {
    id: "shadow",
    order: 4,
    name: "Vesperath",
    title: "The Unburied",
    line: "It crawls back from every wound, it lives in the shadows as it escapes death.",
    alt: "Vesperath, a violet winged dragon with bare ribs and antlers, over a smoking purple waste.",
  },
];

/** Roads and foes from the game, with the names the game gives them. */
export const journeys: { key: string; name: string; alt: string }[] = [
  { key: "peaks", name: "High Peaks", alt: "A pale road winding between steep green peaks." },
  { key: "waterfall", name: "The Falls", alt: "A tall waterfall between blue cliffs, a stone path at its foot." },
  { key: "swamp", name: "Sunken Mire", alt: "A boardwalk across still marsh water to a lone bare tree." },
  { key: "volcano", name: "Ash Slopes", alt: "A dark mountain against a red sun, a river running down from it." },
  { key: "rope-bridge", name: "Rope Bridge", alt: "A rope bridge slung across a green gorge above a river." },
  { key: "burning-forest", name: "Burnt Forest", alt: "A pale road through a forest of bare, ash-white trees." },
];

export const enemies: { key: string; name: string; alt: string }[] = [
  { key: "lion-archer", name: "Lionel Archer", alt: "A lion archer drawing a bow." },
  { key: "marsh-treant", name: "Swamp Treant", alt: "An antlered tree creature with clawed, glowing hands." },
  { key: "club-ogre", name: "Bog Ogre", alt: "A grey ogre dragging a flaming hammer." },
  { key: "naga", name: "Naga Goro", alt: "A serpent-headed figure in a long robe, red tongue flickering." },
  { key: "goblin-hexer", name: "Goblin Hexer", alt: "A hooded goblin with a staff of purple fire." },
  { key: "antler-horror", name: "Antlered Horror", alt: "A gaunt, grey, deer-like horror crowned with antlers." },
];
