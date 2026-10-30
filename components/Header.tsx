import Image from "next/image";
import Link from "next/link";
import { site } from "./site";

/** The bar over the two text pages. The landing page has its own large hero
 * and does not use it. */
export default function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 font-display text-lg text-parchment">
          <Image src="/icon.svg" alt="" width={32} height={32} className="rounded-lg" />
          {site.name}
        </Link>
        <nav className="flex gap-6 text-sm">
          <Link href="/privacy" className="link-quiet">Privacy</Link>
          <Link href="/support" className="link-quiet">Support</Link>
        </nav>
      </div>
    </header>
  );
}
