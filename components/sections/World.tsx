import Image from "next/image";
import { enemies, journeys } from "../content";
import { enemies as enemyArt, journeys as journeyArt } from "../media.generated";

/** Some of the roads and the foes on them, in the game's own paintings. */
export default function World() {
  return (
    <section aria-labelledby="world-title" className="ground-4 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <h2 id="world-title" className="font-display text-4xl font-semibold sm:text-5xl">
          Sixteen foes on the road, four dragons at its end
        </h2>
        <p className="mt-4 max-w-[60ch] text-lg text-muted">
          Each region has its own country, its own roads and its own foes. A few of them:
        </p>

        <h3 className="sr-only">Roads</h3>
        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {journeys.map((j) => {
            const a = journeyArt[j.key as keyof typeof journeyArt];
            return (
              <li key={j.key}>
                <figure>
                  <Image
                    src={a.src}
                    width={a.width}
                    height={a.height}
                    alt={j.alt}
                    sizes="(min-width: 1024px) 180px, (min-width: 640px) 30vw, 46vw"
                    className="aspect-[896/1152] w-full rounded-xl border border-line object-cover"
                  />
                  <figcaption className="mt-3 font-display text-parchment">{j.name}</figcaption>
                </figure>
              </li>
            );
          })}
        </ul>

        <h3 className="sr-only">Foes</h3>
        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {enemies.map((en) => {
            const a = enemyArt[en.key as keyof typeof enemyArt];
            return (
              <li key={en.key}>
                <figure>
                  <div className="relative aspect-[1216/896] overflow-hidden rounded-xl border border-line">
                    <Image
                      src={a.backdrop.src}
                      width={a.backdrop.width}
                      height={a.backdrop.height}
                      alt=""
                      sizes="(min-width: 640px) 33vw, 50vw"
                      className="h-full w-full object-cover opacity-80"
                    />
                    <Image
                      src={a.art.src}
                      width={a.art.width}
                      height={a.art.height}
                      alt={en.alt}
                      sizes="(min-width: 640px) 25vw, 40vw"
                      className="absolute inset-x-0 bottom-0 mx-auto h-[96%] w-auto drop-shadow-[0_10px_12px_var(--well)]"
                    />
                  </div>
                  <figcaption className="mt-3 font-display text-parchment">{en.name}</figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
