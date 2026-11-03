"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ENEMY_ASPECT, EnemyPanel, JourneyPanel } from "./TrialPanel";

type Img = { src: string; width: number; height: number };
type Piece = { key: string; name: string; alt: string };
type Figure = { value: number; affinity: string | null };

/** A foe's printed stats, and a road's. */
export type EnemyStats = { hp: number; speed: number; attack: Figure; armor: readonly Figure[]; xp: number; trait: string | null; traitIcon: string | null };
export type JourneyStats = { mp: Figure; delay: number; xp: number; obstacle: string | null; obstacleIcon: string | null };

export type RoadRegion = {
  n: number;
  name: string;
  alt: string;
  card: Img;
  enemies: (Piece & { scene: Img; stats: EnemyStats })[];
  journeys: (Piece & { art: Img; stats: JourneyStats })[];
};

export type RoadDragon = {
  id: "lightning" | "water" | "fire" | "shadow";
  order: number;
  name: string;
  title: string;
  line: string;
  card: Img;
};

type Focus =
  | { kind: "enemy"; region: RoadRegion; piece: RoadRegion["enemies"][number] }
  | { kind: "journey"; region: RoadRegion; piece: RoadRegion["journeys"][number] };

const NUMERAL = ["I", "II", "III", "IV"];
const GROUND = ["ground-1", "ground-2", "ground-3", "ground-4"];

/** Where each panel sits on a printed Region Card, in percent of the card:
 * its four foes two by two, then its four roads in a row along the foot. */
const ENEMY_SPOTS = [
  { left: 4.8, top: 12.5, width: 44.3, height: 22.4 },
  { left: 50.9, top: 12.5, width: 44.3, height: 22.4 },
  { left: 4.8, top: 38.3, width: 44.3, height: 22.1 },
  { left: 50.9, top: 38.3, width: 44.3, height: 22.1 },
];
const JOURNEY_SPOTS = [0.8, 25.6, 50.3, 75.5].map((left) => ({ left, top: 65.1, width: 23.9, height: 30.3 }));

const pct = (s: { left: number; top: number; width: number; height: number }): CSSProperties => ({
  left: `${s.left}%`,
  top: `${s.top}%`,
  width: `${s.width}%`,
  height: `${s.height}%`,
});

/** Each dragon's Essence, its bright shade for its name: written out so Tailwind sees every class. */
const INK = { lightning: "text-lightning-bright", water: "text-water-bright", fire: "text-fire-bright", shadow: "text-shadow-bright" };

const focusId = (f: Focus) => `${f.kind}-${f.piece.key}`;

/**
 * The road, walked one card at a time: a row for each Region Card in the order
 * they are crossed, then the four Dragon Cards side by side at its end, each
 * with its name, title and line, in the order beating one wakes the next. Each
 * Region's row keeps its card and a highlight of the one thing picked on it in
 * view together. Every foe and road on a card is a target: hover it with a
 * mouse, tap it, or move to it with the keyboard, and the row's highlight
 * shows it large.
 *
 * On a wide screen the card and highlight sit side by side, swapping sides
 * from one row to the next as the road winds down the page, the highlight's
 * picture level with the top of the card and the heading above it. On a phone the
 * highlight sits above the card, both small enough to share the screen.
 */
export default function Road({ regions, dragons }: { regions: RoadRegion[]; dragons: RoadDragon[] }) {
  return (
    <ol className="mt-12">
      {regions.map((r, i) => (
        <Row
          key={r.n}
          index={i}
          ground={GROUND[r.n - 1]}
          heading={
            <>
              <span aria-hidden="true" className="text-brass">{NUMERAL[r.n - 1]}</span> {r.name}
              <span className="sr-only">, region {r.n}</span>
            </>
          }
          first={{ kind: "enemy", region: r, piece: r.enemies[0] }}
          preload={[...r.enemies.map((e) => e.scene.src), ...r.journeys.map((j) => j.art.src)]}
          card={(target) => (
            <div className="relative">
              <Image
                src={r.card.src}
                width={r.card.width}
                height={r.card.height}
                alt={r.alt}
                sizes="(min-width: 768px) 320px, 64vw"
                className="h-auto w-full drop-shadow-[0_18px_28px_var(--well)]"
              />
              {r.enemies.map((e, k) =>
                target({ kind: "enemy", region: r, piece: e }, `${e.name}, a foe of the ${r.name}`, pct(ENEMY_SPOTS[k])),
              )}
              {r.journeys.map((j, k) =>
                target({ kind: "journey", region: r, piece: j }, `${j.name}, a road through the ${r.name}`, pct(JOURNEY_SPOTS[k])),
              )}
            </div>
          )}
        />
      ))}
      <li id="dragons" className="ground-lair py-12 sm:py-16 md:pt-28">
        <div className="mx-auto max-w-5xl px-6">
          <h3 className="font-display text-2xl font-semibold text-fire-bright sm:text-3xl">Then the dragon</h3>
          <p className="mt-3 max-w-[60ch] text-muted">
            Every hunt starts with Thrallis. Win on Normal or harder and the next dragon wakes, each one harder to
            bring down than the last. Stuck on one?{" "}
            <Link href="/guide" className="text-brass underline underline-offset-4 hover:text-brass-bright">
              Read the guide to each dragon
            </Link>
            .
          </p>
          <ol className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
            {dragons.map((d) => (
              <li key={d.id}>
                <Image
                  src={d.card.src}
                  width={d.card.width}
                  height={d.card.height}
                  alt={`The Dragon Card of ${d.name}, ${d.title}, dragon ${d.order}`}
                  sizes="(min-width: 1024px) 230px, (min-width: 768px) 22vw, 44vw"
                  className="h-auto w-full drop-shadow-[0_18px_28px_var(--well)]"
                />
                <h4 className={`mt-4 font-display text-xl font-semibold sm:text-2xl ${INK[d.id]}`}>
                  <span className="sr-only">Dragon {d.order}: </span>
                  {d.name}
                </h4>
                <p className="mt-0.5 font-display text-parchment">{d.title}</p>
                <p className="mt-2 font-display leading-relaxed text-muted italic">{d.line}</p>
              </li>
            ))}
          </ol>
        </div>
      </li>
    </ol>
  );
}

