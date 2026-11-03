"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import type { MediaImage } from "../media.generated";

export type HandCard = { card: MediaImage; r: number };

/**
 * The hand fanned out from under the hero's deck. Pointing at a card (or
 * tapping it) lifts it out of the hand, in front of the deck, and dims the
 * rest.
 *
 * Each card is drawn twice: its picture, which lifts and ignores the pointer,
 * and an invisible target that stays where the card rests, in the order the
 * cards rest in. So which card the pointer is on is always decided by the hand
 * at rest: a lifted card never covers the cards next to it.
 */
export default function HeroHand({ cards }: { cards: HandCard[] }) {
  const [on, setOn] = useState<number | null>(null);
  const fan = (r: number) =>
    ({ "--fan-r": `${r}deg`, "--fan-delay": `${300 + (Math.abs(r) / 9) * 90}ms` }) as CSSProperties;
  const place = "hero-fan absolute top-[4%] left-[30%] w-[40%] origin-[50%_150%]";

  return (
    <div className="hero-hand absolute inset-0" data-active={on !== null || undefined}>
      {cards.map(({ card, r }, i) => (
        <div
          key={card.src}
          style={{ ...fan(r), zIndex: on === i ? 30 : undefined }}
          data-on={on === i || undefined}
          className={`${place} pointer-events-none`}
        >
          <Image
            src={card.src}
            width={card.width}
            height={card.height}
            alt=""
            priority
            sizes="(min-width: 1024px) 230px, 44vw"
            className="hero-fan-card w-full drop-shadow-[0_12px_18px_var(--well)]"
          />
        </div>
      ))}
      {cards.map(({ card, r }, i) => (
        <div
          key={card.src}
          aria-hidden="true"
          style={{ ...fan(r), aspectRatio: `${card.width} / ${card.height}` }}
          className={place}
          onPointerEnter={(e) => e.pointerType === "mouse" && setOn(i)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setOn((cur) => (cur === i ? null : cur))}
          onPointerDown={(e) => e.pointerType !== "mouse" && setOn((cur) => (cur === i ? null : i))}
        />
      ))}
    </div>
  );
}
