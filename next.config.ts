import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Every page is static; the one server feature is the beta sign-up form's
   * server action (app/beta/actions.ts), so the site runs under `next start`.
   * poweredByHeader off keeps the response headers plain. */
  poweredByHeader: false,
  /** The images are served as scripts/sync-assets.mjs makes them: already
   * WebP, already sized at about twice the width they are shown at. Next's
   * optimizer would only compress them a second time (at quality 75), which
   * smears painted art and card text. */
  images: { unoptimized: true },
};

export default nextConfig;
