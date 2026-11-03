import type { MetadataRoute } from "next";
import { guideDragons } from "@/components/guide";
import { site } from "@/components/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const guide = ["/guide", ...guideDragons.map((d) => `/guide/${d.slug}`)];
  return ["", "/privacy", "/support", ...guide].map((path) => ({ url: `${site.url}${path}` }));
}
