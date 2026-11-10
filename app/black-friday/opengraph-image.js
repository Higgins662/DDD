import { ImageResponse } from "next/og";
import { BRAND, brandFonts } from "../../lib/brand";

// Link preview for /black-friday (Google Discover, Facebook, texts).
export const alt = "Black Friday deals: 35% off or more, checked against real price history";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BlackFridayImage() {
  const year = new Date().getFullYear();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: BRAND.bg,
          backgroundImage: `linear-gradient(${BRAND.grid} 1px, transparent 1px), linear-gradient(90deg, ${BRAND.grid} 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          padding: "70px 72px",
        }}
      >
        <div style={{ display: "flex", fontFamily: "IBM Plex Mono", fontSize: 26, letterSpacing: 6, color: BRAND.orange }}>
          THANKSGIVING TO CYBER MONDAY
        </div>
        <div style={{ display: "flex", fontFamily: "Zilla Slab", fontWeight: 700, fontSize: 132, lineHeight: 1, marginTop: 20, color: BRAND.cream }}>
          Black Friday {year}
        </div>
        <div style={{ display: "flex", fontFamily: "Zilla Slab", fontWeight: 700, fontSize: 92, lineHeight: 1.05, marginTop: 10, color: BRAND.orange }}>
          35% off or more.
        </div>
        <div style={{ display: "flex", fontFamily: "Zilla Slab", fontStyle: "italic", fontWeight: 600, fontSize: 34, marginTop: 34, color: BRAND.cream }}>
          Real price drops only, checked against our own price history.
        </div>
        <div style={{ display: "flex", fontFamily: "Zilla Slab", fontWeight: 700, fontSize: 40, marginTop: 40 }}>
          <span style={{ color: BRAND.cream }}>DropDad</span>
          <span style={{ color: BRAND.orange }}>Deals</span>
        </div>
      </div>
    ),
    { ...size, fonts: await brandFonts() }
  );
}
