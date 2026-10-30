import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { site } from "@/components/site";

export default function Home() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <Image
          src="/icon.svg"
          alt={`${site.name} app icon`}
          width={160}
          height={160}
          priority
          className="rounded-[2rem] shadow-[0_20px_60px_rgb(0_0_0/0.6)] ring-1 ring-line"
        />
        <h1 className="mt-10 font-display text-5xl font-bold tracking-tight sm:text-6xl">
          {site.name}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          {site.tagline}
        </p>
        <p className="mt-10 rounded-md border border-brass/60 bg-stone px-5 py-3 font-display text-lg text-brass-bright">
          Coming soon to Google Play and the App Store
        </p>
        <nav className="mt-10 flex gap-8 text-base">
          <Link href="/privacy" className="link-quiet">Privacy Policy</Link>
          <Link href="/support" className="link-quiet">Support</Link>
        </nav>
      </main>
      <Footer />
    </>
  );
}
