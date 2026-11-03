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
// The price-tracker scripts clear these saved pages as soon as they write new
// deals (app/api/refresh drops everything tagged "deals"), so the times below
// are only a safety net for changes made without a refresh call.
const LIST_CACHE = "max-age=3600, stale-while-revalidate=86400"; // 1 hour
const DEAL_CACHE = "max-age=3600, stale-while-revalidate=86400"; // 1 hour
// Tag on every page that shows deal data, so one call can clear them all.
const DEALS_TAG = { key: "Vercel-Cache-Tag", value: "deals" };
// Pages whose words rarely change, and link-preview images (slow to draw).
const SLOW_CACHE = "max-age=3600, stale-while-revalidate=86400";

// [path, cache time, shows deal data?]
const CACHE_RULES = [
  ["/", LIST_CACHE, true],
  ["/roundups", LIST_CACHE, true],
  ["/category/:path*", LIST_CACHE, true],
  ["/roundup/:path*", LIST_CACHE, true],
  ["/deal/:path*", DEAL_CACHE, true],
  ["/r/:path*", SLOW_CACHE, true],
  ["/sitemap.xml", SLOW_CACHE, true],
  ["/about", SLOW_CACHE, false],
  ["/privacy", SLOW_CACHE, false],
  ["/disclosure", SLOW_CACHE, false],
];

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      ...CACHE_RULES.map(([source, value, tagged]) => ({
        source,
        headers: [{ key: "Vercel-CDN-Cache-Control", value }, ...(tagged ? [DEALS_TAG] : [])],
      })),
      // Listed after the pages so it wins for roundup images.
      {
        source: "/roundup/:kind/:key/opengraph-image(.*)",
        headers: [{ key: "Vercel-CDN-Cache-Control", value: SLOW_CACHE }, DEALS_TAG],
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
