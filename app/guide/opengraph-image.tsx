import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { guideDragons } from "@/components/guide";
import { palette } from "@/components/palette";
import { site } from "@/components/site";

/** The strategy guide, shared: its title over the four dragons, drawn at build time. */
export const alt = `How to hunt each dragon: the ${site.name} strategy guide`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const asset = (name: string) => readFile(join(process.cwd(), "assets", name));
const dataUrl = (png: Buffer) => `data:image/png;base64,${png.toString("base64")}`;

export default async function Image() {
  const [font, ...art] = await Promise.all([
    asset("fonts/Spectral-Bold.ttf"),
    ...guideDragons.map((d) => asset(`og/${d.id}-dragon.png`)),
  ]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: `radial-gradient(ellipse 70% 60% at 50% 100%, ${palette.fire}66, ${palette.ground} 70%)`,
          backgroundColor: palette.ground,
          color: palette.parchment,
          fontFamily: "Spectral",
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 4, color: palette.brassBright, marginTop: 64 }}>
          {`${site.name.toUpperCase()} STRATEGY GUIDE`}
        </div>
        <div style={{ fontSize: 84, lineHeight: 1.1, marginTop: 18 }}>How to hunt each dragon</div>
        <div style={{ display: "flex", width: 380, height: 2, background: palette.brass, opacity: 0.6, margin: "28px 0 0" }} />
        <div style={{ display: "flex", marginTop: "auto", gap: 0 }}>
          {art.map((png, i) => (
            <img key={i} src={dataUrl(png)} width={300} height={300} alt="" />
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Spectral", data: font, weight: 700, style: "normal" }] },
  );
}
