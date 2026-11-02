import Image from "next/image";
import type { CSSProperties } from "react";
import { hand, regions } from "../content";
import { cards } from "../media.generated";
import { site } from "../site";

const NUMERAL = ["I", "II", "III", "IV"];

/** Where each card of the hand sits in its fan. */
const FAN: CSSProperties[] = [
  { transform: "translateY(10%) rotate(-12deg)" },
  { transform: "translateY(2%) rotate(-4deg)" },
  { transform: "translateY(2%) rotate(4deg)" },
  { transform: "translateY(10%) rotate(12deg)" },
];

/**
 * The deck is the world. The road is the four printed Region Cards in the
 * order they are crossed, each holding its foes and roads, and the Dragon
 * Card at its end; your hand is your Adept Cards, your powers and your
 * resources at once. The numerals are the order the regions are crossed.
 */
export default function Deck() {
  const dragon = cards.dragon_fire;
  return (
    <section aria-labelledby="deck-title" className="ground-1 overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <h2 id="deck-title" className="font-display text-4xl leading-tight font-semibold sm:text-5xl">
            The deck is the world
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-muted">{site.pitch}</p>
        </div>

        {/* The road: four regions, then the dragon. */}
        <h3 className="mt-16 font-display text-2xl font-semibold">The road</h3>
        <p className="mt-2 max-w-[60ch] text-muted">
          Each Region Card is a country of its own: four foes to face and four roads to cross. Draw your
          hand from beneath it, and the card that leads names what you meet next.
        </p>
      </div>
      <ol className="mt-10 flex snap-x snap-mandatory items-end gap-4 overflow-x-auto px-6 pb-6 [scrollbar-color:var(--line)_transparent] sm:gap-5 xl:justify-center xl:overflow-visible">
        {regions.map((r) => {
          const c = cards[`region${r.n}` as const];
          return (
            <li key={r.n} className="relative w-[62vw] shrink-0 snap-center sm:w-[220px] xl:w-[204px]">
              <figure>
                <Image
                  src={c.src}
                  width={c.width}
                  height={c.height}
                  alt={r.alt}
                  sizes="(min-width: 640px) 220px, 62vw"
                  className="h-auto w-full drop-shadow-[0_18px_28px_var(--well)]"
                />
                <figcaption className="mt-4 flex items-baseline gap-2">
                  <span aria-hidden="true" className="font-display text-brass">{NUMERAL[r.n - 1]}</span>
                  <span className="font-display text-lg text-parchment">{r.name}</span>
                  <span className="sr-only">, region {r.n}</span>
                </figcaption>
              </figure>
            </li>
          );
        })}
        <li className="w-[62vw] shrink-0 snap-center sm:w-[220px] xl:w-[204px]">
          <figure>
            <Image
              src={dragon.src}
              width={dragon.width}
              height={dragon.height}
              alt="Cindermaw's Dragon Card: the dragon above its approach and its strength, dealt at the end of the road."
              sizes="(min-width: 640px) 220px, 62vw"
              className="h-auto w-full rounded-[4%] shadow-[0_0_60px_-10px_var(--fire)]"
            />
            <figcaption className="mt-4 font-display text-lg text-fire-bright">Then the dragon</figcaption>
          </figure>
        </li>
      </ol>

      {/* Your hand. */}
      <div className="mx-auto mt-20 grid max-w-6xl items-center gap-12 px-6 md:grid-cols-[1fr_1.1fr]">
        <div>
          <h3 className="font-display text-2xl font-semibold">Your hand</h3>
          <p className="mt-3 max-w-[52ch] text-lg leading-relaxed text-muted">
            Your Adept Cards are your powers and your resources at once. Play them to win each fight,
            level them down to brace against the damage when a fight goes wrong, and spend the XP you
            earn to raise them up again.
          </p>
        </div>
        <ul className="flex justify-center pt-4 pb-10" aria-label="A hand of Adept Cards">
          {hand.map((h, i) => {
            const c = cards[h.key];
            return (
              <li key={h.key} className="-mx-[0.5%] w-[25%] max-w-[170px]" style={FAN[i]}>
                <Image
                  src={c.src}
                  width={c.width}
                  height={c.height}
                  alt={`The ${h.name} Adept Card`}
                  sizes="(min-width: 768px) 170px, 26vw"
                  className="h-auto w-full drop-shadow-[0_16px_20px_var(--well)]"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
