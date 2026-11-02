import type { CSSProperties } from "react";
import { features } from "../content";

/** Everything around the hunt: the dragons to unlock, the difficulties, the
 * lessons, the leaderboards, the achievements and the sync. A plain list,
 * each item under one of the game's own icons in brass, set off by a hairline
 * rather than boxed. */
export default function Features() {
  return (
    <section aria-labelledby="features-title" className="bg-ground py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <h2 id="features-title" className="font-display text-4xl font-semibold sm:text-5xl">
          Made to come back to
        </h2>
        <p className="mt-4 max-w-[60ch] text-lg text-muted">
          Every hunt is a new story, and every one counts toward the next. No ads, no tracking, and no
          account to make.
        </p>
        <ul className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <li key={f.title} className="border-t border-line pt-6">
              <span
                aria-hidden="true"
                className="glyph size-8 text-brass"
                style={{ "--glyph": `url(${f.icon})` } as CSSProperties}
              />
              <h3 className="mt-4 font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
