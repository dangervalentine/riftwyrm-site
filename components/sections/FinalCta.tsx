import Image from "next/image";
import Link from "next/link";
import { enemies } from "../media.generated";
import StoreButtons from "../StoreButtons";

/**
 * The end of the road: the goblin hexer on the path by its door, set as its
 * Region Card sets it and faded into the ground, and where to get the game.
 */
export default function FinalCta() {
  const { finale } = enemies["goblin-hexer"];
  return (
    <section aria-labelledby="cta-title" className="overflow-hidden bg-ground py-24 sm:py-32">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-6 md:flex-row md:items-center md:justify-center md:gap-0">
        <div className="relative z-10 max-w-xl shrink-0 md:-mr-16">
          <h2 id="cta-title" className="font-display text-4xl leading-tight font-semibold text-shadow-bright [text-shadow:0_0_28px_color-mix(in_oklab,var(--shadow)_80%,transparent),0_0_64px_color-mix(in_oklab,var(--shadow-bright)_35%,transparent)] sm:text-5xl">
            The dragons are waiting.
          </h2>
          <p className="mt-4 text-lg text-muted">Out now on iPhone and iPad. Coming soon to Android.</p>
          <StoreButtons className="mt-8" />
          <p className="mt-6 text-muted">
            Want to play it first?{" "}
            <Link href="/beta" className="text-brass underline underline-offset-4 hover:text-brass-bright">
              Join the beta
            </Link>
            .
          </p>
        </div>
        {/* The hexer keeps the strategy guide: the picture is its only way in, with no
            mark of it until it is pointed at or reached by keyboard. */}
        <Link
          href="/guide"
          aria-label="The hunter's guide: how to beat each dragon"
          className="group relative block w-full max-w-[560px] self-center rounded-full focus-visible:outline-offset-[-12px]"
        >
          <span className="block overflow-hidden [mask-image:radial-gradient(closest-side,black_55%,transparent)]">
            {/* The foe on its scene as one picture (sync-assets.mjs enemyScene). */}
            <Image
              src={finale.src}
              width={finale.width}
              height={finale.height}
              alt=""
              className="h-auto w-full transition-[filter] duration-700 group-hover:brightness-110 group-focus-visible:brightness-110"
            />
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-[3%] text-center font-display text-sm text-faint italic opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            the hunter&rsquo;s guide
          </span>
        </Link>
      </div>
    </section>
  );
}