type Target = (f: Focus, label: string, style: CSSProperties) => ReactNode;

/** One stop on the road: a card and the highlight of what is picked on it. */
function Row({
  index,
  ground,
  heading,
  first,
  preload,
  card,
}: {
  index: number;
  ground: string;
  heading: ReactNode;
  first: Focus;
  /** Every picture the highlight can show, fetched as the row nears the screen. */
  preload: string[];
  card: (target: Target) => ReactNode;
}) {
  const [focus, setFocus] = useState<Focus>(first);
  const row = useRef<HTMLLIElement>(null);
  const preloadKey = preload.join("\n");

  // Fetch and decode the row's pictures before the first hover, so a pick shows at once.
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        for (const src of preloadKey.split("\n")) {
          const img = new window.Image();
          img.src = src;
          img.decode().catch(() => {});
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [preloadKey]);
  const current = focusId(focus);
  const highlightId = `road-highlight-${index}`;
  const flip = index % 2 === 1;

  /** A target over one panel of the card: hover, focus or tap shows it. */
  const target: Target = (f, label, style) => {
    const on = focusId(f) === current;
    return (
      <button
        key={focusId(f)}
        type="button"
        aria-label={label}
        aria-pressed={on}
        aria-controls={highlightId}
        onPointerEnter={(e) => e.pointerType === "mouse" && setFocus(f)}
        onFocus={() => setFocus(f)}
        onClick={() => setFocus(f)}
        style={style}
        className={`absolute rounded-md transition-[box-shadow,background-color] focus-visible:outline-none ${
          on
            ? "bg-brass/10 shadow-[inset_0_0_0_2px_var(--brass-bright),0_0_24px_var(--brass)]"
            : "hover:bg-parchment/5 hover:shadow-[0_0_0_1px_var(--edge)]"
        }`}
      />
    );
  };

  return (
    <li ref={row} className={`${ground} py-12 sm:py-16 md:pt-28`}>
      <div className="mx-auto max-w-5xl px-6">
        <h3 className="font-display text-2xl font-semibold sm:text-3xl md:hidden">{heading}</h3>
        <div
          className={`mt-5 grid items-center gap-6 md:mt-0 md:items-start md:gap-12 ${flip ? "md:grid-cols-[1fr_320px]" : "md:grid-cols-[320px_1fr]"}`}
        >
          <div
            className={`order-2 mx-auto w-[min(64vw,300px)] md:order-none md:w-[320px] ${
              flip ? "md:col-start-2 md:row-start-1" : ""
            }`}
          >
            {card(target)}
          </div>
          <div className={`relative order-1 md:order-none ${flip ? "md:col-start-1 md:row-start-1" : ""}`}>
            <h3 className="absolute bottom-full left-0 mb-5 hidden font-display text-3xl font-semibold md:block">{heading}</h3>
            <Highlight id={highlightId} focus={focus} />
          </div>
        </div>
      </div>
    </li>
  );
}

/** The one thing in focus, large. A foe or a road is drawn as its Region Card
 * prints it, its figures in badges on the picture (TrialPanel.tsx), with its
 * name beneath on one line. Both take the shape of a foe's panel, so nothing
 * moves as the pick changes. Announced as it changes. */
function Highlight({ id, focus }: { id: string; focus: Focus }) {
  let stage;
  let name;
  if (focus.kind === "enemy") {
    const { piece: e } = focus;
    stage = <EnemyPanel name={e.name} alt={e.alt} scene={e.scene} stats={e.stats} />;
    name = e.name;
  } else {
    const { piece: j } = focus;
    // A road is printed upright: its panel stands over a blurred copy of its painting.
    stage = (
      <div className="relative h-full overflow-hidden rounded-xl border border-line bg-stone">
        <Image src={j.art.src} width={j.art.width} height={j.art.height} alt="" sizes="200px" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-xl" />
        <JourneyPanel name={j.name} alt={j.alt} art={j.art} stats={j.stats} className="absolute inset-y-0 left-1/2 h-full -translate-x-1/2 drop-shadow-[0_10px_20px_var(--well)]" />
      </div>
    );
    name = j.name;
  }

  return (
    <div id={id} aria-live="polite" className="relative">
      <div className="relative" style={{ aspectRatio: ENEMY_ASPECT }}>{stage}</div>
      <h4 className="mt-3 font-display text-2xl leading-tight font-semibold text-parchment md:mt-5 md:text-4xl">{name}</h4>
    </div>
  );
}
