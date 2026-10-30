import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Spectral } from "next/font/google";
import "./globals.css";
import { site } from "@/components/site";

/** The game's two faces: Spectral for headings, Source Sans 3 for text. */
const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.tagline,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.name,
    description: site.tagline,
    locale: "en_US",
  },
};

/** Paints the mobile browser chrome the colour of the page. */
export const viewport: Viewport = {
  themeColor: "#0c1013",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spectral.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
