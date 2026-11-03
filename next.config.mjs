/** @type {import('next').NextConfig} */

// dropdaddeals.com is the one public address. The www address and the original
// Vercel address permanently redirect to it, keeping the path and query, so
// old links (including ones already shared on Facebook) keep working and search
// engines see a single copy of each page. Preview deployments are unaffected.
const PRIMARY = "https://dropdaddeals.com";
const OTHER_HOSTS = ["www.dropdaddeals.com", "realpricedrops.vercel.app"];

// Vercel free-plan usage: let Vercel's CDN keep a copy of each public page so
// most visits (and Facebook/Google crawler hits) are served from the cache
// instead of running the site's code again. After the time below, the next
// visitor still gets the saved copy while a fresh one is made in the
// background. Every new deployment starts with an empty cache. /admin is not
// listed, so it is never cached.
// The deal list itself is only re-read from the database every 15 minutes
// (lib/data.js), so rebuilding list pages more often than that gains nothing.
const LIST_CACHE = "max-age=900, stale-while-revalidate=86400"; // 15 minutes
// A deal page changes only when that product's price is re-checked (a few
// times a day), so an hour is plenty.
const DEAL_CACHE = "max-age=3600, stale-while-revalidate=86400"; // 1 hour
// Pages whose words rarely change, and link-preview images (slow to draw).
const SLOW_CACHE = "max-age=3600, stale-while-revalidate=86400";

const CACHE_RULES = [
  ["/", LIST_CACHE],
  ["/roundups", LIST_CACHE],
  ["/category/:path*", LIST_CACHE],
  ["/roundup/:path*", LIST_CACHE],
  ["/deal/:path*", DEAL_CACHE],
  ["/about", SLOW_CACHE],
  ["/privacy", SLOW_CACHE],
  ["/disclosure", SLOW_CACHE],
  ["/r/:path*", SLOW_CACHE],
  ["/sitemap.xml", SLOW_CACHE],
];

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      ...CACHE_RULES.map(([source, value]) => ({
        source,
        headers: [{ key: "Vercel-CDN-Cache-Control", value }],
      })),
      // Listed after the pages so it wins for roundup images.
      {
        source: "/roundup/:kind/:key/opengraph-image(.*)",
        headers: [{ key: "Vercel-CDN-Cache-Control", value: SLOW_CACHE }],
      },
    ];
  },
  async redirects() {
    return OTHER_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host", value: host }],
      destination: `${PRIMARY}/:path*`,
      permanent: true,
    }));
  },
};

export default nextConfig;
