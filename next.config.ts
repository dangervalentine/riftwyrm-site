import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** No image optimisation or server features are used; the site is three
   * static pages. poweredByHeader off keeps the response headers plain. */
  poweredByHeader: false,
};

export default nextConfig;
