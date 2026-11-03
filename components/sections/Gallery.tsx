import { screenshots as shots } from "../content";
import { screenshots as media } from "../media.generated";
import Lightbox from "./Lightbox";
import Screenshots from "./Screenshots";

/**
 * Real screenshots of a real, seeded game, made by the game's own store
 * screenshot tool, in a carousel (Screenshots.tsx); each shot is a link to the
 * full image, which the viewer takes over when scripts run.
 */
export default function Gallery() {
  const items = shots.map((s) => ({ ...s, ...media[s.id] }));
  return (
    <section id="screenshots" aria-labelledby="screenshots-title" className="bg-ground py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <h2 id="screenshots-title" className="font-display text-4xl font-semibold sm:text-5xl">
          See it in play
        </h2>
        <p className="mt-4 max-w-[60ch] text-lg text-muted">
          Played sideways on a phone or tablet. Swipe through, and select a screenshot to see it full size.
        </p>
      </div>
      <Lightbox items={items}>
        <Screenshots items={items} />
      </Lightbox>
    </section>
  );
}
