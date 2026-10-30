import type { MetadataRoute } from "next";
import { site } from "@/components/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/privacy", "/support"].map((path) => ({ url: `${site.url}${path}` }));
}
