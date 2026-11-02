import Image from "next/image";
import Link from "next/link";
import { site } from "./site";

/** GitHub's mark (Simple Icons), drawn in the link's colour. */
const GITHUB_MARK =
  "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12";

/**
 * The site footer: one compact row under every page, the same footer as the
 * developer's NextQuest site. The brand and year, then Support, Privacy,
 * Contact and the maker's GitHub, divided by hairlines. On a phone the
 * game's icon stands for its name and the GitHub mark for the handle.
 */
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer-bar mt-auto">
      <Link href="/" className="footer-brand" aria-label={`${site.name} home`}>
        <Image src="/icon.svg" alt="" width={16} height={16} className="rounded-[4px]" />
        <span className="footer-name">{site.name}</span>
        <span className="footer-year">&copy; {year}</span>
      </Link>
      <span className="footer-sep" aria-hidden="true" />
      <Link href="/support" className="footer-link">Support</Link>
      <span className="footer-sep" aria-hidden="true" />
      <Link href="/privacy" className="footer-link">Privacy</Link>
      <span className="footer-sep" aria-hidden="true" />
      <a href={`mailto:${site.email}`} className="footer-link">Contact</a>
      <span className="footer-sep" aria-hidden="true" />
      <a
        href={site.github}
        className="footer-link"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Made by ${site.developer}: view profile on GitHub (opens in a new tab)`}
      >
        <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden="true" focusable="false">
          <path d={GITHUB_MARK} />
        </svg>
        <span className="footer-handle">dangervalentine</span>
      </a>
    </footer>
  );
}
