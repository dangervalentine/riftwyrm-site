"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { APP_STORE_MARK, GOOGLE_PLAY_SEGMENTS } from "./storeMarks";

/** How long the tap reveal stays up: long enough to read two words. */
const TAP_REVEAL_MS = 1600;

export type StoreButtonProps = {
  label: "App Store" | "Google Play";
  /** The small line above the name: "Download on the" / "Get it on". */
  eyebrow: string;
  /** The listing, or a page on this site (opened in the same tab). "" while
   * the game is not in that store yet. */
  href: string;
};

/**
 * A store button, ported from the developer's portfolio site so the two
 * match. Built from real type and an inline mark rather than the stores'
 * badge images, so it stays sharp at any pixel density, and kept in the
 * badges' own livery (a near-black plate under a pale rule) rather than the
 * game's palette: the shape is what a reader recognises from every app page.
 * Those raw colour values are the one allowed exception to the palette rule.
 *
 * With no `href` the store has no listing yet: the same plate, every part a
 * step quieter, no link. "Coming soon" replaces the top line on mouse hover,
 * or for a moment after a tap, and is always part of the button's text for a
 * screen reader. Both states take exactly the same space, so nothing moves
 * when a listing goes live.
 *
 * Changes from the portfolio: the reveal and the focus ring are the game's
 * brass, and the top line is set in the site's sans (it loads no mono face).
 */
export function StoreButton({ label, eyebrow, href }: StoreButtonProps) {
  const [revealed, setRevealed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  // A reveal left running past unmount would set state on a dead component.
  useEffect(() => clear, [clear]);

  const live = href !== "";

  const shape =
    "flex w-full items-center justify-center gap-2 rounded-lg border bg-[#010d17] px-2.5 py-2.5 min-[360px]:gap-3 min-[360px]:px-4 lg:py-3";

  // Live: /90 name, /55 eyebrow, /20 rule. Coming soon: /60 and /50, which
  // still pass 4.5:1 on the plate, and a /10 rule.
  const tone = live
    ? { edge: "border-white/20", name: "text-white/90", eyebrow: "text-white/55" }
    : { edge: "border-white/10", name: "text-white/60", eyebrow: "text-white/50" };

  const markClass = `h-6 w-6 shrink-0 lg:h-7 lg:w-7 ${live ? "" : "opacity-30"}`;

  const mark =
    label === "Google Play" ? (
      <svg viewBox="0 0 24 24" className={markClass} aria-hidden="true" focusable="false">
        {GOOGLE_PLAY_SEGMENTS.map((segment) => (
          <path key={segment.fill} d={segment.d} fill={segment.fill} />
        ))}
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" className={markClass} fill="currentColor" aria-hidden="true" focusable="false">
        <path d={APP_STORE_MARK} />
      </svg>
    );

  // 11px at every width: 10px or smaller is what audits flag as too small.
  const eyebrowClass = "text-[11px] font-semibold leading-none whitespace-nowrap tracking-[0.1em] uppercase";

  const contents = (
    <>
      {mark}
      <span className="flex flex-col items-start">
        {/* Both top lines share one grid cell, so the button is as wide as
            the longer of them whichever is showing and nothing slides. */}
        {/* Under 360px the two buttons share a row by dropping this line. */}
        <span className="hidden min-[360px]:grid">
          <span
            className={`${eyebrowClass} ${tone.eyebrow} col-start-1 row-start-1 transition-opacity duration-150 motion-reduce:transition-none ${
              revealed ? "opacity-0" : "opacity-100"
            }`}
          >
            {eyebrow}
          </span>
          {live ? null : (
            <span
              aria-hidden="true"
              className={`${eyebrowClass} pointer-events-none col-start-1 row-start-1 text-brass-bright select-none transition-opacity duration-150 motion-reduce:transition-none ${
                revealed ? "opacity-100" : "opacity-0"
              }`}
            >
              Coming soon
            </span>
          )}
        </span>
        <span className="text-[15px] leading-none min-[360px]:mt-1 font-semibold tracking-tight lg:text-base">{label}</span>
        {live ? null : <span className="sr-only">, coming soon</span>}
      </span>
    </>
  );

  if (live) {
    return (
      <a
        href={href}
        {...(href.startsWith("/") ? {} : { target: "_blank", rel: "noreferrer" })}
        className={`${shape} ${tone.edge} ${tone.name} transition-colors hover:border-white/35 hover:bg-[#04192a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass`}
      >
        {contents}
      </a>
    );
  }

  return (
    <span
      className={`${shape} ${tone.edge} ${tone.name} cursor-not-allowed`}
      // Hover is a mouse affordance: touch fires enter on tap and never leave.
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        clear();
        setRevealed(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        clear();
        setRevealed(false);
      }}
      // Touch and pen get the timed reveal instead.
      onPointerUp={(event) => {
        if (event.pointerType === "mouse") return;
        clear();
        setRevealed(true);
        timer.current = setTimeout(() => setRevealed(false), TAP_REVEAL_MS);
      }}
    >
      {contents}
    </span>
  );
}
