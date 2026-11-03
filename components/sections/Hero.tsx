import Image from "next/image";
import { cards, scenes } from "../media.generated";
import { site } from "../site";
import StoreButtons from "../StoreButtons";
import HeroHand, { type HandCard } from "./HeroHand";

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
const FAN: HandCard[] = [...ADEPTS, ...REGIONS];

/** The Journey paintings the backdrop is drawn from, as in the game. */
const SCENES = Object.values(scenes).map((s) => s.src);
const DEFAULT_SCENE = scenes.volcano.src;

/** Picks this visit's backdrop before the hero is painted, as the game picks
 * one each time its dragon screen opens. Without scripts, the default shows. */
const PICK_SCENE = `(function(){var s=${JSON.stringify(SCENES)};document.documentElement.style.setProperty("--hero-scene","url("+s[Math.floor(Math.random()*s.length)]+")")})()`;

/**
 * Cindermaw's Dragon Card, the top card of a deck: the game is a deck
 * of cards, and every part of it (the regions, the foes, the dragon, your own
 * powers) is dealt from one. Adept Cards and Region Cards fan out from under
 * the deck. Behind it all is a Journey painting, dimmed and faded into
 * the ground as the game's dragon screen shows one before a dragon is chosen.
 * This is the page's one orchestrated moment (see the motion block in
 * globals.css).
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
                Pointed at, a card (the deck's top card too) lifts and the rest dim. */}
            <HeroHand
              cards={FAN}
              deck={
                <>
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 translate-x-[3%] translate-y-[2.6%] rounded-[8%/5.7%] bg-card-frame shadow-[0_3px_0_0_var(--card-edge-line),0_5px_0_0_var(--card-frame),0_8px_0_0_var(--card-edge-line),0_10px_0_0_var(--card-frame),0_13px_0_0_var(--card-edge-line),0_40px_80px_-20px_var(--well)]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 translate-x-[1.5%] translate-y-[1.3%] rounded-[8%/5.7%] border border-card-edge-line bg-card-frame"
                  />
                  {/* The Dragon Card as the game prints it. */}
                  <Image
                    src={cards.dragon_fire.src}
                    width={cards.dragon_fire.width}
                    height={cards.dragon_fire.height}
                    alt="Cindermaw's Dragon Card, a red dragon with a crest of flame and its stats, on top of a deck between a hand of Adept Cards and the four Region Cards."
                    priority
                    sizes="(min-width: 1024px) 230px, 42vw"
                    className="hero-top relative w-full"
                  />
                </>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
