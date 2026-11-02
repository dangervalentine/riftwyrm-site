"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";

type Img = { src: string; width: number; height: number };
type Piece = { key: string; name: string; alt: string };

export type RoadRegion = {
  n: number;
  name: string;
  alt: string;
  card: Img;
  enemies: (Piece & { art: Img; backdrop: Img })[];
  journeys: (Piece & { art: Img })[];
};

export type RoadDragon = {
  id: "lightning" | "water" | "fire" | "shadow";
  order: number;
  name: string;
  title: string;
  line: string;
  alt: string;
  art: Img;
  lair: Img;
};

type Focus =
  | { kind: "enemy"; region: RoadRegion; piece: RoadRegion["enemies"][number] }
  | { kind: "journey"; region: RoadRegion; piece: RoadRegion["journeys"][number] }
  | { kind: "dragon"; dragon: RoadDragon };

const NUMERAL = ["I", "II", "III", "IV"];

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

/** Each dragon's Essence, written out so Tailwind sees every class. */
const INK = { lightning: "text-lightning-bright", water: "text-water-bright", fire: "text-fire-bright", shadow: "text-shadow-bright" };
const FRAME = { lightning: "border-lightning/70", water: "border-water/80", fire: "border-fire/80", shadow: "border-shadow/80" };

/**
 * The road: the four printed Region Cards in the order they are crossed, then
 * a card of the four dragons waiting at its end. Every foe, road and dragon on
 * them is a target: hover it with a mouse, tap it, or move to it with the
 * keyboard, and it is shown on its own, large, in the highlight under the
 * cards.
 */
export default function Road({ regions, dragons }: { regions: RoadRegion[]; dragons: RoadDragon[] }) {
  const [focus, setFocus] = useState<Focus>({ kind: "enemy", region: regions[0], piece: regions[0].enemies[0] });

  const id = (f: Focus) => (f.kind === "dragon" ? `dragon-${f.dragon.id}` : `${f.kind}-${f.piece.key}`);
  const current = id(focus);

  /** A target over one panel of a card: hover, focus or tap shows it. */
  const target = (f: Focus, label: string, style: CSSProperties, extra = "") => {
    const on = id(f) === current;
    return (
      <button
        key={id(f)}
        type="button"
        aria-label={label}
        aria-pressed={on}
        aria-controls="road-highlight"
        onPointerEnter={(e) => e.pointerType === "mouse" && setFocus(f)}
        onFocus={() => setFocus(f)}
        onClick={() => setFocus(f)}
        style={style}
        className={`absolute rounded-md transition-[box-shadow,background-color] focus-visible:outline-none ${
          on
            ? "bg-brass/10 shadow-[inset_0_0_0_2px_var(--brass-bright),0_0_24px_var(--brass)]"
            : "hover:bg-parchment/5 hover:shadow-[0_0_0_1px_var(--edge)]"
        } ${extra}`}
      />
    );
  };

  return (
    <>
      <ol className="mt-10 flex snap-x snap-mandatory items-end gap-4 overflow-x-auto px-6 pt-2 pb-6 [scrollbar-color:var(--line)_transparent] sm:gap-5 xl:justify-center xl:overflow-visible">
        {regions.map((r) => (
          <li key={r.n} className="relative w-[62vw] shrink-0 snap-center sm:w-[220px] xl:w-[204px]">
            <figure>
              <div className="relative">
                <Image
                  src={r.card.src}
                  width={r.card.width}
                  height={r.card.height}
                  alt={r.alt}
                  sizes="(min-width: 640px) 220px, 62vw"
                  className="h-auto w-full drop-shadow-[0_18px_28px_var(--well)]"
                />
                {r.enemies.map((e, i) =>
                  target({ kind: "enemy", region: r, piece: e }, `${e.name}, a foe of the ${r.name}`, pct(ENEMY_SPOTS[i])),
                )}
                {r.journeys.map((j, i) =>
                  target({ kind: "journey", region: r, piece: j }, `${j.name}, a road through the ${r.name}`, pct(JOURNEY_SPOTS[i])),
                )}
              </div>
              <figcaption className="mt-4 flex items-baseline gap-2">
                <span aria-hidden="true" className="font-display text-brass">{NUMERAL[r.n - 1]}</span>
                <span className="font-display text-lg text-parchment">{r.name}</span>
                <span className="sr-only">, region {r.n}</span>
              </figcaption>
            </figure>
          </li>
        ))}

        {/* The dragons' card: all four, two by two, drawn like a Region Card. */}
        <li className="relative w-[62vw] shrink-0 snap-center sm:w-[220px] xl:w-[204px]">
          <figure>
            <div className="relative flex aspect-[497/687] flex-col rounded-[4%] border border-card-edge-line bg-card-frame p-[5%] shadow-[0_0_60px_-12px_var(--fire)]">
              <div className="text-center">
                <p className="font-display text-[clamp(0.95rem,4.2vw,1.2rem)] leading-tight font-semibold text-parchment sm:text-lg xl:text-base">
                  The Dragons
                </p>
                <p className="font-display text-[0.6rem] tracking-[0.18em] text-muted uppercase">The end of the road</p>
              </div>
              <ul className="mt-[5%] grid flex-1 grid-cols-2 grid-rows-2 gap-[4%]">
                {dragons.map((d) => {
                  const f: Focus = { kind: "dragon", dragon: d };
                  return (
                    <li key={d.id} className={`relative overflow-hidden rounded-md border ${FRAME[d.id]}`}>
                      <Image src={d.lair.src} width={d.lair.width} height={d.lair.height} alt="" sizes="110px" className="absolute inset-0 h-full w-full object-cover" />
                      <Image
                        src={d.art.src}
                        width={d.art.width}
                        height={d.art.height}
                        alt=""
                        sizes="130px"
                        className="absolute inset-x-0 bottom-[14%] mx-auto w-[118%] max-w-none -translate-x-[8%]"
                      />
                      <span className={`absolute inset-x-0 bottom-0 bg-well/80 py-0.5 text-center font-display text-[0.65rem] leading-tight ${INK[d.id]}`}>
                        {d.name}
                      </span>
                      {target(f, `${d.name}, ${d.title}, dragon ${d.order}`, { inset: 0 }, "!rounded-md")}
                    </li>
                  );
                })}
              </ul>
            </div>
            <figcaption className="mt-4 font-display text-lg text-fire-bright">Then the dragon</figcaption>
          </figure>
        </li>
      </ol>

      <Highlight focus={focus} />
    </>
  );
}

