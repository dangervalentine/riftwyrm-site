import Image from "next/image";
import { cardLabel, essenceLabel, type CardId } from "@/components/guide";
import { guideStats } from "@/components/media.generated";

/** A card's name with its Essence: the mark, then "Name (Essence)". */
export default function CardName({ card }: { card: CardId }) {
  const e = guideStats.cards[card].essence;
  return (
    <span className="inline-flex items-start gap-1.5">
      <Image src={`/media/icons/${e}.svg`} alt="" width={14} height={14} className="mt-[0.2rem] flex-none" />
      <span>
        {cardLabel(card)}
        <span className="sr-only">, {essenceLabel(e)} Essence</span>
      </span>
    </span>
  );
}
