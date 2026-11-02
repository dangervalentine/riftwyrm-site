import Image from "next/image";
import { dragons as dragonArt } from "../media.generated";
import { site } from "../site";
import StoreButtons from "../StoreButtons";

/**
 * The first dragon, Thrallis, stepping out of its own lair: the storm-lit
 * clearing set in a frame like one of the game's cards, the dragon breaking
 * out over its edge. This is the page's one orchestrated moment (see the
 * motion block in globals.css).
 */
export default function Hero() {
  const art = dragonArt.lightning;
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-ground pt-20 pb-16 sm:pt-28 sm:pb-20 lg:min-h-svh lg:pb-0"
    >
      {/* The storm's colour pooled behind the card. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_60%_at_72%_45%,color-mix(in_srgb,var(--lightning)_22%,transparent),transparent_70%)]"
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
            Hunt dragons with a hand of cards.
          </p>
          <p className="mt-3 max-w-[52ch] leading-relaxed text-muted sm:mt-4 sm:text-lg">{site.tagline}</p>
          <StoreButtons className="mt-6 sm:mt-10" />
          <p className="mt-4 text-sm text-muted">Coming to iPhone, iPad and Android.</p>
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <div className="relative w-[38vw] pt-[6%] min-[360px]:w-[min(48vw,320px)] sm:w-[min(36vw,400px)] lg:w-[420px] lg:pt-[12%]">
            {/* The card. */}
            <div className="hero-card relative aspect-[832/1152] overflow-hidden rounded-[22px] border border-edge/60 bg-stone p-2.5 shadow-[0_40px_90px_-20px_var(--well),0_0_0_1px_var(--well)]">
              <div className="relative h-full w-full overflow-hidden rounded-[14px] border border-line">
                <Image
                  src={art.lair.src}
                  width={art.lair.width}
                  height={art.lair.height}
                  alt=""
                  priority
                  sizes="(min-width: 1024px) 420px, 60vw"
                  className="h-full w-full object-cover"
                />
                <div aria-hidden="true" className="hero-flash absolute inset-0 bg-lightning-bright mix-blend-soft-light" />
                <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-well/80 to-transparent" />
              </div>
            </div>
            {/* The dragon, out over the card's edge. */}
            <Image
              src={art.art.src}
              width={art.art.width}
              height={art.art.height}
              alt="Thrallis, a grey dragon crackling with lightning, stepping out of a storm-lit forest clearing."
              priority
              sizes="(min-width: 1024px) 520px, 72vw"
              className="hero-dragon pointer-events-none absolute -left-[18%] bottom-[-6%] w-[118%] max-w-none drop-shadow-[0_24px_30px_var(--well)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
