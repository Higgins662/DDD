import { notFound } from "next/navigation";
import DealFeed from "../../../components/DealFeed";
import { getDeals, categoriesFrom } from "../../../lib/data";
import { categoryCopy, knownCategory } from "../../../lib/seo";

// Render on every request so new deals show up immediately.
export const dynamic = "force-dynamic";

// A category with live deals, or one we've had deals in before (its page stays
// up with a "nothing right now" note). Anything else is a 404.
async function load(slug) {
  const all = await getDeals();
  const categories = categoriesFrom(all);
  const cat = categories.find((c) => c.slug === slug) || knownCategory(slug);
  if (!cat) return null;
  const inCat = all.filter((d) => d.categorySlug === slug);
  return { all, categories, cat, copy: categoryCopy(cat, inCat) };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return { title: "Category not found" };
  const { copy } = data;
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: { title: `${copy.title} | DropDadDeals`, description: copy.description },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { all, categories, cat, copy } = data;

  return (
    <>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <h1>{copy.Name} deals</h1>
          <p>{copy.intro}</p>
        </div>
      </section>
      <DealFeed deals={all} categories={categories} selected={cat.count ? [slug] : []} emptyCategory={cat.count ? null : copy.Name} />
    </>
  );
}
