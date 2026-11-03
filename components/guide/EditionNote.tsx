import { edition, editionDate } from "@/components/guide";

/** Where the guide's numbers come from, and that they will change. */
export default function EditionNote() {
  return (
    <aside className="guide-col mt-16 mb-16">
      <p className="border-t border-line pt-5 text-sm leading-relaxed text-faint">
        Numbers from {edition.round} on the {edition.cardSet} cards, updated {editionDate()}: long play of every
        dragon at every difficulty. They will change as new cards arrive.
      </p>
    </aside>
  );
}
