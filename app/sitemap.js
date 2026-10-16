import { getDeals, categoriesFrom, SITE_URL } from "../lib/data";

// Render on every request so new deals show up immediately.
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const deals = await getDeals();
  const cats = categoriesFrom(deals);
  return [
    { url: `${SITE_URL}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
    ...cats.map((c) => ({ url: `${SITE_URL}/category/${c.slug}`, changeFrequency: "daily", priority: 0.7 })),
    ...deals
      .filter((d) => !d.priceRoseAfterDeal)
      .map((d) => ({ url: `${SITE_URL}/deal/${d.id}`, lastModified: d.lastChecked, priority: 0.6 })),
  ];
}
