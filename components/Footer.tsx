import Link from "next/link";
import { site } from "./site";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-muted">
        <p>
          © {new Date().getFullYear()} {site.developer}
        </p>
        <nav className="flex gap-6">
          <Link href="/privacy" className="link-quiet">Privacy</Link>
          <Link href="/support" className="link-quiet">Support</Link>
          <a href={`mailto:${site.email}`} className="link-quiet">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
