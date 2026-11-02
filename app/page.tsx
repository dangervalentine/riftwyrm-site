import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import Deck from "@/components/sections/Deck";
import Dragons from "@/components/sections/Dragons";
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

/** The page walks the game's road: the deck first, since everything is dealt
 * from it, then each section on the next Region's ground, ending at the lair. */
export default function Home() {
  return (
    <>
      <JsonLd />
      <Header overlay />
      <main>
        <Hero />
        <Deck />
        <Gallery />
        <Dragons />
        <Features />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
