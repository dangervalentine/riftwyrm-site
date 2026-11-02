import type { CSSProperties } from "react";
import { features } from "../content";

/** What is in the game: a plain list, each item under one of the game's own
 * icons drawn in brass, set off by a hairline rather than boxed. */
export default function Features() {
  return (
    <ul className="mt-16 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}
