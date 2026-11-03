import Link from "next/link";
import { ceilingNote, difficulties, dragonOf, guideDragons, standing } from "@/components/guide";

/**
 * Where the game stands: how often a strong player wins each dragon at each
 * difficulty. Every cell prints its number; the thin bar under it is the same
 * number drawn, in one hue, so it reads as size and never as a dragon's colour.
 */
export default function StandingTable() {
  return (
    <section id="standing" aria-labelledby="standing-h">
      <h2 id="standing-h" className="guide-h2">Where the game stands</h2>
      <p className="guide-dropcap">
        Every difficulty can be won. Played well, even Dire falls more often than not to three of the four dragons.
        The fourth is Cindermaw, by far the hardest hunt, with Vesperath next; Thrallis and Glaciarch sit close
        together, and Glaciarch is the gentler of the two at the top difficulties.
      </p>
      <p>
        The numbers below come from long play by a strong player, one who sees only what you see at the table: no
        peeking at the deck. What decides a hunt is the deck you bring to the Showdown. As a rough target, aim for
        every card at Level 3.
      </p>
      <div className="mt-8">
        <table className="guide-table">
          <caption>How often a strong player wins, by difficulty (per cent)</caption>
          <thead>
            <tr>
              <th scope="col">Dragon</th>
              {difficulties.map((d) => (
                <th key={d.id} scope="col">{d.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guideDragons.map(({ id, slug }) => (
              <tr key={id}>
                <th scope="row">
                  <Link href={`/guide/${slug}`}>{dragonOf(id).name}</Link>
                </th>
                {difficulties.map((d) => {
                  const v = standing[id][d.id];
                  return (
                    <td key={d.id} data-label={d.label} className="tabular-nums">
                      <span>
                        {v}%
                        <span className="guide-bar-track" aria-hidden="true">
                          <span className="bg-brass" style={{ width: `${v}%` }} />
                        </span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-muted">
        Single cells can move by a few points from one long run to the next, which is why Thrallis reads a little
        higher on Hard than on Normal. {ceilingNote}
      </p>
    </section>
  );
}
