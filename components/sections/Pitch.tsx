import { site } from "../site";

/** What a game is like, said once, before the list of what is in it. */
export default function Pitch() {
  return (
    <div className="max-w-3xl">
      <h2 id="about-title" className="font-display text-4xl leading-tight font-semibold sm:text-5xl">
        A hunt you play in one hand
      </h2>
      <p className="mt-6 text-xl leading-relaxed text-muted">{site.pitch}</p>
    </div>
  );
}
