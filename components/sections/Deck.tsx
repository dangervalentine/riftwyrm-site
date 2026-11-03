import Image from "next/image";
import type { CSSProperties } from "react";
import { dragons, hand, regions, world } from "../content";
import { cards, enemies, journeys, regionStats } from "../media.generated";
import { site } from "../site";
import Road, { type RoadDragon, type RoadRegion } from "./Road";

/** The four Region Cards with every foe and road on them, for the road. */
const roadRegions: RoadRegion[] = regions.map((r) => {
  const w = world.find((x) => x.n === r.n)!;
  const stats = regionStats.find((x) => x.region === r.n)!;
  return {
    ...r,
    card: cards[`region${r.n}` as const],
    enemies: w.enemies.map((e, i) => ({ ...e, ...enemies[e.key as keyof typeof enemies], stats: stats.enemies[i] })),
    journeys: w.journeys.map((j, i) => ({ ...j, art: journeys[j.key as keyof typeof journeys], stats: stats.journeys[i] })),
  };
});

const roadDragons: RoadDragon[] = dragons.map((d) => ({ ...d, card: cards[`dragon_${d.id}`] }));

/** Where each card of the hand sits in its fan. */
const FAN: CSSProperties[] = [
  { transform: "translateY(10%) rotate(-12deg)" },
  { transform: "translateY(2%) rotate(-4deg)" },
  { transform: "translateY(2%) rotate(4deg)" },
  { transform: "translateY(10%) rotate(12deg)" },
];

/** Where each Region Card sits as the road sets off: in the order they are
 * crossed, each a step further down, tilting one way then the other as a road
 * winds. The hand's fan, mirrored. */
const ROAD: CSSProperties[] = [
  { transform: "translateY(-6%) rotate(-5deg)" },
  { transform: "translateY(4%) rotate(3deg)" },
  { transform: "translateY(14%) rotate(-3deg)" },
  { transform: "translateY(24%) rotate(5deg)" },
];

/**
 * The deck is the world. Your hand comes first, your Adept Cards, your powers
 * and your resources at once; then the road, the four printed Region Cards in
 * the order they are crossed, each holding its foes and roads, and the four
 * dragons at its end; anything on them can be looked at up close (Road.tsx).
 * The road runs to the section's foot, ending on the lair's ground.
 */
export default function Deck() {
  return (
    <section aria-labelledby="deck-title" className="ground-1 overflow-hidden pt-24 sm:pt-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <h2 id="deck-title" className="font-display text-4xl leading-tight font-semibold sm:text-5xl">
            The deck is the world
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-muted">{site.pitch}</p>
        </div>
      </div>

      {/* Your hand. */}
      <div className="mx-auto mt-16 grid max-w-6xl items-center gap-12 px-6 md:grid-cols-[1fr_1.1fr]">
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

      {/* The road: its four Region Cards beside its words, a foil to the hand above. */}
      <div className="mx-auto mt-20 grid max-w-6xl items-center gap-12 px-6 md:grid-cols-[1.1fr_1fr]">
        <ul className="order-2 flex justify-center pt-4 pb-14 md:order-none" aria-label="The four Region Cards, in the order they are crossed">
          {roadRegions.map((r, i) => (
            <li key={r.n} className="-mx-[0.5%] w-[25%] max-w-[170px]" style={ROAD[i]}>
              <Image
                src={r.card.src}
                width={r.card.width}
                height={r.card.height}
                alt={`The ${r.name} Region Card, region ${r.n}`}
                sizes="(min-width: 768px) 170px, 26vw"
                className="h-auto w-full drop-shadow-[0_16px_20px_var(--well)]"
              />
            </li>
          ))}
        </ul>
        <div className="order-1 md:order-none">
          <h3 className="font-display text-2xl font-semibold">The road</h3>
          <p className="mt-3 max-w-[52ch] text-lg leading-relaxed text-muted">
            Each Region Card is a country of its own: four foes to face and four roads to cross. Draw your
            hand from beneath it, and the card that leads names what you meet next. Hover or tap anything on
            the cards below to see it up close.
          </p>
        </div>
      </div>
      <Road regions={roadRegions} dragons={roadDragons} />
    </section>
  );
}
