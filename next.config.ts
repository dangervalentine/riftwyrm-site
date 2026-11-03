import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** No server features are used; the site is three static pages.
   * poweredByHeader off keeps the response headers plain. */
  poweredByHeader: false,
  /** The images are served as scripts/sync-assets.mjs makes them: already
   * WebP, already sized at about twice the width they are shown at. Next's
   * optimizer would only compress them a second time (at quality 75), which
   * smears painted art and card text. */
  images: { unoptimized: true },
};

export default nextConfig;
