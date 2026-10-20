import { readFile } from "node:fs/promises";
import path from "node:path";

export const FACEBOOK_URL = "https://www.facebook.com/dropdaddeals";

export const BRAND = {
  bg: "#232527",
  orange: "#f2661c",
  cream: "#ece4d4",
  grid: "rgba(242,102,28,0.16)",
};

// The tag from the Facebook avatar, as SVG.
export const TAG_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="110 110 580 580"><rect x="110" y="110" width="580" height="580" fill="#232527"/><path d="M220 316 567 162 688 435 342 588 172 500Z" fill="#f2661c"/><circle cx="254" cy="465" r="22" fill="#232527"/><path d="M299 383 370 351 376 374 439 345 432 330 488 306 530 412 606 377" fill="none" stroke="#232527" stroke-width="17"/></svg>';

export const svgDataUri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

const fontPath = (pkg, file) => path.join(process.cwd(), "node_modules", "@fontsource", pkg, "files", file);

export async function brandFonts() {
  const [slab, slabItalic, mono] = await Promise.all([
    readFile(fontPath("zilla-slab", "zilla-slab-latin-700-normal.woff")),
    readFile(fontPath("zilla-slab", "zilla-slab-latin-600-italic.woff")),
    readFile(fontPath("ibm-plex-mono", "ibm-plex-mono-latin-500-normal.woff")),
  ]);
  return [
    { name: "Zilla Slab", data: slab, weight: 700, style: "normal" },
    { name: "Zilla Slab", data: slabItalic, weight: 600, style: "italic" },
    { name: "IBM Plex Mono", data: mono, weight: 500, style: "normal" },
  ];
}
