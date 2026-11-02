/** Every fact the pages repeat, kept in one place so the landing page, the
 * privacy policy and the support page can never disagree about who to write
 * to or what the game is called. */
export const site = {
  name: "Riftwyrm",
  shortName: "Riftwyrm",
  url: "https://riftwyrm.dangervalentine.com",
  developer: "Victor Valentine",
  email: "victor@dangervalentine.com",
  /** One sentence in plain words, at most 160 characters: it doubles as the
   * meta description. The game is described generically on purpose: no other
   * game, publisher or in-game term is named anywhere. */
  tagline:
    "A solo fantasy card game for phones and desktop. Build a hand of cards " +
    "and hunt dragons across the regions of a broken land.",
  /** The pitch under the hero: what a game is like, in two or three sentences. */
  pitch:
    "Each hunt is a road of foes, and you meet each one with the cards in your hand. " +
    "Read the fight, play the right cards, and spend what you earn to grow stronger " +
    "before the dragon at the end of the road.",
  /** Store listings. "" until the game is live there; otherwise the listing's
   * URL (https://play.google.com/… and https://apps.apple.com/…). Setting one
   * turns its button into a live link everywhere it appears. */
  stores: {
    googlePlay: "",
    appStore: "",
  },
} as const;
