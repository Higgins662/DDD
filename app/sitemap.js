import { getDeals, categoriesFrom, slugify, SITE_URL } from "../lib/data";
import { KNOWN_CATEGORIES } from "../lib/seo";
import { addDays, buildDaily, todayKey, weekKey } from "../lib/roundup";

// Render on every request so new deals show up immediately.
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const deals = await getDeals();
  const cats = [...new Set([...categoriesFrom(deals).map((c) => c.slug), ...KNOWN_CATEGORIES.map(slugify)])];
  const today = todayKey();
  const roundupDays = Array.from({ length: 14 }, (_, i) => addDays(today, -i)).filter(
    (k) => buildDaily(deals, k).freshCount
  );
  const roundupWeeks = [...new Set(roundupDays.map(weekKey))];
  return [
    { url: `${SITE_URL}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/roundups`, changeFrequency: "daily", priority: 0.8 },
    ...roundupDays.map((k) => ({ url: `${SITE_URL}/roundup/daily/${k}`, changeFrequency: "daily", priority: 0.6 })),
    ...roundupWeeks.map((k) => ({ url: `${SITE_URL}/roundup/weekly/${k}`, changeFrequency: "daily", priority: 0.7 })),
    ...cats.map((slug) => ({ url: `${SITE_URL}/category/${slug}`, changeFrequency: "daily", priority: 0.7 })),
    ...deals
      .filter((d) => !d.priceRoseAfterDeal)
      .map((d) => ({ url: `${SITE_URL}/deal/${d.id}`, lastModified: d.lastChecked, priority: 0.6 })),
  ];
}
