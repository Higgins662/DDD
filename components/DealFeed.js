import Link from "next/link";
import DealCard from "./DealCard";
import { titleCase } from "../lib/data";

// Link that toggles one category in or out of the current selection.
// Selecting nothing (or "All deals") goes back to the unfiltered home page.
function hrefFor(selected) {
  if (!selected.length) return "/";
  return `/?cat=${selected.map(encodeURIComponent).join(",")}`;
}

function toggle(selected, slug) {
  return selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug];
}

export default function DealFeed({ deals, categories, selected = [] }) {
  const shown = selected.length ? deals.filter((d) => selected.includes(d.categorySlug)) : deals;
  const live = shown.filter((d) => !d.priceRoseAfterDeal);
  const ended = shown.filter((d) => d.priceRoseAfterDeal);

  return (
    <div className="wrap">
      {categories.length > 0 && (
        <nav className="chips" aria-label="Filter by category (select any number)">
          <Link prefetch={false} href="/" className={`chip${selected.length ? "" : " active"}`} scroll={false}>
            All deals
          </Link>
          {categories.map((c) => {
            const on = selected.includes(c.slug);
            return (
              <Link prefetch={false}
                key={c.slug}
                href={hrefFor(toggle(selected, c.slug))}
                className={`chip${on ? " active" : ""}`}
                aria-label={`${titleCase(c.name)}, ${c.count} deal${c.count === 1 ? "" : "s"}, ${on ? "selected" : "not selected"}`}
                scroll={false}
                rel="nofollow"
              >
                {on ? <span className="chip-check" aria-hidden="true">✓</span> : null}
                {titleCase(c.name)}
                <span className="count">{c.count}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {selected.length > 0 && (
        <p className="filter-summary">
          Showing {shown.length} deal{shown.length === 1 ? "" : "s"} in {selected.length}{" "}
          {selected.length === 1 ? "category" : "categories"} ·{" "}
          <Link prefetch={false} href="/" scroll={false}>Clear filter</Link>
        </p>
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
