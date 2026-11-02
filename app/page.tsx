import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import Dragons from "@/components/sections/Dragons";
import Features from "@/components/sections/Features";
import FinalCta from "@/components/sections/FinalCta";
import Gallery from "@/components/sections/Gallery";
import Hero from "@/components/sections/Hero";
import Pitch from "@/components/sections/Pitch";
import World from "@/components/sections/World";
import { site } from "@/components/site";

export const metadata: Metadata = {
  title: { absolute: `${site.name}: hunt dragons in a solo card game` },
  description: site.tagline,
  alternates: { canonical: "/" },
};

/** The page walks the game's road: each section stands on the next Region's
 * ground, ending at the lair. */
export default function Home() {
  return (
    <>
      <JsonLd />
      <Header overlay />
      <main>
        <Hero />
        <section aria-labelledby="about-title" className="ground-1 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <Pitch />
            <Features />
          </div>
        </section>
        <Gallery />
        <Dragons />
        <World />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
