import { SITE_URL } from "../lib/data";

export default function robots() {
  return {
    // Chip combinations (?cat=a,b,c) make millions of addresses; crawlers only
    // need the plain pages and /category/<name>.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/*?cat=", "/*?*&cat="] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
