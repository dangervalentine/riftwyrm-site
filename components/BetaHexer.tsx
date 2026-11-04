import Image from "next/image";
import type { CSSProperties } from "react";
import { enemies } from "./media.generated";

/** Where the head of the hexer's staff is, as shares of the figure's picture
 * (figure-goblin-hexer.webp, cut to the figure's edges). */
const STAFF = { x: "82%", y: "22%" };

/** A fixed scatter in [0, 1): the same on every render, so the burst is pure. */
const scatter = (i: number, k: number) => {
  const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

const BURST = Array.from({ length: 46 }, (_, i) => {
  const angle = scatter(i, 1) * Math.PI * 2;
  const reach = 30 + scatter(i, 2) * 90;
  return {
    star: scatter(i, 3) < 0.45,
    style: {
      "--dx": `${Math.cos(angle) * reach}px`,
      "--dy": `${Math.sin(angle) * reach - 20}px`,
      "--s": (0.6 + scatter(i, 4) * 0.9).toFixed(2),
      "--r": `${Math.round(scatter(i, 5) * 360 - 180)}deg`,
      "--c": ["var(--shadow-bright)", "var(--glitter-light)", "var(--glitter-deep)"][i % 3],
      animationDelay: `${Math.round(scatter(i, 6) * 260)}ms`,
      animationDuration: `${1300 + Math.round(scatter(i, 7) * 900)}ms`,
    } as CSSProperties,
  };
});

const TWINKLES = Array.from({ length: 12 }, (_, i) => {
  const angle = scatter(i, 11) * Math.PI * 2;
  const reach = 10 + scatter(i, 12) * 46;
  return {
    "--x": `${Math.cos(angle) * reach}px`,
    "--y": `${Math.sin(angle) * reach}px`,
    "--s": (0.5 + scatter(i, 13) * 0.7).toFixed(2),
    "--c": i % 2 ? "var(--shadow-bright)" : "var(--glitter-light)",
    animationDelay: `${900 + Math.round(scatter(i, 14) * 2000)}ms`,
    animationDuration: `${1600 + Math.round(scatter(i, 15) * 1400)}ms`,
  } as CSSProperties;
});

/**
 * The goblin hexer, on its own, beside the beta form: the same foe that keeps
 * the strategy guide at the end of the home page. When a sign-up goes through
 * (`casting`), purple glitter bursts from the head of its staff and keeps
 * twinkling there. Decoration only, so it is hidden from screen readers.
 */
export default function BetaHexer({ casting, className = "" }: { casting: boolean; className?: string }) {
  const { figure } = enemies["goblin-hexer"];
  return (
    <div aria-hidden="true" className={`relative ${className}`}>
      <Image src={figure.src} width={figure.width} height={figure.height} alt="" className="h-auto w-full" priority />
      {casting && (
        <span className="glitter" style={{ left: STAFF.x, top: STAFF.y }}>
          <span className="glitter-glow" />
          {BURST.map((p, i) => (
            <span key={i} className={p.star ? "glitter-bit glitter-star" : "glitter-bit glitter-dot"} style={p.style}>
              {p.star ? "✦" : null}
            </span>
          ))}
          {TWINKLES.map((style, i) => (
            <span key={`t${i}`} className="glitter-twinkle" style={style}>
              {"✦"}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}
