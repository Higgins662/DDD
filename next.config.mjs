/** @type {import('next').NextConfig} */

// dropdaddeals.com is the one public address. The www address and the original
// Vercel address permanently redirect to it, keeping the path and query, so
// old links (including ones already shared on Facebook) keep working and search
// engines see a single copy of each page. Preview deployments are unaffected.
const PRIMARY = "https://dropdaddeals.com";
const OTHER_HOSTS = ["www.dropdaddeals.com", "realpricedrops.vercel.app"];

const nextConfig = {
  poweredByHeader: false,
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
