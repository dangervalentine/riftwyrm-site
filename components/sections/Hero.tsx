import Image from "next/image";
import type { CSSProperties } from "react";
import { cards, hero, scenes } from "../media.generated";
import { site } from "../site";
import StoreButtons from "../StoreButtons";

/**
 * The hand fanned out from under the deck, each card turned about a point well
 * below it so their tops spread apart: four Adept Cards (your powers) to the
 * left, the four Region Cards to the right. On each side the outermost card is
 * drawn first, so a strip of every card shows past the one inside it.
 */
const ADEPTS = [
  { card: cards.shadow_stride, r: -36 },
  { card: cards.lightning_step, r: -27 },
  { card: cards.cold_blaze, r: -18 },
  { card: cards.ember_dash, r: -9 },
];
const REGIONS = [
  { card: cards.region4, r: 36 },
  { card: cards.region3, r: 27 },
  { card: cards.region2, r: 18 },
  { card: cards.region1, r: 9 },
];
const FAN = [...ADEPTS, ...REGIONS];

/**
 * Where the dragon stands on its card, and the cut that keeps it inside the
 * card's picture (under the name band, within the rounded corners) until it
 * breaks out: `--cut` as an inset of the dragon's own box.
 */
const [ax, ay, aw, ah] = hero.place.art;
const pct = (v: number) => `${(v * 100).toFixed(3)}%`;
const DRAGON_STYLE = {
  left: pct(ax),
  top: pct(ay),
  width: pct(aw),
  "--cut": `inset(${pct((hero.place.cutTop - ay) / ah)} ${pct((ax + aw - 1) / aw)} ${pct((ay + ah - 1) / ah)} ${pct(-ax / aw)} round ${pct(hero.place.radius / aw)})`,
} as CSSProperties;

/** The Journey paintings the backdrop is drawn from, as in the game. */
const SCENES = Object.values(scenes).map((s) => s.src);
const DEFAULT_SCENE = scenes.volcano.src;

/** Picks this visit's backdrop before the hero is painted, as the game picks
 * one each time its dragon screen opens. Without scripts, the default shows. */
const PICK_SCENE = `(function(){var s=${JSON.stringify(SCENES)};document.documentElement.style.setProperty("--hero-scene","url("+s[Math.floor(Math.random()*s.length)]+")")})()`;

/**
 * Cindermaw in its burning lair, the top card of a deck: the game is a deck
 * of cards, and every part of it (the regions, the foes, the dragon, your own
 * powers) is dealt from one. Adept Cards and Region Cards fan out from under
 * the deck, then the dragon grows until it breaks out over the top card's
 * edges. Behind it all is a Journey painting, dimmed and faded into the ground
 * as the game's dragon screen shows one before a dragon is chosen. This is the page's one orchestrated moment (see the motion
 * block in globals.css).
 */
