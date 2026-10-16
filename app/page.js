import DealFeed from "../components/DealFeed";
import { getDeals, categoriesFrom } from "../lib/data";

// Render on every request so new deals show up immediately.
export const dynamic = "force-dynamic";

// Filtered views (?cat=...) point search engines back at the main page.
export const metadata = { alternates: { canonical: "/" } };

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
      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">Field notes · Live observations</p>
          <h1>
            The drop. <em>Posted only when it's real.</em>
          </h1>
          <p>
            We track prices on gear, tools, outdoor and tech every day. A deal only shows up here when
            the price genuinely falls below what we've seen, not when a store invents a fake "was"
            price.
          </p>
        </div>
      </section>
      <DealFeed deals={deals} categories={categories} selected={selected} />
    </>
  );
}
