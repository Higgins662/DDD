import { ImageResponse } from "next/og";
import { TAG_SVG, svgDataUri } from "../lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={svgDataUri(TAG_SVG)} width={180} height={180} alt="" />
    ),
    size
  );
}
