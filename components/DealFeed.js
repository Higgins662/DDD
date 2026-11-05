import DealCard from "./DealCard";
import ChipFilter from "./ChipFilter";
import AdSlot from "./AdSlot";
import { titleCase } from "../lib/data";

// Every deal is rendered once; the chips (ChipFilter, in the browser) hide the
// ones outside the selected categories. `selected` is the starting selection
// (a category page starts with its own category picked).
export default function DealFeed({ deals, categories, selected = [], emptyCategory = null }) {
  const live = deals.filter((d) => !d.priceRoseAfterDeal);
  const ended = deals.filter((d) => d.priceRoseAfterDeal);

  // Per category: how many live and ended deals, so the chips can hide a
  // section heading when none of its cards are in the selection.
  const counts = new Map();
  for (const d of deals) {
    if (!d.categorySlug) continue;
    const c = counts.get(d.categorySlug) || { live: 0, ended: 0 };
    if (d.priceRoseAfterDeal) c.ended += 1;
    else c.live += 1;
    counts.set(d.categorySlug, c);
  }
  const chips = categories.map((c) => ({ ...c, label: titleCase(c.name), ...(counts.get(c.slug) || { live: 0, ended: 0 }) }));

  return (
    <div className="wrap" id="deal-feed">
      {chips.length > 0 && <ChipFilter categories={chips} initial={selected} feedId="deal-feed" />}

      {emptyCategory ? (
        <p className="empty">Here's everything else we're tracking right now.</p>
      ) : null}

      {live.length === 0 && ended.length === 0 ? (
        <p className="empty">No deals here right now. New price drops are added throughout the day.</p>
      ) : null}

      {live.length > 0 && (
        <section data-sec="live">
          <h2 className="section-title">Live price drops</h2>
          <div className="grid">
            {live.map((d) => <DealCard key={d.id} deal={d} />)}
          </div>
        </section>
      )}

      {/* Google AdSense banner between the live and the ended deals. */}
      {live.length > 0 && ended.length > 0 && <AdSlot />}

      {ended.length > 0 && (
        <section data-sec="ended">
          <h2 className="section-title">Recently ended</h2>
          <div className="grid">
            {ended.map((d) => <DealCard key={d.id} deal={d} />)}
          </div>
        </section>
      )}
    </div>
  );
}
