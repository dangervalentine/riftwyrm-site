import Image from "next/image";
import Link from "next/link";
import { site } from "./site";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-well">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Image src="/icon.svg" alt="" width={28} height={28} className="rounded-md" />
          <p>
            © {new Date().getFullYear()} {site.developer}
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/support" className="link-quiet">Support</Link>
          <Link href="/privacy" className="link-quiet">Privacy Policy</Link>
          <a href={`mailto:${site.email}`} className="link-quiet">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
