import DealFeed from "../components/DealFeed";
import { getDeals, categoriesFrom, SITE_URL } from "../lib/data";
import { FACEBOOK_URL } from "../lib/brand";
import FollowFacebook from "../components/FollowFacebook";
import AmazonStorefront from "../components/AmazonStorefront";

// Render on every request so new deals show up immediately.
export const dynamic = "force-dynamic";

// Filtered views (?cat=...) point search engines back at the main page.
export const metadata = { alternates: { canonical: "/" } };

// Tells Google the site's name and logo, so search results say "DropDadDeals"
// instead of the bare domain. https://developers.google.com/search/docs/appearance/site-names
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "DropDadDeals",
      alternateName: ["Drop Dad Deals", "DDD"],
      url: `${SITE_URL}/`,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "DropDadDeals",
      url: `${SITE_URL}/`,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-512.png`, width: 512, height: 512 },
      sameAs: [FACEBOOK_URL],
    },
  ],
};

// "?cat=trail-camera,grill" -> ["trail-camera", "grill"], keeping only real categories.
function parseSelected(raw, categories) {
  const known = new Set(categories.map((c) => c.slug));
  const values = Array.isArray(raw) ? raw.join(",") : raw || "";
  return [...new Set(values.split(",").map((s) => s.trim()).filter((s) => known.has(s)))];
}

export default async function Home({ searchParams }) {
  const { cat } = await searchParams;
  const deals = await getDeals();
  const categories = categoriesFrom(deals);
  const selected = parseSelected(cat, categories);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
      <section className="hero hero-with-dad">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Field notes · Live observations</p>
            <h1>
              The drop. <em>Posted only when it's real.</em>
            </h1>
            <p>
              We track prices on gear, tools, outdoor and tech every day. A deal only shows up here
              when the price genuinely falls below what we've seen, not when a store invents a fake
              "was" price.
            </p>
          </div>
          <figure className="hero-dad">
            <p className="hero-bubble">I check the prices so you don't have to.</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dropdad.webp"
              alt="The DropDad waving hello"
              width="568"
              height="760"
              fetchPriority="high"
            />
          </figure>
        </div>
      </section>
      <div className="wrap">
        <div className="cta-pair">
          <FollowFacebook variant="banner" where="home" />
          <AmazonStorefront where="home" />
        </div>
      </div>
      <DealFeed deals={deals} categories={categories} selected={selected} />
    </>
  );
}
