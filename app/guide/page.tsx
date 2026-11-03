import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { lessons } from "@/components/guide";
import ArticleJsonLd from "@/components/guide/ArticleJsonLd";
import DragonIndex from "@/components/guide/DragonIndex";
import EditionNote from "@/components/guide/EditionNote";
import EmpowerTable from "@/components/guide/EmpowerTable";
import GuideHeader from "@/components/guide/GuideHeader";
import Lessons from "@/components/guide/Lessons";
import StandingTable from "@/components/guide/StandingTable";

const title = "How to hunt each dragon";
const description =
  "A strategy guide to every dragon: the deck to bring, the cards to raise and to pass on, and the habits that win hunts.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/guide" },
  openGraph: { type: "article", url: "/guide", title, description },
  twitter: { title, description },
};

/** The main guide page: where the game stands, the dragons, the lessons and the reference tables. */
export default function Guide() {
  return (
    <>
      <ArticleJsonLd title={title} description={description} path="/guide" />
      <Header />
      <main className="flex-1">
        <GuideHeader
          kicker="Strategy guide"
          title={title}
          standfirst="What long play of every dragon, at every difficulty, teaches about building a deck that wins: which cards to raise, which to let go, and the habits that turn a close hunt your way."
        />
        <div className="guide-col guide-body">
          <StandingTable />
        </div>
        <DragonIndex />
        <Lessons lessons={lessons} />
        <div className="guide-col guide-body">
          <EmpowerTable />
        </div>
        <EditionNote />
      </main>
      <Footer />
    </>
  );
}
