import Link from "next/link";
import { cardLabel, dragonGuides, dragonOf, guideDragons, standing } from "@/components/guide";
import { guideStats } from "@/components/media.generated";

/** The four dragons side by side, each row leading to its page. */
export default function AtAGlance() {
  return (
    <div id="at-a-glance">
      <h3 className="guide-h3 mb-3">At a glance</h3>
      <table className="guide-table">
        <caption>Deck is the total Level to bring to the Showdown: for an even chance, and to win four in five</caption>
        <thead>
          <tr>
            <th scope="col">Dragon</th>
            <th scope="col">Dire win</th>
            <th scope="col">Deck</th>
            <th scope="col">Speed</th>
            <th scope="col">Raise first</th>
            <th scope="col">Pass on</th>
          </tr>
        </thead>
        <tbody>
          {guideDragons.map(({ id, slug }) => {
            const g = dragonGuides[id];
            const s = guideStats.dragons[id];
            return (
              <tr key={id}>
                <th scope="row">
                  <Link href={`/guide/${slug}`}>{dragonOf(id).name}</Link>
                </th>
                <td data-label="Dire win" className="tabular-nums">{standing[id].dire}%</td>
                <td data-label="Deck" className="whitespace-nowrap tabular-nums">
                  {s.deckEven} / {s.deckLikely}
                </td>
                <td data-label="Speed" className="tabular-nums">{s.speed}</td>
                <td data-label="Raise first">{g.raise.slice(0, 2).map((p) => cardLabel(p.card)).join(", ")}</td>
                <td data-label="Pass on">{g.pass.slice(0, 2).map((p) => cardLabel(p.card)).join(", ")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
