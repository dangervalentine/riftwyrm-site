import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { dragonBySlug, dragonGuides, dragonOf, guideDragons } from "@/components/guide";
import ArticleJsonLd from "@/components/guide/ArticleJsonLd";
import CardViewer from "@/components/guide/CardViewer";
import { cardViewerItems } from "@/components/guide/cardViewerItems";
import DragonArticle from "@/components/guide/DragonArticle";
import DragonNav, { Breadcrumb } from "@/components/guide/DragonNav";
import EditionNote from "@/components/guide/EditionNote";

/** The four dragons' pages, made at build time; any other name is not found. */
export const dynamicParams = false;

export function generateStaticParams() {
  return guideDragons.map((d) => ({ dragon: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guide/[dragon]">): Promise<Metadata> {
  const id = dragonBySlug((await params).dragon);
  if (!id) return {};
  const { name } = dragonOf(id);
  const { description } = dragonGuides[id];
  const title = `How to beat ${name}`;
  return {
    title,
    description,
    alternates: { canonical: `/guide/${(await params).dragon}` },
    /** Kept out of search results, as the main guide page is. */
    robots: { index: false, follow: false },
    openGraph: { type: "article", url: `/guide/${(await params).dragon}`, title, description },
    twitter: { title, description },
  };
}

export default async function DragonPage({ params }: PageProps<"/guide/[dragon]">) {
  const { dragon: slug } = await params;
  const id = dragonBySlug(slug);
  if (!id) notFound();
  const { name } = dragonOf(id);
  return (
    <>
      <ArticleJsonLd
        title={`How to beat ${name}`}
        description={dragonGuides[id].description}
        path={`/guide/${slug}`}
        crumb={name}
      />
      <Header />
      <main className="flex-1">
        <Breadcrumb id={id} />
        <CardViewer items={cardViewerItems()}>
          <DragonArticle id={id} />
        </CardViewer>
        <DragonNav id={id} />
        <EditionNote />
      </main>
      <Footer />
    </>
  );
}
