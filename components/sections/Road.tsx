"use client";

import Image from "next/image";
import { useState, type CSSProperties, type ReactNode } from "react";

type Img = { src: string; width: number; height: number };
type Piece = { key: string; name: string; alt: string };
type Essence = "lightning" | "water" | "fire" | "shadow";
type Figure = { value: number; affinity: string | null };

/** A foe's printed stats, and a road's. */
export type EnemyStats = { hp: number; speed: number; attack: Figure; armor: readonly Figure[]; xp: number; trait: string | null };
export type JourneyStats = { mp: Figure; delay: number; xp: number; obstacle: string | null };

export type RoadRegion = {
  n: number;
  name: string;
  alt: string;
  card: Img;
  enemies: (Piece & { art: Img; backdrop: Img; stats: EnemyStats })[];
  journeys: (Piece & { art: Img; stats: JourneyStats })[];
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

/** Each dragon's Essence, written out so Tailwind sees every class. */
const INK = { lightning: "text-lightning-bright", water: "text-water-bright", fire: "text-fire-bright", shadow: "text-shadow-bright" };
const FRAME = { lightning: "border-lightning/70", water: "border-water/80", fire: "border-fire/80", shadow: "border-shadow/80" };

const focusId = (f: Focus) => (f.kind === "dragon" ? `dragon-${f.dragon.id}` : `${f.kind}-${f.piece.key}`);

/**
 * The road, walked one card at a time: a row for each Region Card in the order
 * they are crossed, then a row for the four dragons at its end. Each row keeps
 * its card and a highlight of the one thing picked on it in view together.
 * Every foe, road and dragon on a card is a target: hover it with a mouse, tap
 * it, or move to it with the keyboard, and the row's highlight shows it large.
 *
 * On a wide screen the card and highlight sit side by side, swapping sides
 * from one row to the next as the road winds down the page. On a phone the
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
      <Row
        index={regions.length}
        ground="ground-lair"
        heading={<span className="text-fire-bright">Then the dragon</span>}
        first={{ kind: "dragon", dragon: dragons[0] }}
        card={(target) => <DragonsCard dragons={dragons} target={target} />}
      />
    </ol>
  );
}

type Target = (f: Focus, label: string, style: CSSProperties, extra?: string) => ReactNode;

/** One stop on the road: a card and the highlight of what is picked on it. */
function Row({
  index,
  ground,
  heading,
  first,
  card,
}: {
  index: number;
  ground: string;
  heading: ReactNode;
  first: Focus;
  card: (target: Target) => ReactNode;
}) {
  const [focus, setFocus] = useState<Focus>(first);
  const current = focusId(focus);
  const highlightId = `road-highlight-${index}`;
  const flip = index % 2 === 1;

  /** A target over one panel of the card: hover, focus or tap shows it. */
  const target: Target = (f, label, style, extra = "") => {
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
        } ${extra}`}
      />
    );
  };

  return (
    <li className={`${ground} py-12 sm:py-16`}>
      <div className="mx-auto max-w-5xl px-6">
        <h3 className="font-display text-2xl font-semibold sm:text-3xl md:hidden">{heading}</h3>
        <div
          className={`mt-5 grid items-center gap-6 md:mt-0 md:gap-12 ${flip ? "md:grid-cols-[1fr_320px]" : "md:grid-cols-[320px_1fr]"}`}
        >
          <div
            className={`order-2 mx-auto w-[min(64vw,300px)] md:order-none md:w-[320px] ${
              flip ? "md:col-start-2 md:row-start-1" : ""
            }`}
          >
            {card(target)}
          </div>
          <div className={`order-1 md:order-none ${flip ? "md:col-start-1 md:row-start-1" : ""}`}>
            <h3 className="mb-5 hidden font-display text-3xl font-semibold md:block">{heading}</h3>
            <Highlight id={highlightId} focus={focus} />
          </div>
        </div>
      </div>
    </li>
  );
}

/** The four dragons on one card, two by two, drawn like a Region Card. */
function DragonsCard({ dragons, target }: { dragons: RoadDragon[]; target: Target }) {
  return (
    <div className="relative flex aspect-[497/687] flex-col rounded-[4%] border border-card-edge-line bg-card-frame p-[5%] shadow-[0_0_60px_-12px_var(--fire)]">
      <div className="text-center">
        <p className="font-display text-lg leading-tight font-semibold text-parchment md:text-xl">The Dragons</p>
        <p className="font-display text-[0.65rem] tracking-[0.18em] text-muted uppercase">The end of the road</p>
      </div>
      <ul className="mt-[5%] grid flex-1 grid-cols-2 grid-rows-2 gap-[4%]">
        {dragons.map((d) => (
          <li key={d.id} className={`relative overflow-hidden rounded-md border ${FRAME[d.id]}`}>
            <Image src={d.lair.src} width={d.lair.width} height={d.lair.height} alt="" sizes="160px" className="absolute inset-0 h-full w-full object-cover" />
            <Image
              src={d.art.src}
              width={d.art.width}
              height={d.art.height}
              alt=""
              sizes="180px"
              className="absolute inset-x-0 bottom-[14%] mx-auto w-[118%] max-w-none -translate-x-[8%]"
            />
            <span className={`absolute inset-x-0 bottom-0 bg-well/80 py-0.5 text-center font-display text-xs leading-tight ${INK[d.id]}`}>
              {d.name}
            </span>
            {target({ kind: "dragon", dragon: d }, `${d.name}, ${d.title}, dragon ${d.order}`, { inset: 0 }, "!rounded-md")}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One printed stat: the game's icon for it, its value, and its name. An
 * Essence, where the stat has one, is shown by its own icon in its colour. */
function Stat({ icon, value, label, essence }: { icon: string; value: number | string; label: string; essence?: string | null }) {
  const e = essence as Essence | null | undefined;
  return (
    <li className="flex items-center gap-1.5 rounded-lg border border-line bg-stone/80 px-2 py-1 sm:gap-2 sm:px-3 sm:py-1.5">
      <span aria-hidden="true" className="glyph size-4 text-muted" style={{ "--glyph": `url(/media/icons/${icon}.svg)` } as CSSProperties} />
      <span className="inline-block w-[2ch] text-center font-display text-base leading-none font-semibold text-parchment tabular-nums sm:text-lg">{value}</span>
      {e ? (
        <span
          aria-hidden="true"
          className={`glyph size-4 ${INK[e]}`}
          style={{ "--glyph": `url(/media/icons/${e}.svg)` } as CSSProperties}
        />
      ) : null}
      <span className="text-xs text-muted">
        {label}
        {e ? <span className="sr-only">, {e}</span> : null}
      </span>
    </li>
  );
}

/** A Trait or Obstacle, named as the game names it. */
function Rule({ kind, name }: { kind: string; name: string }) {
  return (
    <li className="flex items-center gap-1.5 rounded-lg border border-brass/40 bg-stone/80 px-2 py-1 text-sm sm:gap-2 sm:px-3 sm:py-1.5">
      <span className="text-muted">{kind}</span>
      <span className="font-display font-semibold text-brass-bright">{name}</span>
    </li>
  );
}

/** The one thing in focus, large. A foe stands on its own ground and a road
 * is shown whole, each with its name and its printed stats; a dragon stands in
 * its lair with its title and its line. Announced as it changes. */
function Highlight({ id, focus }: { id: string; focus: Focus }) {
  let stage;
  let name;
  let details;
  let ink = "text-parchment";
  if (focus.kind === "enemy") {
    const { piece: e } = focus;
    const st = e.stats;
    stage = (
      <>
        <Image src={e.backdrop.src} width={e.backdrop.width} height={e.backdrop.height} alt="" sizes="(min-width: 768px) 560px, 88vw" className="absolute inset-0 h-full w-full object-cover opacity-85" />
        <Image src={e.art.src} width={e.art.width} height={e.art.height} alt={e.alt} sizes="(min-width: 768px) 400px, 60vw" className="absolute inset-x-0 bottom-0 mx-auto h-[94%] w-auto drop-shadow-[0_14px_18px_var(--well)]" />
      </>
    );
    name = e.name;
    details = (
      <ul className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2" aria-label={`${e.name}'s stats`}>
        <Stat icon="hp" value={st.hp} label="HP" />
        <Stat icon="initiative" value={st.speed} label="Speed" />
        <Stat icon="attack" value={st.attack.value} label="Attack" essence={st.attack.affinity} />
        {st.armor.map((a, i) => (
          <Stat key={i} icon="armor" value={a.value} label="Armor" essence={a.affinity} />
        ))}
        <Stat icon="xp" value={st.xp} label="XP" />
        {st.trait ? <Rule kind="Trait" name={st.trait} /> : null}
      </ul>
    );
  } else if (focus.kind === "journey") {
    const { piece: j } = focus;
    const st = j.stats;
    // A road is painted upright: shown whole, over a blurred copy of itself.
    stage = (
      <>
        <Image src={j.art.src} width={j.art.width} height={j.art.height} alt="" sizes="200px" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-xl" />
        <Image src={j.art.src} width={j.art.width} height={j.art.height} alt={j.alt} sizes="(min-width: 768px) 320px, 50vw" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_20px_var(--well)]" />
      </>
    );
    name = j.name;
    details = (
      <ul className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2" aria-label={`${j.name}'s stats`}>
        <Stat icon="mp" value={st.mp.value} label="MP" essence={st.mp.affinity} />
        <Stat icon="time" value={st.delay} label="Delay" />
        <Stat icon="xp" value={st.xp} label="XP" />
        {st.obstacle ? <Rule kind="Obstacle" name={st.obstacle} /> : null}
      </ul>
    );
  } else {
    const d = focus.dragon;
    stage = (
      <>
        <Image src={d.lair.src} width={d.lair.width} height={d.lair.height} alt="" sizes="(min-width: 768px) 560px, 88vw" className="absolute inset-0 h-full w-full object-cover" />
        <Image src={d.art.src} width={d.art.width} height={d.art.height} alt={d.alt} sizes="(min-width: 768px) 460px, 70vw" className="absolute inset-x-0 bottom-0 mx-auto h-full w-auto drop-shadow-[0_14px_18px_var(--well)]" />
      </>
    );
    name = d.name;
    ink = INK[d.id];
    details = (
      <>
        <p className="text-sm text-muted">
          Dragon {NUMERAL[d.order - 1]}, {d.title}
        </p>
        <p className="mt-1 font-display leading-relaxed text-muted italic md:mt-2 md:text-lg">{d.line}</p>
      </>
    );
  }

  return (
    <div id={id} aria-live="polite" className="relative">
      <div className="relative aspect-[2/1] overflow-hidden rounded-xl border border-line bg-stone sm:aspect-[16/9] md:aspect-[16/10]">{stage}</div>
      <div data-details className="road-details">
        <h4 className={`mt-3 font-display text-2xl leading-tight font-semibold md:mt-5 md:text-4xl ${ink}`}>{name}</h4>
        {details}
      </div>
    </div>
  );
}
