import { notFound } from "next/navigation";
import DealFeed from "../../../components/DealFeed";
import { getDeals, categoriesFrom, titleCase } from "../../../lib/data";

// Render on every request so new deals show up immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cat = categoriesFrom(await getDeals()).find((c) => c.slug === slug);
  if (!cat) return { title: "Category not found" };
  const name = titleCase(cat.name);
  return {
    title: `${name} deals`,
    description: `Verified price drops on ${cat.name}s, checked against our own price history.`,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const all = await getDeals();
  const categories = categoriesFrom(all);
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  const deals = all.filter((d) => d.categorySlug === slug);

  return (
    <>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <h1>{titleCase(cat.name)} deals</h1>
          <p>Every price below was checked against what we've tracked for that item.</p>
        </div>
      </section>
      <DealFeed deals={deals} categories={categories} activeSlug={slug} />
    </>
  );
}
