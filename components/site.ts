/** Every fact the pages repeat, kept in one place so the landing page, the
 * privacy policy and the support page can never disagree about who to write
 * to or what the game is called. */
export const site = {
  name: "Riftwyrm",
  shortName: "Riftwyrm",
  url: "https://riftwyrm.dangervalentine.com",
  developer: "Danger Valentine",
  github: "https://github.com/dangervalentine",
  email: "victor@dangervalentine.com",
  /** One sentence in plain words, at most 160 characters: it doubles as the
   * meta description. The game is described generically on purpose: no other
   * game, publisher or in-game term is named anywhere. */
  tagline:
    "A solo fantasy card game for phones and desktop. Every region, foe and dragon " +
    "is a card, and every shuffle deals a new hunt.",
  /** What the game is, said once under the deck: the deck is the world. */
  pitch:
    "Everything in Riftwyrm is a card. The regions you cross, the foes and roads in them, " +
    "the dragon waiting at the end, and your own powers and resources are all dealt from " +
    "one deck. Shuffle, and the road is dealt again: no two hunts tell the same story.",
  /** Store listings. "" until the game is live there; otherwise the listing's
   * URL (https://play.google.com/… and https://apps.apple.com/…). Setting one
   * turns its button into a live link everywhere it appears. */
  stores: {
    googlePlay: "",
    appStore: "",
  },
} as const;
