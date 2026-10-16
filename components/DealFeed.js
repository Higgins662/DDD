import Link from "next/link";
import DealCard from "./DealCard";
import { titleCase } from "../lib/data";

export default function DealFeed({ deals, categories, activeSlug = null }) {
  const live = deals.filter((d) => !d.priceRoseAfterDeal);
  const ended = deals.filter((d) => d.priceRoseAfterDeal);

  return (
    <div className="wrap">
      {categories.length > 0 && (
        <nav className="chips" aria-label="Categories">
          <Link href="/" className={`chip${activeSlug ? "" : " active"}`}>All deals</Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className={`chip${c.slug === activeSlug ? " active" : ""}`}
            >
              {titleCase(c.name)}
              <span className="count">{c.count}</span>
            </Link>
          ))}
        </nav>
      )}

      {live.length === 0 && ended.length === 0 ? (
        <p className="empty">No deals here right now. New price drops are added throughout the day.</p>
      ) : null}

      {live.length > 0 && (
        <>
          <h2 className="section-title">Live price drops</h2>
          <div className="grid">
            {live.map((d) => <DealCard key={d.id} deal={d} />)}
          </div>
        </>
      )}

      {ended.length > 0 && (
        <>
          <h2 className="section-title">Recently ended</h2>
          <div className="grid">
            {ended.map((d) => <DealCard key={d.id} deal={d} />)}
          </div>
        </>
      )}
    </div>
  );
}
