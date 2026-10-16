import { ImageResponse } from "next/og";
import { BRAND, brandFonts, svgDataUri } from "../lib/brand";

// The link preview Facebook and others show when a page is shared.
// Drawn to match the DropDadDeals Facebook banner.
export const alt = "DropDadDeals — posted only when it's real";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Step line from the banner: flat-ish wobbles, then the big orange drop.
const LINE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200">
<line x1="100" y1="10" x2="790" y2="10" stroke="#8a857c" stroke-width="2" stroke-dasharray="6 9"/>
<path d="M0 10 H95 V22 H195 V5 H290 V30 H385 V22 H470 V40" fill="none" stroke="${BRAND.cream}" stroke-width="7"/>
<path d="M470 40 V160 H760" fill="none" stroke="${BRAND.orange}" stroke-width="7"/>
<circle cx="760" cy="160" r="20" fill="${BRAND.orange}"/>
</svg>`;

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: BRAND.bg,
          backgroundImage: `linear-gradient(${BRAND.grid} 1px, transparent 1px), linear-gradient(90deg, ${BRAND.grid} 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          padding: "70px 72px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", fontFamily: "IBM Plex Mono", fontSize: 22, letterSpacing: 6, color: BRAND.orange }}>
          FIELD NOTES · LIVE OBSERVATIONS
        </div>
        <div style={{ display: "flex", fontFamily: "Zilla Slab", fontWeight: 700, fontSize: 150, lineHeight: 1, marginTop: 18 }}>
          <span style={{ color: BRAND.cream }}>DropDad</span>
          <span style={{ color: BRAND.orange }}>Deals</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Zilla Slab",
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 34,
            color: BRAND.cream,
            marginTop: 30,
            lineHeight: 1.25,
          }}
        >
          <span>Fig. 1 — The drop.</span>
          <span>Posted only when it's real.</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={svgDataUri(LINE_SVG)}
          width={640}
          height={160}
          alt=""
          style={{ position: "absolute", right: 60, bottom: 50 }}
        />
      </div>
    ),
    { ...size, fonts: await brandFonts() }
  );
}
