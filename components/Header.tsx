import Image from "next/image";
import Link from "next/link";
import { site } from "./site";

/** The bar over every page. On the home page it floats over the hero
 * (`overlay`); on the text pages it sits on the page as a solid bar. */
export default function Header({ overlay = false }: { overlay?: boolean }) {
  return (
    <header
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-30"
          : "sticky top-0 z-30 border-b border-line bg-ground/85 backdrop-blur-md"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 font-display text-lg font-semibold text-parchment">
          <Image src="/icon.svg" alt="" width={32} height={32} className="rounded-lg" />
          {site.name}
        </Link>
        <nav aria-label="Site" className="flex gap-5 text-sm sm:gap-7">
          <Link href="/#screenshots" className="link-quiet hidden sm:inline">Screenshots</Link>
          <Link href="/#dragons" className="link-quiet hidden sm:inline">Dragons</Link>
          <Link href="/guide" className="link-quiet">Guide</Link>
          <Link href="/support" className="link-quiet">Support</Link>
          <Link href="/privacy" className="link-quiet">Privacy</Link>
        </nav>
      </div>
    </header>
  );
}
