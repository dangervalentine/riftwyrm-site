import Image from "next/image";
import { dragons } from "../content";
import { dragons as art } from "../media.generated";

/** Each dragon's Essence: its pigment for the frame and glow, its bright
 * partner for the name. Written out so Tailwind sees every class. */
const ESSENCE = {
  lightning: { frame: "border-lightning/70", glow: "shadow-[0_30px_80px_-30px_var(--lightning)]", ink: "text-lightning-bright" },
  water: { frame: "border-water/80", glow: "shadow-[0_30px_80px_-30px_var(--water)]", ink: "text-water-bright" },
  fire: { frame: "border-fire/80", glow: "shadow-[0_30px_80px_-30px_var(--fire)]", ink: "text-fire-bright" },
  shadow: { frame: "border-shadow/80", glow: "shadow-[0_30px_80px_-30px_var(--shadow)]", ink: "text-shadow-bright" },
} as const;

const NUMERAL = ["I", "II", "III", "IV"];

/**
 * The four dragons in the order they open, each standing in its own lair the
 * way the game sets it for the final fight. The numerals are the unlock
 * order: a real sequence, since each dragon is opened by beating the last.
 */
export default function Dragons() {
  return (
    <section id="dragons" aria-labelledby="dragons-title" className="ground-3 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <h2 id="dragons-title" className="font-display text-4xl font-semibold sm:text-5xl">
          Four dragons. Beat one to wake the next.
        </h2>
        <p className="mt-4 max-w-[60ch] text-lg text-muted">
          Every hunt starts with Thrallis. Win on Normal or harder and the next dragon opens, each one
          harder to bring down than the last.
        </p>
        <ol className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {dragons.map((d) => {
            const e = ESSENCE[d.id];
            const a = art[d.id];
            return (
              <li key={d.id} className="reveal">
                <div className={`relative aspect-[832/1152] rounded-[18px] border bg-stone p-2 ${e.frame} ${e.glow}`}>
                  <div className="relative h-full w-full overflow-hidden rounded-xl">
                    <Image
                      src={a.lair.src}
                      width={a.lair.width}
                      height={a.lair.height}
                      alt=""
                      sizes="(min-width: 1024px) 270px, (min-width: 640px) 45vw, 90vw"
                      className="h-full w-full object-cover"
                    />
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-well/85 via-transparent to-transparent" />
                    <Image
                      src={a.art.src}
                      width={a.art.width}
                      height={a.art.height}
                      alt={d.alt}
                      sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                      className="absolute inset-x-0 bottom-[2%] mx-auto w-[108%] max-w-none -translate-x-[4%]"
                    />
                  </div>
                  <span
                    aria-hidden="true"
                    className={`absolute top-4 left-4 grid h-8 min-w-8 place-items-center rounded-md border px-2 font-display text-base font-semibold ${e.frame} bg-well/85 ${e.ink}`}
                  >
                    {NUMERAL[d.order - 1]}
                  </span>
                </div>
                <h3 className={`mt-6 font-display text-2xl font-semibold ${e.ink}`}>
                  <span className="sr-only">Dragon {d.order}: </span>
                  {d.name}
                </h3>
                <p className="mt-0.5 font-display text-parchment">{d.title}</p>
                <p className="mt-3 font-display leading-relaxed text-muted italic">{d.line}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
