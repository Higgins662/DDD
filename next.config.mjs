/** @type {import('next').NextConfig} */

// dropdaddeals.com is the one public address. The www address and the original
// Vercel address permanently redirect to it, keeping the path and query, so
// old links (including ones already shared on Facebook) keep working and search
// engines see a single copy of each page. Preview deployments are unaffected.
const PRIMARY = "https://dropdaddeals.com";
const OTHER_HOSTS = ["www.dropdaddeals.com", "realpricedrops.vercel.app"];

// Vercel free-plan usage: let Vercel's CDN keep a copy of each public page so
// most visits (and Facebook/Google crawler hits) are served from the cache
// instead of running the site's code again. A page is re-rendered at most once
// every 5 minutes; after that the next visitor gets the saved copy while a fresh
// one is made in the background. Every new deployment starts with an empty cache.
// /admin is not listed, so it is never cached.
const PAGE_CACHE = "max-age=300, stale-while-revalidate=86400";
// Link-preview images are slow to draw and rarely change.
const IMAGE_CACHE = "max-age=3600, stale-while-revalidate=86400";
const PUBLIC_PAGES = [
  "/",
  "/about",
  "/privacy",
  "/disclosure",
  "/roundups",
  "/deal/:path*",
  "/category/:path*",
  "/roundup/:path*",
  "/r/:path*",
  "/sitemap.xml",
];

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      ...PUBLIC_PAGES.map((source) => ({
        source,
        headers: [{ key: "Vercel-CDN-Cache-Control", value: PAGE_CACHE }],
      })),
      // Listed after the pages so it wins for roundup images.
      {
        source: "/roundup/:kind/:key/opengraph-image(.*)",
        headers: [{ key: "Vercel-CDN-Cache-Control", value: IMAGE_CACHE }],
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
