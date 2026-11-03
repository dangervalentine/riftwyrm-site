import Image from "next/image";
import { enemies } from "../media.generated";
import StoreButtons from "../StoreButtons";
import { ENEMY_ASPECT, enemySquare } from "./TrialPanel";

/**
 * The end of the road: the goblin hexer on the path by its door, set as its
 * Region Card sets it and faded into the ground, and where to get the game.
 */
export default function FinalCta() {
  const { art, backdrop, place } = enemies["goblin-hexer"];
  const sq = enemySquare(place, ENEMY_ASPECT);
  return (
    <section aria-labelledby="cta-title" className="overflow-hidden bg-ground py-24 sm:py-32">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-6 md:flex-row md:items-center md:justify-center md:gap-0">
        <div className="relative z-10 max-w-xl shrink-0 md:-mr-16">
          <h2 id="cta-title" className="font-display text-4xl leading-tight font-semibold text-shadow-bright [text-shadow:0_0_28px_color-mix(in_oklab,var(--shadow)_80%,transparent),0_0_64px_color-mix(in_oklab,var(--shadow-bright)_35%,transparent)] sm:text-5xl">
            The dragons are waiting.
          </h2>
          <p className="mt-4 text-lg text-muted">Coming to iPhone, iPad and Android.</p>
          <StoreButtons className="mt-8" />
        </div>
        <div
          aria-hidden="true"
          className="relative w-full max-w-[560px] self-center overflow-hidden [mask-image:radial-gradient(closest-side,black_55%,transparent)]"
          style={{ aspectRatio: ENEMY_ASPECT }}
        >
          <Image src={backdrop.src} width={backdrop.width} height={backdrop.height} alt="" sizes="(min-width: 768px) 560px, 92vw" className="absolute inset-0 h-full w-full object-cover" />
          <Image
            src={art.src}
            width={art.width}
            height={art.height}
            alt=""
            sizes="(min-width: 768px) 560px, 92vw"
            className="absolute max-w-none"
            style={{ left: `${sq.left}%`, top: `${sq.top}%`, width: `${sq.width}%`, height: `${sq.height}%` }}
          />
        </div>
      </div>
    </section>
  );
}
