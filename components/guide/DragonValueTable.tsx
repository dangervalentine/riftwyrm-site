import type { DragonId } from "@/components/content";
import { dragonGuides, dragonOf, huntValue, type CardId } from "@/components/guide";
import { guideStats } from "@/components/media.generated";
import CardName from "./CardName";
import CardThumb from "./CardThumb";
import SortableTable, { type SortRow } from "./SortableTable";

const PICK = {
  raise: { label: "Raise", className: "text-jade" },
  aside: { label: "Good, not first", className: "text-brass" },
  none: { label: "", className: "" },
  pass: { label: "Pass on", className: "text-danger" },
} as const;

const signed = (v: number) => (v > 0 ? `+${v.toFixed(1)}` : v < 0 ? `−${Math.abs(v).toFixed(1)}` : "0.0");

/**
 * Every card against one dragon, most valuable first, by both measures: what a
 * Level is worth over a whole hunt, and what Levels 1 to 4 add in the Showdown.
 */
export default function DragonValueTable({ id }: { id: DragonId }) {
  const g = dragonGuides[id];
  const pickOf = (c: CardId): keyof typeof PICK =>
    g.raise.some((p) => p.card === c) ? "raise" : g.pass.some((p) => p.card === c) ? "pass" : g.aside?.some((a) => a.card === c) ? "aside" : "none";
  const hunt = huntValue[id];
  const solved = guideStats.showdown[id];
  const ids = (Object.keys(hunt) as CardId[]).sort((a, b) => hunt[b] - hunt[a]);

  const rows: SortRow[] = ids.map((c) => {
    const p = PICK[pickOf(c)];
    return {
      key: c,
      sort: [guideStats.cards[c].name, hunt[c], solved[c]],
      cells: [
        <span key="n" className="flex items-center gap-2.5">
          <CardThumb card={c} />
          <span>
            <CardName card={c} />
            {p.label && <span className={`mt-0.5 block pl-5 text-xs font-semibold ${p.className}`}>{p.label}</span>}
          </span>
        </span>,
        <span key="h" className={hunt[c] < 0 ? "text-danger" : "text-parchment"}>{signed(hunt[c])}</span>,
        <span key="s" className="text-parchment">{solved[c].toFixed(1)}</span>,
      ],
    };
  });

  return (
    <section id="values" aria-labelledby="values-h">
      <h2 id="values-h" className="guide-h2">Every card against {dragonOf(id).name}</h2>
      <p>
        Two ways of judging a card, most valuable first. <strong className="text-parchment">Over a hunt</strong> is how
        much one more Level on the card changes your chance of winning, in points, against a Level on an average card:
        below zero, worth less than average. <strong className="text-parchment">Showdown</strong> is how much
        raising it from Level 1 to 4 adds to your chance of winning the fight itself. The first is the better guide,
        since it counts everything a card does on the road as well; where they disagree sharply about a card, it is
        marked good, not first.
      </p>
      <div className="mt-6">
        <SortableTable
          caption={`All sixteen cards against ${dragonOf(id).name}.`}
          columns={[
            { label: "Card" },
            { label: "Over a hunt", sub: "per Level", numeric: true },
            { label: "Showdown", sub: "Lv 1 to 4", numeric: true },
          ]}
          rows={rows}
          initial={{ col: 1, dir: "desc" }}
        />
      </div>
    </section>
  );
}
