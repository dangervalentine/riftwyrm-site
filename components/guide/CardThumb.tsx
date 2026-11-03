import Image from "next/image";
import { guideStats } from "@/components/media.generated";
import type { CardId } from "@/components/guide";
import { levelFace } from "./cardViewerItems";

/**
 * A small printed card that opens the card viewer at a Level (every Level of
 * the card, side by side). Without scripts it opens the card's picture.
 */
export default function CardThumb({ card, level = 1, className = "w-8" }: { card: CardId; level?: number; className?: string }) {
  const f = levelFace(card, level);
  return (
    <a
      href={f.src}
      data-card={card}
      data-level={level}
      className={`block flex-none rounded-[3px] transition-transform hover:scale-105 focus-visible:scale-105 ${className}`}
      aria-label={`${guideStats.cards[card].name} at every Level`}
    >
      <Image src={f.src} width={f.width} height={f.height} alt="" sizes="96px" className="h-auto w-full drop-shadow-[0_4px_8px_var(--well)]" />
    </a>
  );
}
