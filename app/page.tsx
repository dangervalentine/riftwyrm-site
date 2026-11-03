import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import Deck from "@/components/sections/Deck";
import Features from "@/components/sections/Features";
import FinalCta from "@/components/sections/FinalCta";
import Gallery from "@/components/sections/Gallery";
import Hero from "@/components/sections/Hero";
import { site } from "@/components/site";

export const metadata: Metadata = {
  title: { absolute: `${site.name}: hunt dragons in a solo card game` },
  description: site.tagline,
  alternates: { canonical: "/" },
};

/** The game in play first, just below the fold; then the page walks the game's
 * road: the deck, since everything is dealt from it, its road running region
 * by region on each Region's ground to the lair. */
export default function Home() {
  return (
    <>
      <JsonLd />
      <Header overlay />
      <main>
        <Hero />
        <Gallery />
        <Deck />
        <Features />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
