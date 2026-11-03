import { cardLabel, type CardId } from "@/components/guide";
import { cards, guideStats } from "@/components/media.generated";

const ESSENCE_ORDER = ["water", "lightning", "shadow", "fire"] as const;

export type ViewerLevel = (typeof guideStats.cards)[CardId]["levels"][number] & {
  level: number;
  strength: number;
  src: string;
  width: number;
  height: number;
};
export type ViewerItem = { id: CardId; label: string; essence: string; levels: ViewerLevel[] };

/** The printed face of a card at a Level. */
export function levelFace(card: CardId, level: number) {
  return cards[`adept_${card}_L${level}` as keyof typeof cards] as { src: string; width: number; height: number };
}

/** Every card, Essence by Essence, with each Level's face and figures: what the card viewer shows. */
export function cardViewerItems(): ViewerItem[] {
  const ids = (Object.keys(guideStats.cards) as CardId[]).sort(
    (a, b) =>
      ESSENCE_ORDER.indexOf(guideStats.cards[a].essence) - ESSENCE_ORDER.indexOf(guideStats.cards[b].essence) ||
      a.localeCompare(b),
  );
  return ids.map((id) => {
    const c = guideStats.cards[id];
    return {
      id,
      label: cardLabel(id),
      essence: c.essence,
      levels: c.levels.map((l, i) => ({ ...l, level: i + 1, strength: c.strength[i], ...levelFace(id, i + 1) })),
    };
  });
}
