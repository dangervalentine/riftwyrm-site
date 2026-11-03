import Link from "next/link";
import type { DragonId } from "@/components/content";
import { dragonGuides, dragonOf, essenceLabel, lessons, standing } from "@/components/guide";
import { dragons as dragonArt, guideStats } from "@/components/media.generated";
import CardChip from "./CardChip";
import DragonValueTable from "./DragonValueTable";
import GuideHeader from "./GuideHeader";

/** Each Essence's bright shade, written out so Tailwind sees every class. */
export const INK = {
  lightning: "text-lightning-bright",
  water: "text-water-bright",
  fire: "text-fire-bright",
  shadow: "text-shadow-bright",
} as const;

/**
 * One dragon's page: the dragon in its lair, the deck to bring and the Speed
 * to beat, the cards to raise and to pass on, and its tips. Every dragon's page
 * has the same parts in the same order.
 */
export default function DragonArticle({ id }: { id: DragonId }) {
  const dragon = dragonOf(id);
  const g = dragonGuides[id];
  const s = guideStats.dragons[id];
  const art = dragonArt[id];
  const linked = (g.lessonLinks ?? []).map((l) => lessons.find((x) => x.id === l)!);

  return (
    <article>
      <GuideHeader
        kicker={
          <>
            Strategy guide · Dragon {dragon.order} of 4 ·{" "}
            <span className={INK[id]}>{essenceLabel(id)}</span>
          </>
        }
        title={`How to beat ${dragon.name}`}
        standfirst={`${dragon.title}. ${g.verdict}`}
        art={{ lair: art.lair, dragon: art.art, alt: dragon.alt }}
      />

      <div className="guide-col guide-body">
        <section id="deck" aria-labelledby="deck-h" className="mt-10">
          <h2 id="deck-h" className="sr-only">The deck to bring</h2>
          <dl className="guide-stats">
            <div>
              <dt>Deck to bring</dt>
              <dd>
                <span className="whitespace-nowrap">
                  {s.deckEven} <span className="text-faint">/</span> {s.deckLikely}
                </span>
                <span className="mt-0.5 block font-sans text-xs font-normal text-muted">even chance / four in five</span>
              </dd>
            </div>
            <div>
              <dt>Speed to beat</dt>
              <dd>{s.speed}</dd>
            </div>
            <div>
              <dt>First Strike</dt>
              <dd>{s.firstStrike}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-muted">
            Deck is the total of your cards&rsquo; Levels when the Showdown begins. A strong player wins{" "}
            {standing[id].normal}% of hunts on Normal and {standing[id].dire}% on Dire;{" "}
            <Link href="/guide#standing">see every difficulty</Link>.
          </p>
        </section>

        <div className="mt-10">
          {g.intro.map((p, i) => (
            <p key={i} className={i === 0 ? "guide-dropcap" : undefined}>
              {p}
            </p>
          ))}
        </div>

        <section id="raise" aria-labelledby="raise-h">
          <h2 id="raise-h" className="guide-h2">Cards to raise</h2>
          <p className="text-muted">Put your XP here first. The first card is the one to lead with. Press a card to see it at every Level.</p>
          <ul className="mt-4 space-y-1">
            {g.raise.map((p) => (
              <CardChip key={p.card} card={p.card} reason={p.why} tone="raise" />
            ))}
          </ul>
        </section>

        <section id="pass" aria-labelledby="pass-h">
          <h2 id="pass-h" className="guide-h2">Cards to pass on</h2>
          <p className="text-muted">Skip these when you Empower; give their Levels up first when you Brace.</p>
          <ul className="mt-4 space-y-1">
            {g.pass.map((p) => (
              <CardChip key={p.card} card={p.card} reason={p.why} tone="pass" />
            ))}
          </ul>
          {g.aside && g.aside.length > 0 && (
            <>
              <h3 className="guide-h3 mt-8">Good, not first</h3>
              <p className="mt-1 text-muted">Cards that help in one part of the hunt and not the other.</p>
              <ul className="mt-4 space-y-1">
                {g.aside.map((a) => (
                  <CardChip key={a.card} card={a.card} reason={a.note} tone="aside" />
                ))}
              </ul>
            </>
          )}
        </section>

        <DragonValueTable id={id} />

        <section id="tips" aria-labelledby="tips-h">
          <h2 id="tips-h" className="guide-h2">Tips for {dragon.name}</h2>
          <ul className="space-y-3">
            {g.tips.map((t, i) => (
              <li key={i} className="guide-tip">{t}</li>
            ))}
          </ul>
          {linked.length > 0 && (
            <>
              <h3 className="guide-h3 mt-10">Lessons for every dragon</h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                {linked.map((l) => (
                  <li key={l.id}>
                    <Link href={`/guide#lesson-${l.id}`}>{l.title}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </article>
  );
}
