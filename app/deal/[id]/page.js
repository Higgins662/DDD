import Link from "next/link";
import { notFound } from "next/navigation";
import PriceChart, { HistoryList } from "../../../components/PriceChart";
import FollowFacebook from "../../../components/FollowFacebook";
import { getDeal, money, storeName, titleCase, timeAgo } from "../../../lib/data";

// Render on every request so new deals show up immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const deal = await getDeal(id);
  if (!deal) return { title: "Deal not found" };
  const desc = `${deal.title} — now ${money(deal.priceNow)}${
    deal.previous ? `, down from ${money(deal.previous)}` : ""
  } at ${storeName(deal.source)}.`;
  return {
    title: deal.title,
    description: desc,
    alternates: { canonical: `/deal/${deal.id}` },
    openGraph: { title: deal.title, description: desc, images: deal.image ? [deal.image] : [] },
    robots: deal.priceRoseAfterDeal ? { index: false, follow: true } : undefined,
  };
}

export default async function DealPage({ params }) {
  const { id } = await params;
  const deal = await getDeal(id);
  if (!deal) notFound();

  const pct = deal.discountPct ? Math.round(deal.discountPct) : null;
  const store = storeName(deal.source);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: deal.title,
    image: deal.image ? [deal.image] : undefined,
    offers: {
      "@type": "Offer",
      price: deal.priceNow?.toFixed(2),
      priceCurrency: "USD",
      url: deal.url,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: store },
    },
  };

  return (
    <div className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="crumbs">
        <Link href="/">Deals</Link>
        {deal.category ? (
          <>
            {" / "}
            <Link href={`/category/${deal.categorySlug}`}>{titleCase(deal.category)}</Link>
          </>
        ) : null}
      </div>

      <article className="deal">
        <div className="deal-img">
          {deal.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={deal.image} alt={deal.title} />
          ) : null}
        </div>

        <div>
          <div className="deal-store">{store}</div>
          <h1>{deal.title}</h1>

          {deal.priceRoseAfterDeal ? (
            <p className="notice">
              Heads up: this deal looks like it has ended. We spotted it at {money(deal.dealPrice)},
              but our latest check shows {money(deal.priceNow)}.
            </p>
          ) : null}

          {deal.priceDroppedAgain ? (
            <p className="notice notice-good">
              Even better: the price dropped again after we first spotted it at{" "}
              {money(deal.dealPrice)}.
            </p>
          ) : null}

          <div className="deal-prices">
            <span className="price-now">{money(deal.priceNow)}</span>
            {deal.previous && !deal.priceRoseAfterDeal ? (
              <span className="price-was">{money(deal.previous)}</span>
            ) : null}
            {pct && !deal.priceRoseAfterDeal ? <span className="save">Save {pct}%</span> : null}
          </div>

          <div className="facts">
            {deal.isLowestTracked && !deal.priceRoseAfterDeal ? (
              <span className="good">✓ Lowest price we've tracked</span>
            ) : deal.lowest !== null ? (
              <span>Lowest tracked: {money(deal.lowest)}</span>
            ) : null}
            <span>Spotted {timeAgo(deal.detectedAt)}</span>
            <span>Last checked {timeAgo(deal.lastChecked)}</span>
          </div>

          {deal.caption ? <p className="blurb">{deal.caption}</p> : null}

          <a className="cta" href={deal.url} target="_blank" rel="sponsored nofollow noopener">
            See it on {store} →
          </a>
          <p className="cta-note">
            Affiliate link: we may earn a commission if you buy, at no extra cost to you. Prices can
            change at any time, so check the final price on {store}.
          </p>

          <FollowFacebook variant="card" where="deal" />

          {deal.history.length > 0 && (
            <section className="panel">
              <h2>Price history</h2>
              <p className="sub">
                {deal.history.length} price check{deal.history.length === 1 ? "" : "s"}
                {deal.lowest !== null && deal.highest !== null && deal.lowest !== deal.highest
                  ? ` · ranged ${money(deal.lowest)} to ${money(deal.highest)}`
                  : ""}
              </p>
              <PriceChart points={deal.history} />
              <HistoryList points={deal.history} />
            </section>
          )}
        </div>
      </article>
    </div>
  );
}
