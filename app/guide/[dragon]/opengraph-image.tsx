import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { dragonBySlug, dragonOf, guideDragons } from "@/components/guide";
import { palette } from "@/components/palette";
import { site } from "@/components/site";

/** A dragon's guide page, shared: the dragon in its lair beside "How to beat" its name,
 * drawn at build time in the home page's share image's composition. */
export const alt = "How to beat a dragon in Riftwyrm: the deck to bring and the cards to raise";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return guideDragons.map((d) => ({ dragon: d.slug }));
}

const asset = (name: string) => readFile(join(process.cwd(), "assets", name));
const dataUrl = (png: Buffer) => `data:image/png;base64,${png.toString("base64")}`;

export default async function Image({ params }: { params: Promise<{ dragon: string }> }) {
  const id = dragonBySlug((await params).dragon) ?? "fire";
  const dragon = dragonOf(id);
  const [font, lair, art] = await Promise.all([
    asset("fonts/Spectral-Bold.ttf"),
    asset(`og/${id}-lair.png`),
    asset(`og/${id}-dragon.png`),
  ]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: `radial-gradient(ellipse 60% 80% at 78% 50%, ${palette[id]}88, ${palette.ground} 70%)`,
          backgroundColor: palette.ground,
          color: palette.parchment,
          fontFamily: "Spectral",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 80px", width: 640 }}>
          <div style={{ fontSize: 26, letterSpacing: 4, color: palette.brassBright }}>{`${site.name.toUpperCase()} STRATEGY GUIDE`}</div>
          <div style={{ display: "flex", width: 380, height: 2, background: palette.brass, opacity: 0.6, margin: "30px 0" }} />
          <div style={{ fontSize: 76, lineHeight: 1.1 }}>{`How to beat ${dragon.name}`}</div>
          <div style={{ fontSize: 30, color: palette.muted, marginTop: 24, lineHeight: 1.35 }}>
            {`${dragon.title}: the deck to bring, the cards to raise and the cards to pass on.`}
          </div>
        </div>
        <div style={{ display: "flex", position: "relative", width: 560, height: 630 }}>
          <img
            src={dataUrl(lair)}
            width={330}
            height={457}
            alt=""
            style={{ position: "absolute", left: 150, top: 86, borderRadius: 20, border: `6px solid ${palette.stone}` }}
          />
          <img src={dataUrl(art)} width={470} height={470} alt="" style={{ position: "absolute", left: 30, top: 120 }} />
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Spectral", data: font, weight: 700, style: "normal" }] },
  );
}
