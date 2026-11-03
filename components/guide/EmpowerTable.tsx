import { Fragment } from "react";
import { cardLabel, empowerNotes, stepOf, type CardId, type Step } from "@/components/guide";
import { guideStats } from "@/components/media.generated";

const ESSENCE_ORDER = ["water", "lightning", "shadow", "fire"] as const;
const key = ([c, s]: Step) => `${c}:${s}`;

function describe(s: Step) {
  const { gain, cost, from, to } = stepOf(s);
  return `${cardLabel(s[0])}, Level ${from} to ${to}: +${gain} strength for ${cost} XP`;
}

/** How much strength each Empowerment buys, card by card, with the best and poorest buys marked. */
export default function EmpowerTable() {
  const best = new Set(empowerNotes.best.map(key));
  const poor = new Set(empowerNotes.poorest.map(key));
  const ids = (Object.keys(guideStats.cards) as CardId[]).sort(
    (a, b) =>
      ESSENCE_ORDER.indexOf(guideStats.cards[a].essence) - ESSENCE_ORDER.indexOf(guideStats.cards[b].essence) ||
      a.localeCompare(b),
  );
  return (
    <section id="empower" aria-labelledby="empower-h">
      <h2 id="empower-h" className="guide-h2">Where your XP goes furthest</h2>
      <p>
        A card&rsquo;s strength is its best Spell figure plus its Boost. The best Empowerment is the one that buys the
        most strength for its XP, and the table shows every card&rsquo;s strength at each Level, with what each step
        adds and costs.
      </p>
      <div className="mt-8">
        <table className="guide-table">
          <caption>Strength at each Level, and what each step adds for its XP</caption>
          <thead>
            <tr>
              <th scope="col">Card</th>
              <th scope="col">Strength, Level 1 to 4</th>
            </tr>
          </thead>
          <tbody>
            {ids.map((id) => {
              const c = guideStats.cards[id];
              return (
                <tr key={id}>
                  <th scope="row" className="font-normal text-parchment">{cardLabel(id)}</th>
                  <td data-label="Strength" className="guide-td-full tabular-nums">
                    <span className="flex flex-wrap items-start gap-x-2 gap-y-1">
                      {c.strength.map((v, i) => (
                        <Fragment key={i}>
                          {i > 0 && (() => {
                            const step = [id, i] as unknown as Step;
                            const { gain, cost } = stepOf(step);
                            const isBest = best.has(key(step));
                            const isPoor = poor.has(key(step));
                            return (
                              <span
                                className={`text-center text-xs leading-tight ${
                                  isBest ? "font-bold text-jade" : isPoor ? "text-faint" : "text-muted"
                                }`}
                              >
                                <span aria-hidden="true">→</span>
                                <span className="block">
                                  +{gain}/{cost} XP
                                </span>
                                {isBest && <span className="sr-only"> (best value)</span>}
                                {isPoor && <span className="sr-only"> (poor value)</span>}
                              </span>
                            );
                          })()}
                          <span className="font-semibold text-parchment">{v}</span>
                        </Fragment>
                      ))}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="guide-h3 text-jade">Best buys</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.9375rem]">
            {empowerNotes.best.map((s) => (
              <li key={key(s)}>{describe(s)}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="guide-h3 text-muted">Poorest buys</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.9375rem]">
            {empowerNotes.poorest.map((s) => (
              <li key={key(s)}>{describe(s)}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="guide-tip mt-6">
        Rule of thumb: an expensive step that buys a big jump beats a cheap one that buys little. Pay 3 to 5 XP for +4
        or +5 rather than 1 XP for +2.
      </p>
    </section>
  );
}
