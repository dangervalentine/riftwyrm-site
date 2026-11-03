import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

/**
 * A foe or a road as its Region Card prints it, drawn large: a port of the
 * game's ui/widgets/region_panel.gd. Every part is a share of the panel, laid
 * out in container units (cqw, cqh) so it scales as one picture, as the
 * game's does when the Deck zooms into a panel.
 *
 * A foe is a framed picture on its scene with its figures in a column of
 * badges down the left, its Trait in the top right corner and its XP in a star
 * at the bottom right; the picture is baked whole by sync-assets.mjs, the foe
 * standing where the game stands it (trial_face.gd enemy_crop). A road has its MP and Delay in a dark strip along the top, its
 * painting below, its Obstacle at the top right of the painting and its star
 * at the foot.
 */

type Img = { src: string; width: number; height: number };
type Essence = "lightning" | "water" | "fire" | "shadow";
type Figure = { value: number; affinity: string | null };

/** The game's colours (ui/theme/tokens.gd). */
const ESSENCE: Record<Essence, { base: string; bright: string }> = {
  water: { base: "#2c4c80", bright: "#7aa5dc" },
  lightning: { base: "#a87d36", bright: "#d8ac5c" },
  shadow: { base: "#4f3a80", bright: "#a28ed0" },
  fire: { base: "#87302a", bright: "#d6765f" },
};
const PARCHMENT = "#e6e1d6";
const ON_BRASS = "#17120a";
const STAT_HP = "#c9505e";
const STAT_PLATE = "#0b0f12";
const BRASS_BRIGHT = "#e0bd6e";
const STEEL = "#aab3b8";
const EDGE = "#717f89";

const essence = (a: string | null) => ESSENCE[a as Essence];
const tint = (a: string | null) => essence(a)?.base ?? EDGE;
/** The ink on a plate of an Essence. */
const plateInk = (a: string | null) => (a === "lightning" ? ON_BRASS : PARCHMENT);

/** A Region Card is 5 by 7; a foe's panel is 0.445 of its width by 0.22 of its
 * height, a road's 0.2415 by 0.30 (region_card.gd LAYOUT). */
export const ENEMY_ASPECT = 0.445 / (0.22 * 1.4);
const JOURNEY_ASPECT = 0.2415 / (0.3 * 1.4);

/** Where the number sits inside each shape, in its 48-unit view box (stat_chip.gd WINDOW). */
const WINDOW: Record<string, [number, number, number, number]> = {
  hp: [8, 9, 32, 20],
  initiative: [9, 10, 27, 28],
  attack_badge: [12, 13, 24, 22],
  armor: [9, 8, 30, 24],
  time_badge: [16, 26, 16, 17],
  xp: [13, 14, 22, 20],
  mp: [14, 20, 21, 20],
};

const mask = (icon: string): CSSProperties =>
  ({ "--glyph": `url(/media/icons/${icon}.svg)` }) as CSSProperties;

/** A thin outline round a masked shape, the same width all round: drawn by
 * shadows on a wrapper, since a mask clips its own shadows. */
const ring = (colour: string, w: string) =>
  [`${w} 0`, `-${w} 0`, `0 ${w}`, `0 -${w}`].map((o) => `drop-shadow(${o} 0 ${colour})`).join(" ");

const darken = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * (1 - k)));
  return `rgb(${c.join(" ")})`;
};
const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
};

/**
 * One badge: a number on an icon shape, as stat_chip.gd draws it. `side` is in
 * cqh. A light number is edged in the dark of its shape (numerals.gd); an
 * Essence sits as a bare sigil on the corner; `backing` sets the shape on a
 * box with its top-left corner cut, as a road's MP is printed.
 */
