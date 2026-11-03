import Image from "next/image";
import type { ReactNode } from "react";
import { edition, editionDate } from "@/components/guide";
import { site } from "@/components/site";

type Art = { lair: { src: string; width: number; height: number }; dragon: { src: string; width: number; height: number }; alt: string };

/**
 * An article's head: kicker, headline, standfirst and byline. On a dragon's
 * page the dragon stands in its lair above it, as the game shows it.
 */
export default function GuideHeader({
  kicker,
  title,
  standfirst,
  art,
  children,
}: {
  kicker: ReactNode;
  title: string;
  standfirst: string;
  art?: Art;
  children?: ReactNode;
}) {
  return (
    <header>
      {art && (
        <div className="relative h-72 overflow-hidden sm:h-96">
          <Image
            src={art.lair.src}
            width={art.lair.width}
            height={art.lair.height}
            alt=""
            priority
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ground/30 via-transparent to-ground" />
          <Image
            src={art.dragon.src}
            width={art.dragon.width}
            height={art.dragon.height}
            alt={art.alt}
            priority
            sizes="(min-width: 640px) 384px, 288px"
            className="absolute bottom-0 left-1/2 h-full w-auto -translate-x-1/2 drop-shadow-[0_18px_28px_var(--well)]"
          />
        </div>
      )}
      <div className={`guide-col ${art ? "pt-6" : "pt-12 sm:pt-16"}`}>
        <p className="guide-kicker">{kicker}</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-parchment sm:text-5xl">{title}</h1>
        <p className="guide-standfirst mt-4">{standfirst}</p>
        <p className="guide-byline mt-5">
          By {site.developer} · Updated <time dateTime={edition.updated}>{editionDate()}</time>
        </p>
        {children}
      </div>
    </header>
  );
}
