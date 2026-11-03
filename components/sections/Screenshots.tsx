"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Shot = { id: string; src: string; width: number; height: number; alt: string; caption: string };

/**
 * The screenshots as a carousel (Embla): drag or swipe it, or step with the
 * buttons or the dots beneath. It loops, the shot in view centred with its
 * neighbours showing at the sides. Each shot is still a link to the full
 * image, which the viewer around it (Lightbox.tsx) takes over; a drag never
 * counts as a click. Without scripts it is a plain strip that scrolls sideways.
 */
export default function Screenshots({ items }: { items: Shot[] }) {
  const [viewport, embla] = useEmblaCarousel({ loop: true, align: "center", skipSnaps: false });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    onSelect();
    embla.on("select", onSelect).on("reInit", onSelect);
    return () => {
      embla.off("select", onSelect).off("reInit", onSelect);
    };
  }, [embla]);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Screenshots" className="mt-12">
      <div ref={viewport} className="overflow-x-auto [@media(scripting:enabled)]:overflow-hidden">
        <ul className="flex touch-pan-y">
          {items.map((s, i) => (
            <li
              key={s.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${items.length}`}
              className="min-w-0 shrink-0 grow-0 basis-[86vw] px-2.5 sm:basis-[580px] sm:px-4 lg:basis-[672px]"
            >
              <figure
                className={`transition-opacity duration-300 motion-reduce:transition-none ${i === selected ? "opacity-100" : "opacity-45"}`}
              >
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
                    sizes="(min-width: 1024px) 640px, (min-width: 640px) 548px, 82vw"
                    draggable={false}
                    className="h-auto w-full rounded-xl bg-well"
                  />
                </a>
                <figcaption className="mt-4 font-display text-lg text-parchment">{s.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-6 flex max-w-6xl items-center justify-center gap-5 px-6 [@media(scripting:none)]:hidden">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous screenshot"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-stone text-xl hover:border-edge"
        >
          ‹
        </button>
        <ol className="flex items-center gap-1" aria-label="Choose a screenshot">
          {items.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => embla?.scrollTo(i)}
                aria-label={`Screenshot ${i + 1}: ${s.caption}`}
                aria-current={i === selected ? "true" : undefined}
                className="grid size-6 place-items-center"
              >
                <span
                  className={`block h-2 rounded-full transition-[width,background-color] motion-reduce:transition-none ${
                    i === selected ? "w-6 bg-brass-bright" : "w-2 bg-line hover:bg-edge"
                  }`}
                />
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={next}
          aria-label="Next screenshot"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-stone text-xl hover:border-edge"
        >
          ›
        </button>
      </div>
    </div>
  );
}
