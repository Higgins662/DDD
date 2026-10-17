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

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DropDadDeals — real price drops, posted only when they're real",
    template: "%s · DropDadDeals",
  },
  description:
    "Real price drops on gear, tools, outdoor and tech, checked against our own price history so you know a deal is actually a deal.",
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
            <Link href="/" className="brand" aria-label="DropDadDeals home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" width="44" height="37" />
              <span className="brand-name">DropDad<span>Deals</span></span>
            </Link>
            <nav className="site-nav">
              <Link href="/">Deals</Link>
              <Link href="/roundups">Roundups</Link>
              <Link href="/about">How it works</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <p style={{ margin: 0 }}>
              <strong>Affiliate disclosure:</strong> DropDadDeals earns a commission when you buy
              through links on this site, at no extra cost to you. As an eBay Partner, we may be
              compensated if you make a purchase. <Link href="/disclosure">Learn more</Link>.
            </p>
            <p style={{ margin: 0 }}>
              Prices change often. The price you see at the store when you click is the one that
              applies.
            </p>
            <p style={{ margin: 0 }}>
              © {new Date().getFullYear()} DropDadDeals ·{" "}
              <Link href="/privacy">Privacy policy</Link> ·{" "}
              <Link href="/disclosure">Affiliate disclosure</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
