import Image from "next/image";
import { cardLabel, essenceLabel, type CardId } from "@/components/guide";
import { cards, guideStats } from "@/components/media.generated";

const RULE = { raise: "border-jade", pass: "border-faint", aside: "border-brass" } as const;

/** A card, as the guide names it: its face, its name and Essence, and why. */
export default function CardChip({ card, reason, tone }: { card: CardId; reason: string; tone: keyof typeof RULE }) {
  const c = guideStats.cards[card];
  const face = cards[`adept_${card}`];
  return (
    <li className={`flex gap-4 border-l-2 py-3 pl-4 ${RULE[tone]}`}>
      <Image
        src={face.src}
        width={face.width}
        height={face.height}
        alt=""
        sizes="56px"
        className="h-auto w-14 flex-none self-start drop-shadow-[0_6px_10px_var(--well)]"
      />
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-semibold text-parchment">
          <Image src={`/media/icons/${c.essence}.svg`} alt="" width={16} height={16} className="flex-none" />
          <span>{cardLabel(card)}</span>
          <span className="sr-only">, {essenceLabel(c.essence)} Essence</span>
        </p>
        <p className="mt-1 text-[0.9375rem] leading-relaxed text-muted">{reason}</p>
      </div>
    </li>
  );
}
