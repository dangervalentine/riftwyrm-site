/** Every fact the pages repeat, kept in one place so the landing page, the
 * privacy policy and the support page can never disagree about who to write
 * to or what the game is called. */
export const site = {
  name: "Riftwyrm",
  url: "https://riftwyrm.dangervalentine.com",
  developer: "Victor Valentine",
  email: "victor@dangervalentine.com",
  /** One sentence in plain words. The game is described generically on
   * purpose: no other game, publisher or in-game term is named anywhere. */
  tagline:
    "A solo fantasy card game for phones and desktop. Build a hand of cards " +
    "and hunt dragons across the regions of a broken land.",
} as const;
