import Link from "next/link";
import { dragonOf, neighbours, slugOf } from "@/components/guide";
import type { DragonId } from "@/components/content";

/** Guide › Thrallis, above a dragon's page. */
export function Breadcrumb({ id }: { id: DragonId }) {
  return (
    <nav aria-label="Breadcrumb" className="guide-col pt-6 text-sm">
      <ol className="flex gap-2 text-muted">
        <li>
          <Link href="/guide" className="link-quiet">Strategy guide</Link>
        </li>
        <li aria-hidden="true" className="text-faint">›</li>
        <li aria-current="page" className="text-parchment">{dragonOf(id).name}</li>
      </ol>
    </nav>
  );
}

/** The way on from a dragon's page: the dragons either side, and back to the guide. */
export default function DragonNav({ id }: { id: DragonId }) {
  const { prev, next } = neighbours(id);
  const p = dragonOf(prev);
  const n = dragonOf(next);
  return (
    <nav aria-label="Dragon guides" className="guide-col mt-16">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <li>
          <Link href={`/guide/${slugOf(prev)}`} className="guide-card-link h-full p-4">
            <span className="block text-xs text-muted">← Previous dragon</span>
            <span className="mt-1 block font-display text-lg font-semibold text-parchment">{p.name}</span>
          </Link>
        </li>
        <li>
          <Link href="/guide" className="guide-card-link h-full p-4 sm:text-center">
            <span className="block text-xs text-muted">Back to</span>
            <span className="mt-1 block font-display text-lg font-semibold text-parchment">All dragons</span>
          </Link>
        </li>
        <li>
          <Link href={`/guide/${slugOf(next)}`} className="guide-card-link h-full p-4 sm:text-right">
            <span className="block text-xs text-muted">Next dragon →</span>
            <span className="mt-1 block font-display text-lg font-semibold text-parchment">{n.name}</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
