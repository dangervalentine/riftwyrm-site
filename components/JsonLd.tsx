import { site } from "./site";

/** The game described for search engines (schema.org VideoGame and
 * MobileApplication). Where to install it is only stated once a store
 * listing is live. */
export default function JsonLd() {
  const installUrl = site.stores.appStore || site.stores.googlePlay;
  const data = {
    "@context": "https://schema.org",
    "@type": ["VideoGame", "MobileApplication"],
    name: site.name,
    description: site.tagline,
    url: site.url,
    image: `${site.url}/opengraph-image`,
    genre: ["Card game", "Strategy"],
    playMode: "SinglePlayer",
    gamePlatform: ["Android", "iOS"],
    operatingSystem: "Android, iOS",
    applicationCategory: "GameApplication",
    author: { "@type": "Person", name: site.developer },
    // No price is stated: none has been decided, and a wrong one is worse than none.
    ...(installUrl ? { installUrl } : {}),
  };
  return (
    <script
      type="application/ld+json"
      // JSON from our own constants; "<" is escaped so it cannot close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