function Badge({
  icon,
  value,
  label,
  colour,
  ink = PARCHMENT,
  affinity,
  backing,
  style,
  side,
}: {
  icon: string;
  value: number;
  label: string;
  colour: string;
  ink?: string;
  affinity?: string | null;
  backing?: string;
  style: CSSProperties;
  side: number;
}) {
  const e = essence(affinity ?? null);
  const inset = backing ? side * 0.05 : 0;
  const shape = side - 2 * inset;
  const [wx, wy, ww, wh] = WINDOW[icon];
  const k = shape / 48;
  const outline = luminance(ink) > 0.5 ? darken(colour, 0.7) : null;
  return (
    <li className="absolute" style={{ ...style, width: `${side}cqh`, height: `${side}cqh` }}>
      {backing ? (
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: backing,
            clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0 100%, 0 18%)",
            boxShadow: `inset 0 0 0 max(1px, ${side * 0.025}cqh) rgb(230 225 214 / 0.45)`,
          }}
        />
      ) : null}
      <span aria-hidden="true" className="absolute" style={{ inset: `${inset}cqh`, filter: ring("rgb(230 225 214 / 0.45)", `${Math.max(0.15, k * 1.25)}cqh`) }}>
        <span className="glyph absolute inset-0" style={{ ...mask(icon), color: colour }} />
      </span>
      <span
        aria-hidden="true"
        className="absolute flex items-center justify-center font-sans leading-none font-extrabold tabular-nums"
        style={{
          left: `${inset + wx * k}cqh`,
          top: `${inset + wy * k}cqh`,
          width: `${ww * k}cqh`,
          height: `${wh * k}cqh`,
          fontSize: `${Math.min(wh * k * 1.15, (ww * k * 1.6) / String(value).length)}cqh`,
          color: ink,
          textShadow: outline ? `0 0 0.06em ${outline}, 0 0 0.06em ${outline}, 0 0 0.12em ${outline}` : undefined,
        }}
      >
        {value}
      </span>
      {e ? (
        <span
          aria-hidden="true"
          className="absolute"
          style={{
            left: `${side * (1 - 0.14 - 0.18)}cqh`,
            top: `${side * (1 - 0.12 - 0.18)}cqh`,
            width: `${side * 0.36}cqh`,
            height: `${side * 0.36}cqh`,
            filter: `${ring("rgb(0 0 0 / 0.8)", `${side * 0.36 * 0.07}cqh`)} drop-shadow(0.03em 0.08em 0.05em rgb(0 0 0 / 0.3))`,
          }}
        >
          <span className="glyph absolute inset-0" style={{ ...mask(affinity!), color: `color-mix(in srgb, ${e.base}, ${e.bright})` }} />
        </span>
      ) : null}
      <span className="sr-only">
        {label} {value}
        {affinity ? `, ${affinity}` : ""}
      </span>
    </li>
  );
}

