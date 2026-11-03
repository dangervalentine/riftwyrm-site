import { edition } from "@/components/guide";
import { site } from "@/components/site";

/**
 * A guide page described for search engines: an Article by the developer,
 * and on a dragon's page where it sits under the guide (a BreadcrumbList).
 */
export default function ArticleJsonLd({
  title,
  description,
  path,
  crumb,
}: {
  title: string;
  description: string;
  path: string;
  crumb?: string;
}) {
  const url = `${site.url}${path}`;
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    image: `${url}/opengraph-image`,
    dateModified: edition.updated,
    author: { "@type": "Person", name: site.developer, url: site.developerUrl },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    about: { "@type": "VideoGame", name: site.name, url: site.url },
  };
  const breadcrumbs = crumb && {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strategy guide", item: `${site.url}/guide` },
      { "@type": "ListItem", position: 2, name: crumb, item: url },
    ],
  };
  const data = breadcrumbs ? [article, breadcrumbs] : article;
  return (
    <script
      type="application/ld+json"
      // JSON from our own constants; "<" is escaped so it cannot close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
