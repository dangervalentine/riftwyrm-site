"use client";

import Image from "next/image";
import { useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import type { MediaImage } from "../media.generated";

export type HandCard = { card: MediaImage; r: number };

/** Which card is lifted: one of the hand's, by index, or the deck's top card. */
type Lifted = number | "deck" | null;

/**
 * The hand fanned out from under the hero's deck. Pointing at a card (or
 * tapping it) lifts it out of the hand, in front of the deck, and dims the
 * rest.
 *
 * Each card is drawn twice: its picture, which lifts and ignores the pointer,
 * and an invisible target that stays where the card rests, in the order the
 * cards rest in. So which card the pointer is on is always decided by the hand
 * at rest: a lifted card never covers the cards next to it.
 *
 * The deck (`deck`, its top card marked `hero-top`) lifts the same way, its own
 * top card rising off it.
 */
export default function HeroHand({ cards, deck }: { cards: HandCard[]; deck: ReactNode }) {
  const [on, setOn] = useState<Lifted>(null);
  const point = (id: Exclude<Lifted, null>) => ({
    onPointerEnter: (e: PointerEvent) => e.pointerType === "mouse" && setOn(id),
    onPointerLeave: (e: PointerEvent) => e.pointerType === "mouse" && setOn((cur) => (cur === id ? null : cur)),
    onPointerDown: (e: PointerEvent) => e.pointerType !== "mouse" && setOn((cur) => (cur === id ? null : id)),
  });
  const dim = (id: Exclude<Lifted, null>) => (on !== null && on !== id) || undefined;
  const fan = (r: number) =>
    ({ "--fan-r": `${r}deg`, "--fan-delay": `${300 + (Math.abs(r) / 9) * 90}ms` }) as CSSProperties;
  const place = "hero-fan absolute top-[4%] left-[30%] w-[40%] origin-[50%_150%]";

  return (
    <>
      <div className="hero-hand absolute inset-0">
        {cards.map(({ card, r }, i) => (
          <div
            key={card.src}
            style={{ ...fan(r), zIndex: on === i ? 30 : undefined }}
            data-on={on === i || undefined}
            data-dim={dim(i)}
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
            {...point(i)}
          />
        ))}
      </div>
      {/* The deck: the Dragon Card on top, with the edges of the cards under it. */}
      <div
        className="hero-card relative mx-auto w-[44%]"
        data-on={on === "deck" || undefined}
        data-dim={dim("deck")}
        {...point("deck")}
      >
        {deck}
      </div>
    </>
  );
}
