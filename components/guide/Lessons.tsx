import { lessons, type Evidence } from "@/components/guide";

const TAG: Record<Evidence, { label: string; className: string }> = {
  tested: { label: "Tested", className: "text-jade" },
  observed: { label: "Observed", className: "text-brass" },
  "tested-dont": { label: "Tested: don’t", className: "text-danger" },
};

/** What wins hunts against every dragon, each lesson marked by how it is known. */
export default function Lessons() {
  return (
    <section id="lessons" aria-labelledby="lessons-h">
      <h2 id="lessons-h" className="guide-h2">Lessons for every dragon</h2>
      <p>
        <span className="font-semibold text-jade">Tested</span> lessons were played head to head on the same deals,
        with and without the habit, so the difference is the habit&rsquo;s own.{" "}
        <span className="font-semibold text-brass">Observed</span> lessons come from watching how strong players play:
        strong hints, not proof.
      </p>
      <ol className="mt-8 space-y-10">
        {lessons.map((l, i) => (
          <li key={l.id} id={`lesson-${l.id}`} className="scroll-mt-24">
            <p className={`guide-tag ${TAG[l.evidence].className}`}>{TAG[l.evidence].label}</p>
            <h3 className="guide-h3 mt-2">
              <span className="text-faint">{i + 1}. </span>
              {l.title}
            </h3>
            <p className="mt-2">{l.body}</p>
            {l.effect && <p className="guide-tip mt-3 text-[0.9375rem]">{l.effect}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}
