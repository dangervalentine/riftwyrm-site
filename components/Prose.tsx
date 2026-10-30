import type { ReactNode } from "react";

/** The column the privacy policy and support page are set in. Styling lives
 * in globals.css (.prose-ink) so the pages stay plain markup. */
export default function Prose({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <article className="prose-ink">{children}</article>
    </main>
  );
}
