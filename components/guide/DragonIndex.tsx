import Image from "next/image";
import Link from "next/link";
import { dragonGuides, dragonOf, essenceLabel, guideDragons } from "@/components/guide";
import { dragons as dragonArt, guideStats } from "@/components/media.generated";
import { INK } from "./DragonArticle";

/** The four dragons in the order they wake, each leading to its own page. */
export default function DragonIndex() {
  return (
    <section id="dragons" aria-labelledby="dragons-h" className="mx-auto mt-4 w-full max-w-6xl px-6">
      <h2 id="dragons-h" className="guide-h2 text-center">Choose your dragon</h2>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {guideDragons.map(({ id, slug }) => {
          const d = dragonOf(id);
          const s = guideStats.dragons[id];
          const head = dragonArt[id].head;
          return (
            <li key={id}>
              <Link href={`/guide/${slug}`} className="guide-card-link h-full p-5">
                <Image
                  src={head.src}
                  width={head.width}
                  height={head.height}
                  alt={d.alt}
                  sizes="(min-width: 1024px) 160px, 128px"
                  className="mx-auto h-32 w-auto lg:h-40"
                />
                <p className="mt-4 text-xs text-muted">
                  Dragon {d.order} · <span className={INK[id]}>{essenceLabel(id)}</span>
                </p>
                <h3 className={`mt-1 font-display text-2xl font-semibold ${INK[id]}`}>{d.name}</h3>
                <p className="font-display text-parchment">{d.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{dragonGuides[id].verdict}</p>
                <p className="mt-3 text-sm tabular-nums text-parchment">
                  Deck {s.deckEven} · Speed {s.speed}
                </p>
                <p className="mt-4 text-sm font-semibold text-brass">How to beat {d.name} →</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
