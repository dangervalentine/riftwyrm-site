"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A strip of full-width slides, one in view at a time: swiped on touch, with
 * previous and next buttons beside it for a mouse, and a row of named tabs
 * under it that shows which slide is in view and jumps to any of them. The
 * strip itself takes keyboard focus, so the arrow keys move it too. Its first
 * child is the list of slides, each as wide as the strip.
 */
export default function HScroll({
  label,
  labels,
  children,
  className = "",
}: {
  label: string;
  /** One short name per slide, for the tabs under the strip. */
  labels: string[];
  children: ReactNode;
  className?: string;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const update = useCallback(() => {
    const el = strip.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  useEffect(() => {
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const go = (i: number) => {
    const el = strip.current;
    if (!el) return;
    const n = Math.max(0, Math.min(labels.length - 1, i));
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: n * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
  };

  const arrow =
    "grid size-11 place-items-center rounded-full border border-line bg-stone text-xl text-parchment transition-opacity hover:border-edge disabled:pointer-events-none disabled:opacity-0";

  return (
    <div>
      <div className="relative">
        <div
          ref={strip}
          onScroll={update}
          tabIndex={0}
          role="region"
          aria-label={label}
          className={`overflow-x-auto [scrollbar-width:none] focus-visible:outline-offset-[-2px] [&::-webkit-scrollbar]:hidden ${className}`}
        >
          {children}
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden items-center md:flex">
          <button type="button" tabIndex={-1} onClick={() => go(index - 1)} disabled={index === 0} className={`pointer-events-auto ${arrow}`}>
            ‹
          </button>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden items-center md:flex">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => go(index + 1)}
            disabled={index === labels.length - 1}
            className={`pointer-events-auto ${arrow}`}
          >
            ›
          </button>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2 px-6">
        {labels.map((name, i) => (
          <button
            key={name}
            type="button"
            onClick={() => go(i)}
            aria-current={i === index ? "true" : undefined}
            className={`rounded-full border px-4 py-1.5 font-display text-sm transition-colors ${
              i === index ? "border-brass/70 bg-stone text-brass-bright" : "border-line text-muted hover:text-parchment"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
