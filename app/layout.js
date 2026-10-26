import Link from "next/link";
// Self-hosted fonts (no Google Fonts request at build or page load).
import "@fontsource/zilla-slab/latin-600.css";
import "@fontsource/zilla-slab/latin-700.css";
import "@fontsource/zilla-slab/latin-600-italic.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "./globals.css";
import { SITE_URL } from "../lib/data";
import GoogleAnalytics from "../components/GoogleAnalytics";
import { FACEBOOK_URL, AMAZON_STOREFRONT_URL } from "../lib/brand";
import { HeaderFollow } from "../components/FollowFacebook";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DropDadDeals | Real Price Drops on Tools, Outdoor Gear & Tech",
    template: "%s · DropDadDeals",
  },
  description:
    "Daily deals on tools, outdoor and hunting gear, tech and men's clothing, checked against real price history so you know the discount is real.",
  applicationName: "DropDadDeals",
  openGraph: { type: "website", siteName: "DropDadDeals" },
  twitter: { card: "summary_large_image" },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#232527" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GoogleAnalytics />
        <header className="site-header">
          <div className="wrap">
            <Link prefetch={false} href="/" className="brand" aria-label="DropDadDeals home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" width="44" height="37" />
              <span className="brand-name">DropDad<span>Deals</span></span>
            </Link>
            <nav className="site-nav">
              <Link prefetch={false} href="/">Deals</Link>
              <Link prefetch={false} href="/roundups">Roundups</Link>
              <Link prefetch={false} href="/about">How it works</Link>
              <HeaderFollow />
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <p style={{ margin: 0 }}>
              <strong>Affiliate disclosure:</strong> DropDadDeals earns a commission when you buy
              through links on this site, at no extra cost to you. As an eBay Partner, we may be
              compensated if you make a purchase. As an Amazon Associate I earn from qualifying
              purchases. <Link prefetch={false} href="/disclosure">Learn more</Link>.
            </p>
            <p style={{ margin: 0 }}>
              Prices change often. The price you see at the store when you click is the one that
              applies.
            </p>
            <p style={{ margin: 0 }}>
              © {new Date().getFullYear()} DropDadDeals ·{" "}
              <Link prefetch={false} href="/privacy">Privacy policy</Link> ·{" "}
              <Link prefetch={false} href="/disclosure">Affiliate disclosure</Link> ·{" "}
              <a href={FACEBOOK_URL} target="_blank" rel="noopener me">
                Facebook
              </a> ·{" "}
              <a href={AMAZON_STOREFRONT_URL} target="_blank" rel="sponsored noopener">
                Amazon storefront
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