/** The one thing in focus, large: a foe on its own ground, a road, or a
 * dragon in its lair, with its name and where it belongs. The pictures are
 * left unnamed for screen readers because the text beside them describes
 * them, and is announced as it changes. */
function Highlight({ focus }: { focus: Focus }) {
  let stage;
  let kicker;
  let name;
  let body;
  let ink = "text-parchment";
  if (focus.kind === "enemy") {
    const { piece: e, region: r } = focus;
    stage = (
      <>
        <Image src={e.backdrop.src} width={e.backdrop.width} height={e.backdrop.height} alt="" sizes="(min-width: 768px) 560px, 92vw" className="absolute inset-0 h-full w-full object-cover opacity-85" />
        <Image src={e.art.src} width={e.art.width} height={e.art.height} alt="" sizes="(min-width: 768px) 400px, 70vw" className="absolute inset-x-0 bottom-0 mx-auto h-[94%] w-auto drop-shadow-[0_14px_18px_var(--well)]" />
      </>
    );
    kicker = `A foe of the ${r.name}, region ${NUMERAL[r.n - 1]}`;
    name = e.name;
    body = e.alt;
  } else if (focus.kind === "journey") {
    const { piece: j, region: r } = focus;
    stage = <Image src={j.art.src} width={j.art.width} height={j.art.height} alt="" sizes="(min-width: 768px) 560px, 92vw" className="absolute inset-0 h-full w-full object-cover" />;
    kicker = `A road through the ${r.name}, region ${NUMERAL[r.n - 1]}`;
    name = j.name;
    body = j.alt;
  } else {
    const d = focus.dragon;
    stage = (
      <>
        <Image src={d.lair.src} width={d.lair.width} height={d.lair.height} alt="" sizes="(min-width: 768px) 560px, 92vw" className="absolute inset-0 h-full w-full object-cover" />
        <Image src={d.art.src} width={d.art.width} height={d.art.height} alt="" sizes="(min-width: 768px) 460px, 80vw" className="absolute inset-x-0 bottom-0 mx-auto h-[100%] w-auto drop-shadow-[0_14px_18px_var(--well)]" />
      </>
    );
    kicker = `Dragon ${NUMERAL[d.order - 1]}, ${d.title}`;
    name = d.name;
    body = d.line;
    ink = INK[d.id];
  }

  return (
    <div className="mx-auto mt-8 max-w-6xl px-6">
      <div
        id="road-highlight"
        aria-live="polite"
        className="grid items-center gap-6 rounded-2xl border border-line bg-well/60 p-4 sm:p-6 md:grid-cols-[1.25fr_1fr] md:gap-10"
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-stone">{stage}</div>
        <div className="md:pr-4">
          <p className="text-sm text-muted">{kicker}</p>
          <h4 className={`mt-1 font-display text-3xl font-semibold sm:text-4xl ${ink}`}>{name}</h4>
          <p className={`mt-3 text-lg leading-relaxed text-muted ${focus.kind === "dragon" ? "font-display italic" : ""}`}>{body}</p>
          <p className="mt-6 text-sm text-muted">Hover or tap any foe, road or dragon on the cards above.</p>
        </div>
      </div>
    </div>
  );
}