export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-ground pt-20 pb-16 sm:pt-28 sm:pb-20 lg:min-h-svh lg:pb-0"
    >
      {/* A Journey painting behind it all, picked at random each visit. */}
      <script dangerouslySetInnerHTML={{ __html: PICK_SCENE }} />
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-[50%_60%]"
          style={{ backgroundImage: `var(--hero-scene, url(${DEFAULT_SCENE}))` }}
        />
        {/* The game's two fades into the ground: across, and up from the bottom. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--ground)_45%,transparent),color-mix(in_srgb,var(--ground)_25%,transparent)_30%,color-mix(in_srgb,var(--ground)_88%,transparent)_58%,var(--ground))] lg:bg-[linear-gradient(to_right,var(--ground),color-mix(in_srgb,var(--ground)_85%,transparent)_34%,color-mix(in_srgb,var(--ground)_20%,transparent)_70%,var(--ground))]" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(to_bottom,transparent_65%,var(--ground))] lg:block" />
      </div>
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-6 min-[360px]:gap-8 sm:gap-14 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-[1.25fr_1fr] lg:gap-10">
        <div className="hero-copy order-2 min-w-0 lg:order-1">
          <h1
            id="hero-title"
            className="title-sheen font-display text-[clamp(2.25rem,12vw,4.5rem)] leading-[0.95] font-bold tracking-[0.06em] uppercase lg:text-[clamp(4rem,6.1vw,5.5rem)]"
          >
            {site.name}
          </h1>
          <p className="mt-3 font-display text-lg text-brass italic sm:mt-4 sm:text-xl">
            A game by{" "}
            <a href={site.developerUrl} className="underline decoration-brass/40 underline-offset-4 transition-colors hover:text-parchment hover:decoration-parchment/60">
              {site.developer}
            </a>
          </p>
          <p className="mt-5 max-w-[34ch] font-display text-[1.375rem] leading-snug text-parchment sm:mt-7 sm:text-[1.7rem]">
            One deck. Four regions. A dragon at the end of the road.
          </p>
          <p className="mt-3 max-w-[52ch] leading-relaxed text-muted sm:mt-4 sm:text-lg">{site.tagline}</p>
          <StoreButtons className="mt-6 sm:mt-10" />
          <p className="mt-4 text-sm text-muted">Coming to iPhone, iPad and Android.</p>
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <div className="relative w-[72vw] pb-[5%] min-[360px]:w-[min(88vw,420px)] sm:w-[min(64vw,460px)] lg:w-full lg:max-w-[480px]">
            {/* Adept Cards and Region Cards fanned out from under the deck.
                Hovered, a card lifts out of the hand and the rest dim. */}
            <div className="hero-hand absolute inset-0">
              {FAN.map(({ card, r }) => (
                <div
                  key={card.src}
                  style={{ "--fan-r": `${r}deg`, "--fan-delay": `${300 + (Math.abs(r) / 9) * 90}ms` } as CSSProperties}
                  className="hero-fan absolute top-[4%] left-[30%] w-[40%] origin-[50%_150%]"
                >
                  <Image
                    src={card.src}
                    width={card.width}
                    height={card.height}
                    alt=""
                    priority
                    sizes="(min-width: 1024px) 230px, 44vw"
                    className="hero-fan-card w-full drop-shadow-[0_12px_18px_var(--well)]"
                  />
                </div>
              ))}
            </div>

            {/* The deck: the Dragon Card on top, with the edges of the cards under it. */}
            <div className="hero-card relative mx-auto w-[44%]">
              <div
                aria-hidden="true"
                className="absolute inset-0 translate-x-[3%] translate-y-[2.6%] rounded-[8%/5.7%] bg-card-frame shadow-[0_3px_0_0_var(--card-edge-line),0_5px_0_0_var(--card-frame),0_8px_0_0_var(--card-edge-line),0_10px_0_0_var(--card-frame),0_13px_0_0_var(--card-edge-line),0_40px_80px_-20px_var(--well)]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 translate-x-[1.5%] translate-y-[1.3%] rounded-[8%/5.7%] border border-card-edge-line bg-card-frame"
              />
              {/* The card as the game prints it, its lair empty... */}
              <Image
                src={hero.card.src}
                width={hero.card.width}
                height={hero.card.height}
                alt=""
                priority
                sizes="(min-width: 1024px) 230px, 42vw"
                className="relative w-full"
              />
              {/* ...the dragon standing where the card stands it, cut to the card's
                  picture at first, then out over its edges... */}
              <Image
                src={hero.dragon.src}
                width={hero.dragon.width}
                height={hero.dragon.height}
                alt="Cindermaw's Dragon Card on top of a deck, the red dragon breaking out over the card's edges, between a hand of Adept Cards and the four Region Cards."
                priority
                sizes="(min-width: 1024px) 310px, 60vw"
                style={DRAGON_STYLE}
                className="hero-dragon pointer-events-none absolute z-[2] max-w-none"
              />
              {/* ...and the card's figures, over the dragon as printed until it
                  grows, then under it. */}
              <Image
                src={hero.figures.src}
                width={hero.figures.width}
                height={hero.figures.height}
                alt=""
                priority
                sizes="(min-width: 1024px) 230px, 42vw"
                className="absolute inset-0 z-[1] w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
