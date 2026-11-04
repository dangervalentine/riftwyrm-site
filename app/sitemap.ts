import type { MetadataRoute } from "next";
import { site } from "@/components/site";

/** The public pages. The strategy guide is left out on purpose: it is reached only
 * through the goblin hexer on the home page, and its pages ask not to be indexed. */
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/beta", "/privacy", "/support"].map((path) => ({ url: `${site.url}${path}` }));
}
