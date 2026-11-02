import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { palette } from "@/components/palette";
import { site } from "@/components/site";

/** The picture shown when the site is shared: the same scene as the hero,
 * drawn once at build time. The art comes from scripts/sync-assets.mjs as
 * PNG, since this renderer cannot read WebP. */
export const alt = `${site.name}: hunt dragons in a solo card game`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const asset = (name: string) => readFile(join(process.cwd(), "assets", name));
const dataUrl = (png: Buffer) => `data:image/png;base64,${png.toString("base64")}`;

export default async function OpengraphImage() {
  const [font, lair, dragon] = await Promise.all([
    asset("fonts/Spectral-Bold.ttf"),
    asset("og-lair.png"),
    asset("og-dragon.png"),
  ]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: `radial-gradient(ellipse 60% 80% at 78% 50%, ${palette.lightning}55, ${palette.ground} 70%)`,
          backgroundColor: palette.ground,
          color: palette.parchment,
          fontFamily: "Spectral",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 80px", width: 640 }}>
          <div style={{ fontSize: 100, letterSpacing: 5, color: palette.brassBright, lineHeight: 1 }}>RIFTWYRM</div>
          <div style={{ display: "flex", width: 380, height: 2, background: palette.brass, opacity: 0.6, margin: "36px 0" }} />
          <div style={{ fontSize: 40, lineHeight: 1.25 }}>Hunt dragons with a hand of cards.</div>
          <div style={{ fontSize: 26, color: palette.muted, marginTop: 20, lineHeight: 1.35 }}>
            A solo fantasy card game for phones and desktop.
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
          <img src={dataUrl(dragon)} width={470} height={470} alt="" style={{ position: "absolute", left: 30, top: 120 }} />
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Spectral", data: font, weight: 700, style: "normal" }] },
  );
}
