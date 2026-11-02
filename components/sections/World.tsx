import Image from "next/image";
import { world } from "../content";
import { enemies as enemyArt, journeys as journeyArt } from "../media.generated";
import HScroll from "./HScroll";

const NUMERAL = ["I", "II", "III", "IV"];

/** Each region's hue for the rule under its name, written out for Tailwind. */
const HUE = ["bg-region-1", "bg-region-2", "bg-region-3", "bg-region-4"];
const GROUND = ["ground-1", "ground-2", "ground-3", "ground-4"];

/**
 * Every foe and every road in the game, one region at a time: a strip of four
 * slides, swiped or stepped through in the order the regions are crossed, with
 * one region centred and in focus. Each is laid out as its Region Card is: its
 * four foes above its four roads.
 */
export default function World() {
  return (
    <section aria-labelledby="world-title" className="ground-4 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <h2 id="world-title" className="font-display text-4xl font-semibold sm:text-5xl">
          Sixteen foes on the road, four dragons at its end
        </h2>
        <p className="mt-4 max-w-[60ch] text-lg text-muted">
          Each region is a country of its own: four foes to face and four roads to cross. Here is every one of
          them, region by region.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-[920px]">
        <HScroll
          label="Every foe and road, region by region"
          labels={world.map((r) => `${NUMERAL[r.n - 1]}  ${r.region}`)}
          className="snap-x snap-mandatory"
        >
          <ol className="flex">
          {world.map((r) => (
            <li key={r.n} className="relative w-full shrink-0 snap-center px-6 md:px-16">
              <div className={`${GROUND[r.n - 1]} mx-auto max-w-[760px] rounded-2xl border border-line p-4 sm:p-6`}>
              <h3 className="flex items-baseline gap-3 font-display text-2xl font-semibold">
                <span aria-hidden="true" className="text-brass">{NUMERAL[r.n - 1]}</span>
                {r.region}
                <span className="sr-only">, region {r.n}</span>
              </h3>
              <span aria-hidden="true" className={`mt-2 block h-0.5 w-12 rounded-full ${HUE[r.n - 1]}`} />

              <h4 className="sr-only">Foes</h4>
              <ul className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
                {r.enemies.map((e) => {
                  const a = enemyArt[e.key as keyof typeof enemyArt];
                  return (
                    <li key={e.key}>
                      <figure>
                        <div className="relative aspect-[1216/896] overflow-hidden rounded-lg border border-line">
                          <Image
                            src={a.backdrop.src}
                            width={a.backdrop.width}
                            height={a.backdrop.height}
                            alt=""
                            sizes="(min-width: 768px) 180px, 22vw"
                            className="h-full w-full object-cover opacity-80"
                          />
                          <Image
                            src={a.art.src}
                            width={a.art.width}
                            height={a.art.height}
                            alt={e.alt}
                            sizes="(min-width: 640px) 110px, 16vw"
                            className="absolute inset-x-0 bottom-0 mx-auto h-[96%] w-auto drop-shadow-[0_6px_8px_var(--well)]"
                          />
                        </div>
                        <figcaption className="mt-2 text-xs leading-tight text-parchment sm:text-sm">{e.name}</figcaption>
                      </figure>
                    </li>
                  );
                })}
              </ul>

              <h4 className="sr-only">Roads</h4>
              <ul className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
                {r.journeys.map((j) => {
                  const a = journeyArt[j.key as keyof typeof journeyArt];
                  return (
                    <li key={j.key}>
                      <figure>
                        <Image
                          src={a.src}
                          width={a.width}
                          height={a.height}
                          alt={j.alt}
                          sizes="(min-width: 768px) 180px, 22vw"
                          className="aspect-[896/1152] w-full rounded-lg border border-line object-cover"
                        />
                        <figcaption className="mt-2 text-xs leading-tight text-parchment sm:text-sm">{j.name}</figcaption>
                      </figure>
                    </li>
                  );
                })}
              </ul>
              </div>
            </li>
          ))}
          </ol>
        </HScroll>
      </div>
    </section>
  );
}