/** A Trait or Obstacle's mark: pale, on a dark hexagon a little larger than it. */
function Mark({ icon, name, kind, style, side }: { icon: string; name: string; kind: string; style: CSSProperties; side: number }) {
  const r = (22 / 48 + 0.07) * side;
  return (
    <li className="absolute" title={`${kind}: ${name}`} style={{ ...style, width: `${side}cqh`, height: `${side}cqh` }}>
      <span
        aria-hidden="true"
        className="absolute"
        style={{
          left: `${side / 2 - r * 0.866}cqh`,
          top: `${side / 2 - r}cqh`,
          width: `${r * 1.732}cqh`,
          height: `${r * 2}cqh`,
          background: STAT_PLATE,
          clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
        }}
      />
      <span aria-hidden="true" className="absolute inset-0" style={{ filter: ring("rgb(230 225 214 / 0.45)", `${side * 0.026}cqh`) }}>
        {/* A plaque is drawn in two inks, a pale hexagon and its dark mark, so it is shown as drawn. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/media/icons/${icon}.svg`} alt="" className="absolute inset-0 h-full w-full" />
      </span>
      <span className="sr-only">
        {kind}, {name}
      </span>
    </li>
  );
}

/** The panel's frame: its right-hand corners cut by `c` (region_panel.gd outline). */
function Frame({ aspect, colour, children, className = "", style }: { aspect: number; colour: string; children: ReactNode; className?: string; style?: CSSProperties }) {
  const w = 1000 * aspect;
  const h = 1000;
  const c = Math.min(w, h) * 0.07;
  const cx = (c / w) * 100;
  const cy = (c / h) * 100;
  const edge = Math.max(1.5, h * 0.012);
  const half = edge / 2;
  const line = [
    [half, half],
    [w - c, half],
    [w - half, c],
    [w - half, h - c],
    [w - c, h - half],
    [half, h - half],
  ];
  return (
    <div
      className={`relative [container-type:size] ${className}`}
      style={{ ...style, aspectRatio: aspect, clipPath: `polygon(0 0, ${100 - cx}% 0, 100% ${cy}%, 100% ${100 - cy}%, ${100 - cx}% 100%, 0 100%)` }}
    >
      {children}
      <svg aria-hidden="true" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
        <polygon points={line.map((p) => p.join(",")).join(" ")} fill="none" stroke={colour} strokeWidth={edge} strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export type EnemyPanelProps = {
  name: string;
  alt: string;
  /** The foe on its scene as one picture of the panel's shape: its backdrop, the glow of its
   * attack's Essence and its figure where the game stands it (sync-assets.mjs enemyScene). */
  scene: Img;
  stats: { hp: number; speed: number; attack: Figure; armor: readonly Figure[]; xp: number; trait: string | null; traitIcon: string | null };
};

/** A foe's panel, drawn large. */
export function EnemyPanel({ name, alt, scene, stats: st }: EnemyPanelProps) {
  const affinity = st.attack.affinity;
  // Badges in a column of four rows down the left; two shields share the last.
  const row = 92 / 4;
  const side = row * 0.94;
  const y = (i: number) => 4 + i * row + (row - side) / 2;
  const s = side * (st.armor.length > 1 ? 0.92 : 1);
  const xs = `2cqw`;
  return (
    <Frame aspect={ENEMY_ASPECT} colour={tint(affinity)} className="w-full" style={{ background: `color-mix(in srgb, ${tint(affinity)} 18%, transparent)` }}>
      <Image src={scene.src} width={scene.width} height={scene.height} alt={alt} className="absolute inset-0 h-full w-full" />
      <ul aria-label={`${name}'s stats`}>
        <Badge icon="hp" value={st.hp} label="HP" colour={STAT_HP} side={side} style={{ left: xs, top: `${y(0)}cqh` }} />
        <Badge icon="initiative" value={st.speed} label="Speed" colour={STAT_PLATE} side={side} style={{ left: xs, top: `${y(1)}cqh` }} />
        <Badge
          icon="attack_badge"
          value={st.attack.value}
          label="Attack"
          colour={tint(st.attack.affinity)}
          ink={plateInk(st.attack.affinity)}
          affinity={st.attack.affinity}
          side={side}
          style={{ left: xs, top: `${y(2)}cqh` }}
        />
        {st.armor.map((a, k) => (
          <Badge
            key={k}
            icon="armor"
            value={a.value}
            label="Armor"
            colour={tint(a.affinity)}
            ink={plateInk(a.affinity)}
            affinity={a.affinity}
            side={s}
            style={{ left: `calc(2cqw + ${k * s * 0.98}cqh)`, top: `${y(3) + (side - s) / 2}cqh` }}
          />
        ))}
        <Badge icon="xp" value={st.xp} label="XP" colour={BRASS_BRIGHT} ink={ON_BRASS} side={22} style={{ right: "3cqh", bottom: "3cqh" }} />
        {st.trait && st.traitIcon ? <Mark icon={st.traitIcon} name={st.trait} kind="Trait" side={18} style={{ right: "5cqh", top: "5cqh" }} /> : null}
      </ul>
    </Frame>
  );
}

export type JourneyPanelProps = {
  name: string;
  alt: string;
  art: Img;
  stats: { mp: Figure; delay: number; xp: number; obstacle: string | null; obstacleIcon: string | null };
};

/** A road's panel, drawn large: as tall as `className` lets it be. */
export function JourneyPanel({ name, alt, art, stats: st, className = "" }: JourneyPanelProps & { className?: string }) {
  const a = JOURNEY_ASPECT;
  // In cqh: the panel's width is `a` of its height.
  const side = Math.min(25 * 0.88, a * 46);
  const star = Math.min(16, a * 36);
  const disc = Math.min(11, a * 26);
  return (
    <Frame aspect={a} colour={tint(st.mp.affinity)} className={className} style={{ background: `color-mix(in srgb, ${tint(st.mp.affinity)} 18%, transparent)` }}>
      <div className="absolute inset-x-0 top-0 h-1/4" style={{ background: `color-mix(in srgb, ${STAT_PLATE} 92%, transparent)` }} />
      <Image src={art.src} width={art.width} height={art.height} alt={alt} sizes="(min-width: 768px) 260px, 40vw" className="absolute inset-x-0 bottom-0 h-3/4 w-full object-cover" />
      <ul aria-label={`${name}'s stats`}>
        <Badge
          icon="mp"
          value={st.mp.value}
          label="MP"
          colour={STAT_PLATE}
          backing={tint(st.mp.affinity)}
          affinity={st.mp.affinity}
          side={side}
          style={{ left: `calc(25cqw - ${side / 2}cqh)`, top: `${(25 - side) / 2}cqh` }}
        />
        <Badge
          icon="time_badge"
          value={st.delay}
          label="Delay"
          colour={STEEL}
          side={side}
          style={{ left: `calc(75cqw - ${side / 2}cqh)`, top: `${(25 - side) / 2}cqh` }}
        />
        <Badge icon="xp" value={st.xp} label="XP" colour={BRASS_BRIGHT} ink={ON_BRASS} side={star} style={{ left: `calc(50cqw - ${star / 2}cqh)`, bottom: "2cqh" }} />
        {st.obstacle && st.obstacleIcon ? (
          <Mark icon={st.obstacleIcon} name={st.obstacle} kind="Obstacle" side={disc} style={{ right: "4cqw", top: "calc(25cqh + 4cqw)" }} />
        ) : null}
      </ul>
    </Frame>
  );
}
