import Image from "next/image";
import { screenshots as shots } from "../content";
import { screenshots as media } from "../media.generated";
import Lightbox from "./Lightbox";

/**
 * Real screenshots of a real, seeded game, made by the game's own store
 * screenshot tool. A strip you scroll sideways; each shot is a link to the
 * full image, which the viewer takes over when scripts run.
 */
export default function Gallery() {
  const items = shots.map((s) => ({ ...s, ...media[s.id] }));
  return (
    <section id="screenshots" aria-labelledby="screenshots-title" className="ground-2 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <h2 id="screenshots-title" className="font-display text-4xl font-semibold sm:text-5xl">
          See it in play
        </h2>
        <p className="mt-4 max-w-[60ch] text-lg text-muted">
          Played sideways on a phone or tablet. Select a screenshot to see it full size.
        </p>
      </div>
      <Lightbox items={items}>
        <ul className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 [scrollbar-color:var(--line)_transparent] sm:gap-8 xl:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
          {items.map((s, i) => (
            <li key={s.id} className="w-[86vw] shrink-0 snap-center sm:w-[560px] lg:w-[640px]">
              <figure>
                <a
                  href={s.src}
                  data-index={i}
                  className="block overflow-hidden rounded-2xl border border-line bg-stone p-1.5 shadow-[0_24px_60px_-24px_var(--well)] transition-colors hover:border-edge"
                >
                  <Image
                    src={s.src}
                    width={s.width}
                    height={s.height}
                    alt={s.alt}
                    sizes="(min-width: 1024px) 640px, (min-width: 640px) 560px, 86vw"
                    className="h-auto w-full rounded-xl bg-well"
                  />
                </a>
                <figcaption className="mt-4 font-display text-lg text-parchment">{s.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Lightbox>
    </section>
  );
}
