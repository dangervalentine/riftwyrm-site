import Image from "next/image";
import type { CSSProperties } from "react";
import { cards, dragons as dragonArt } from "../media.generated";
import { site } from "../site";
import StoreButtons from "../StoreButtons";

/**
 * The two cards spread out from under the deck: an Adept Card (one of your
 * powers) to the left, the fire's Region Card to the right. Each starts
 * tucked under the deck (`--fan-from`) and ends turned out (`--fan-r`).
 */
const SPREAD = [
  {
    card: cards.ember_dash,
    alt: "",
    side: "left-0",
    from: "62%",
    r: "-9deg",
  },
  {
    card: cards.region3,
    alt: "",
    side: "right-0",
    from: "-62%",
    r: "8deg",
  },
] as const;

/**
 * Cindermaw in its burning lair, the top card of a deck: the game is a deck
 * of cards, and every part of it (the regions, the foes, the dragon, your own
 * powers) is dealt from one. An Adept Card and a Region Card spread out from
 * under the deck, then the dragon grows until it breaks out over the top
 * card's edges. This is the page's one orchestrated moment (see the motion
 * block in globals.css).
 */
export default function Hero() {
  const art = dragonArt.fire;
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-ground pt-20 pb-16 sm:pt-28 sm:pb-20 lg:min-h-svh lg:pb-0"
    >
      {/* The fire's light pooled behind the deck. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_60%_at_72%_50%,color-mix(in_srgb,var(--fire)_30%,transparent),transparent_70%)]"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-6 min-[360px]:gap-8 sm:gap-14 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-[1.25fr_1fr] lg:gap-10">
        <div className="hero-copy order-2 min-w-0 lg:order-1">
          <h1
            id="hero-title"
            className="title-sheen font-display text-[clamp(2.25rem,12vw,4.5rem)] leading-[0.95] font-bold tracking-[0.06em] uppercase lg:text-[clamp(4rem,6.1vw,5.5rem)]"
          >
            {site.name}
          </h1>
          <p className="mt-3 font-display text-lg text-brass italic sm:mt-4 sm:text-xl">
            A game by {site.developer}
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
            {/* An Adept Card and a Region Card spread out from under the deck. */}
            {SPREAD.map(({ card, alt, side, from, r }) => (
              <Image
                key={card.src}
                src={card.src}
                width={card.width}
                height={card.height}
                alt={alt}
                priority
                sizes="(min-width: 1024px) 190px, 36vw"
                style={{ "--fan-from": from, "--fan-r": r } as CSSProperties}
                className={`hero-fan absolute top-[13%] ${side} w-[39%] drop-shadow-[0_18px_24px_var(--well)]`}
              />
            ))}

            {/* The deck: the top card, with the edges of the cards under it. */}
            <div className="hero-card relative mx-auto w-[46%]">
              <div
                aria-hidden="true"
                className="absolute inset-0 translate-x-[3%] translate-y-[2.6%] rounded-[16px] bg-card-frame shadow-[0_3px_0_0_var(--card-edge-line),0_5px_0_0_var(--card-frame),0_8px_0_0_var(--card-edge-line),0_10px_0_0_var(--card-frame),0_13px_0_0_var(--card-edge-line),0_40px_80px_-20px_var(--well)]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 translate-x-[1.5%] translate-y-[1.3%] rounded-[16px] border border-card-edge-line bg-card-frame"
              />
              <div className="relative aspect-[832/1152] overflow-hidden rounded-[16px] border border-card-edge/50 bg-card-frame p-2">
                <div className="relative h-full w-full overflow-hidden rounded-[10px] border border-line">
                  <Image
                    src={art.lair.src}
                    width={art.lair.width}
                    height={art.lair.height}
                    alt=""
                    priority
                    sizes="(min-width: 1024px) 230px, 42vw"
                    className="h-full w-full object-cover"
                  />
                  <div aria-hidden="true" className="hero-flash absolute inset-0 bg-fire-bright mix-blend-soft-light" />
                  <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-well/80 to-transparent" />
                </div>
              </div>

              {/* The dragon: inside the card at first, then out over its edges. */}
              <Image
                src={art.art.src}
                width={art.art.width}
                height={art.art.height}
                alt="Cindermaw, a red winged dragon with a crest of flame, breaking out of its burning lair on top of a deck of cards, between an Adept Card and the Steam Flats Region Card."
                priority
                sizes="(min-width: 1024px) 300px, 56vw"
                className="hero-dragon pointer-events-none absolute -left-[14%] bottom-[4%] w-[128%] max-w-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
