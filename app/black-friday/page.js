import Link from "next/link";
import CompactDealCard from "../../components/CompactDealCard";
import { getDeals, slugify, titleCase } from "../../lib/data";
import { plural } from "../../lib/seo";

// Black Friday: only the biggest live drops (35%+ below the price we tracked
// before), grouped by category, in small cards so a lot fit on a screen.
// Same data as the home page; the scripts' refresh call updates it.
export const dynamic = "force-dynamic";

const MIN_PCT = 35;
const OTHER = "More gear"; // deals with no category (e.g. Kings Camo, DICK'S)

// The year in the title and heading (people search "black friday deals 2026"),
// but not in the address, so /black-friday keeps its Google history every year.
const YEAR = new Date().getFullYear();
const TITLE = `Black Friday Deals ${YEAR}: 35% Off or More, by Category`;
const DESCRIPTION = `Black Friday and Cyber Monday ${YEAR} deals on tools, outdoor and hunting gear, tech and men's clothing. Only real price drops of 35% or more, checked against our own price history.`;

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/black-friday" },
  openGraph: { title: `${TITLE} | DropDadDeals`, description: DESCRIPTION },
};

function groupByCategory(deals) {
  const map = new Map();
  for (const d of deals) {
    const name = d.category ? titleCase(d.category) : OTHER;
    if (!map.has(name)) map.set(name, []);
    map.get(name).push(d);
  }
  const groups = [...map.entries()].map(([name, items]) => ({
    name,
    slug: slugify(name),
    items: items.sort((a, b) => b.discountPct - a.discountPct),
    best: Math.max(...items.map((d) => d.discountPct)),
  }));
  // Biggest groups first; "More gear" last.
  return groups.sort(
    (a, b) => (a.name === OTHER) - (b.name === OTHER) || b.items.length - a.items.length || b.best - a.best
  );
}

// "laptops, trail cameras, kettlebells & more" from the biggest groups.
function listNames(groups) {
  const names = groups.filter((g) => g.name !== OTHER).slice(0, 4).map((g) => plural(g.name.toLowerCase()));
  if (!names.length) return "tools, outdoor gear and tech";
  return `${names.join(", ")} and more`;
}

export default async function BlackFridayPage() {
  const deals = await getDeals();
  const picks = deals.filter((d) => !d.priceRoseAfterDeal && d.discountPct >= MIN_PCT && d.priceNow !== null);
  const groups = groupByCategory(picks);

  return (
    <>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <p className="eyebrow">Thanksgiving to Cyber Monday</p>
          <h1>
            Black Friday deals {YEAR}. <em>{MIN_PCT}% off or more.</em>
          </h1>
          <p>
            The biggest Black Friday and Cyber Monday price drops we're tracking
            {groups.length ? <> on {listNames(groups)}</> : null}. Each one is at least {MIN_PCT}%
            below the price we saw before, not a store's made-up "was" price. New drops land here
            all weekend.
          </p>
        </div>
      </section>

      <div className="wrap">
        {groups.length ? (
          <>
            <nav className="chips bf-jump" aria-label="Jump to a category">
              {groups.map((g) => (
                <a key={g.slug} href={`#${g.slug}`} className="chip">
                  {g.name}
                  <span className="count">{g.items.length}</span>
                </a>
              ))}
            </nav>
            <div className="bf-groups">
              {groups.map((g) => (
                <section key={g.slug} id={g.slug} className="bf-group">
                  <h2 className="section-title">
                    {g.name === OTHER ? g.name : `${g.name} deals`}{" "}
                    <span className="bf-count">{g.items.length}</span>
                  </h2>
                  <div className="mini-list">
                    {g.items.map((d) => (
                      <CompactDealCard key={d.id} deal={d} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        ) : (
          <p className="empty">
            No {MIN_PCT}%+ drops right now. Check back Thanksgiving through Cyber Monday, or see{" "}
            <Link prefetch={false} href="/">all live deals</Link>.
          </p>
        )}
        <p className="bf-foot">
          Prices are what we saw at our last check and can change. As an affiliate we may earn from
          qualifying purchases.
        </p>
      </div>
    </>
  );
}
