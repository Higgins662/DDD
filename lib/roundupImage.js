import { ImageResponse } from "next/og";
import { BRAND, brandFonts, TAG_SVG, svgDataUri } from "./brand";
import { money } from "./data";
import { nickname } from "./roundup";

export const ogSize = { width: 1200, height: 630 };

// Link-preview card for a roundup, in the Facebook-banner style:
// label, big headline, and the top three deals with prices.
export async function roundupImage(r) {
  const items = r.sections.flatMap((s) => s.items).slice(0, 3);
  const headline =
    r.kind === "daily"
      ? r.freshCount
        ? `${r.freshCount} new drop${r.freshCount === 1 ? "" : "s"} today`
        : `${r.count} live deal${r.count === 1 ? "" : "s"}`
      : `Top ${r.count} of the week`;
  const label = r.kind === "daily" ? `DAILY DROPS · ${r.heading.toUpperCase()}` : `WEEKLY ROUNDUP · ${r.subheading.toUpperCase()}`;

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
          padding: "56px 64px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontFamily: "IBM Plex Mono", fontSize: 22, letterSpacing: 5, color: BRAND.orange }}>
            {label}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={svgDataUri(TAG_SVG)} width={46} height={46} alt="" style={{ borderRadius: 8 }} />
            <div style={{ display: "flex", fontFamily: "Zilla Slab", fontWeight: 700, fontSize: 32 }}>
              <span style={{ color: BRAND.cream }}>DropDad</span>
              <span style={{ color: BRAND.orange }}>Deals</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", fontFamily: "Zilla Slab", fontWeight: 700, fontSize: 92, color: BRAND.cream, lineHeight: 1, marginTop: 34 }}>
          {r.count ? headline : "Check back tomorrow"}
        </div>
        {r.best?.discountPct ? (
          <div style={{ display: "flex", fontFamily: "Zilla Slab", fontStyle: "italic", fontWeight: 600, fontSize: 36, color: BRAND.orange, marginTop: 10 }}>
            {`Up to ${Math.round(r.best.discountPct)}% off. Posted only when it's real.`}
          </div>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", marginTop: 36, gap: 14 }}>
          {items.map((d) => (
            <div
              key={d.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "2px solid rgba(236,228,212,0.14)",
                paddingTop: 14,
              }}
            >
              <div style={{ display: "flex", fontFamily: "IBM Plex Mono", fontSize: 26, color: BRAND.cream, maxWidth: 820 }}>
                {nickname(d.title, 44)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "IBM Plex Mono", fontSize: 28 }}>
                <span style={{ color: BRAND.cream }}>{money(d.priceNow)}</span>
                {d.discountPct ? (
                  <span style={{ display: "flex", background: BRAND.orange, color: BRAND.bg, padding: "2px 10px", borderRadius: 6 }}>
                    {`-${Math.round(d.discountPct)}%`}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...ogSize, fonts: await brandFonts() }
  );
}
