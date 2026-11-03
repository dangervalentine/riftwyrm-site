import { empowerNotes, stepOf, type CardId, type Step } from "@/components/guide";
import { guideStats } from "@/components/media.generated";
import CardName from "./CardName";
import CardThumb from "./CardThumb";
import SortableTable, { type SortRow } from "./SortableTable";

const ESSENCE_ORDER = ["water", "lightning", "shadow", "fire"] as const;
const LEVELS = [1, 2, 3, 4] as const;


/** One Empowerment shown on the printed card: the card before, the card after, and what it bought. */
function Buy({ step, tone }: { step: Step; tone: "best" | "poor" }) {
  const [card] = step;
  const { gain, cost, from, to } = stepOf(step);
  return (
    <li className={`flex items-center gap-3 rounded-lg border p-3 ${tone === "best" ? "border-jade/40" : "border-line"} bg-stone`}>
      <div className="flex flex-none items-center gap-1">
        <CardThumb card={card} level={from} className="w-[4.5rem] sm:w-[5.5rem]" />
        <span aria-hidden="true" className="text-faint">→</span>
        <CardThumb card={card} level={to} className="w-[4.5rem] sm:w-[5.5rem]" />
      </div>
      <div className="min-w-0 text-sm leading-snug">
        <p className="font-semibold text-parchment">
          <CardName card={card} />
        </p>
        <p className="mt-1 text-muted">
          Level {from} → {to}
        </p>
        <p className={`mt-1 font-display text-lg font-bold ${tone === "best" ? "text-jade" : "text-muted"}`}>
          +{gain} for {cost} XP
        </p>
      </div>
    </li>
  );
}

/** How much strength each Empowerment buys: every card by Level, sortable, then the best and poorest buys on the cards themselves. */
export default function EmpowerTable() {
  const ids = (Object.keys(guideStats.cards) as CardId[]).sort(
    (a, b) =>
      ESSENCE_ORDER.indexOf(guideStats.cards[a].essence) - ESSENCE_ORDER.indexOf(guideStats.cards[b].essence) ||
      a.localeCompare(b),
  );
  const best = new Set(empowerNotes.best.map(([c, s]) => `${c}:${s}`));
  const poor = new Set(empowerNotes.poorest.map(([c, s]) => `${c}:${s}`));

  const rows: SortRow[] = ids.map((id) => {
    const c = guideStats.cards[id];
    return {
      key: id,
      sort: [`${ESSENCE_ORDER.indexOf(c.essence)} ${c.name}`, ...c.strength],
      cells: [
        <span key="n" className="flex items-center gap-2.5">
          <CardThumb card={id} />
          <CardName card={id} />
        </span>,
        ...LEVELS.map((level) => {
          const v = c.strength[level - 1];
          if (level === 1) return <span key={level} className="font-semibold text-parchment">{v}</span>;
          const k = `${id}:${level - 1}`;
          const { gain, cost } = stepOf([id, (level - 1) as 1 | 2 | 3]);
          const tone = best.has(k) ? "font-bold text-jade" : poor.has(k) ? "text-faint" : "text-muted";
          return (
            <span key={level} className="block">
              <span className="font-semibold text-parchment">{v}</span>
              <span className={`block whitespace-nowrap text-[0.6875rem] leading-tight sm:text-xs ${tone}`}>
                +{gain}/{cost} XP
                {best.has(k) && <span className="sr-only"> (best value)</span>}
                {poor.has(k) && <span className="sr-only"> (poor value)</span>}
              </span>
            </span>
          );
        }),
      ],
    };
  });

  return (
    <section id="empower" aria-labelledby="empower-h">
      <h2 id="empower-h" className="guide-h2">Where your XP goes furthest</h2>
      <p>
        A card&rsquo;s strength is its best Spell figure plus its Boost. The best Empowerment is the one that buys the
        most strength for its XP. Under each Level is what the step to it adds, and its cost. Press a card to see it at
        every Level.
      </p>
      <div className="mt-8">
        <SortableTable
          caption="Every card's strength at each Level."
          columns={[
            { label: "Card" },
            { label: "Lv 1", numeric: true },
            { label: "Lv 2", numeric: true },
            { label: "Lv 3", numeric: true },
            { label: "Lv 4", numeric: true },
          ]}
          rows={rows}
        />
      </div>

      <h3 className="guide-h3 mt-12 text-jade">Best buys</h3>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {empowerNotes.best.map((s) => (
          <Buy key={`${s[0]}:${s[1]}`} step={s} tone="best" />
        ))}
      </ul>
      <h3 className="guide-h3 mt-10 text-muted">Poorest buys</h3>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {empowerNotes.poorest.map((s) => (
          <Buy key={`${s[0]}:${s[1]}`} step={s} tone="poor" />
        ))}
      </ul>
      <p className="guide-tip mt-8">
        Rule of thumb: an expensive step that buys a big jump beats a cheap one that buys little. Pay 3 to 5 XP for +4
        or +5 rather than 1 XP for +2.
      </p>
    </section>
  );
}
