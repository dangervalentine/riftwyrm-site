import Image from "next/image";
import type { CSSProperties } from "react";
import { cards, dragons as dragonArt } from "../media.generated";
import { site } from "../site";
import StoreButtons from "../StoreButtons";

/** The two Adept Cards fanned out from under the deck: where each ends up. */
const FAN = [
  { card: cards.cold_blaze, x: "-36%", y: "9%", r: "-15deg" },
  { card: cards.static_rush, x: "32%", y: "13%", r: "11deg" },
] as const;

/**
 * Cindermaw stepping out of its burning lair, the top card of a deck: the
 * game is a deck of cards, and every part of it (the regions, the foes, the
 * dragon, your own powers) is dealt from one. Two Adept Cards fan out from
 * under the stack, and the dragon breaks out over the top card's edge. This is
 * the page's one orchestrated moment (see the motion block in globals.css).
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
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 sm:gap-14 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-[1.25fr_1fr] lg:gap-10">
        <div className="hero-copy order-2 min-w-0 lg:order-1">
          <h1
            id="hero-title"
            className="title-sheen font-display text-[clamp(2.25rem,12vw,4.5rem)] leading-[0.95] font-bold tracking-[0.06em] uppercase lg:text-[clamp(4rem,6.1vw,5.5rem)]"
          >
            {site.name}
          </h1>
          <div aria-hidden="true" className="mt-5 flex max-w-sm items-center gap-3 text-brass/70 sm:mt-7">
            <span className="h-px flex-1 bg-current" />
            <span className="size-1.5 rotate-45 bg-current" />
            <span className="h-px flex-1 bg-current" />
          </div>
          <p className="mt-5 max-w-[34ch] font-display text-[1.375rem] leading-snug text-parchment sm:mt-7 sm:text-[1.7rem]">
            One deck. Four regions. A dragon at the end of the road.
          </p>
          <p className="mt-3 max-w-[52ch] leading-relaxed text-muted sm:mt-4 sm:text-lg">{site.tagline}</p>
          <StoreButtons className="mt-6 sm:mt-10" />
          <p className="mt-4 text-sm text-muted">Coming to iPhone, iPad and Android.</p>
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <div className="relative w-[34vw] pt-[3%] pb-[3%] min-[360px]:w-[min(42vw,300px)] min-[360px]:pt-[6%] min-[360px]:pb-[8%] sm:w-[min(32vw,380px)] lg:w-[400px] lg:pt-[12%]">
            {/* Two Adept Cards fanned out from under the deck. */}
            {FAN.map(({ card, x, y, r }) => (
              <Image
                key={card.src}
                src={card.src}
                width={card.width}
                height={card.height}
                alt=""
                priority
                sizes="(min-width: 1024px) 300px, 30vw"
                style={{ "--fan-x": x, "--fan-y": y, "--fan-r": r } as CSSProperties}
                className="hero-fan absolute top-[16%] left-[12%] w-[76%] drop-shadow-[0_18px_24px_var(--well)]"
              />
            ))}

            {/* The deck: the top card, with the edges of the cards under it. */}
            <div className="hero-card relative">
              <div
                aria-hidden="true"
                className="absolute inset-0 translate-x-[3%] translate-y-[2.6%] rounded-[22px] bg-card-frame shadow-[0_3px_0_0_var(--card-edge-line),0_5px_0_0_var(--card-frame),0_8px_0_0_var(--card-edge-line),0_10px_0_0_var(--card-frame),0_13px_0_0_var(--card-edge-line),0_40px_80px_-20px_var(--well)]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 translate-x-[1.5%] translate-y-[1.3%] rounded-[22px] border border-card-edge-line bg-card-frame"
              />
              <div className="relative aspect-[832/1152] overflow-hidden rounded-[22px] border border-card-edge/50 bg-card-frame p-2.5">
                <div className="relative h-full w-full overflow-hidden rounded-[14px] border border-line">
                  <Image
                    src={art.lair.src}
                    width={art.lair.width}
                    height={art.lair.height}
                    alt=""
                    priority
                    sizes="(min-width: 1024px) 400px, 42vw"
                    className="h-full w-full object-cover"
                  />
                  <div aria-hidden="true" className="hero-flash absolute inset-0 bg-fire-bright mix-blend-soft-light" />
                  <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-well/80 to-transparent" />
                </div>
              </div>
            </div>

            {/* The dragon, out over the top card's edge. */}
            <Image
              src={art.art.src}
              width={art.art.width}
              height={art.art.height}
              alt="Cindermaw, a red winged dragon with a crest of flame, stepping out of its burning lair on top of a deck of cards."
              priority
              sizes="(min-width: 1024px) 520px, 60vw"
              className="hero-dragon pointer-events-none absolute -left-[16%] bottom-[2%] w-[124%] max-w-none drop-shadow-[0_24px_30px_var(--well)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
