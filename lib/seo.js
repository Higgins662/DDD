// Search wording: page titles, descriptions and category intros written the
// way people search ("trail camera deals", "<product> price history"), built
// from the deal data so they stay accurate.
import { money, titleCase, slugify, categoryLabel } from "./data";
import { shortTitle, nickname } from "./roundup";

// Categories that have had deals. Their pages stay up (with a "nothing live
// right now" note) when they run out of deals, so Google doesn't lose them.
// Categories not listed here still get a page while they have deals.
export const KNOWN_CATEGORIES = [
  "laptop", "men's jacket", "portable power station", "tent", "beard trimmer",
  "mechanics tool set", "wireless meat thermometer", "smart lock", "insulated tumbler",
  "bluetooth speaker", "dash cam", "electric scooter adult", "fishing rod", "gaming headset",
  "graphics card", "jump starter", "kettlebell", "monitor", "trail camera",
  "men's running shoes", "men's sneakers", "men's watch", "binoculars", "nvme ssd",
  "obd2 scanner bluetooth", "pellet smoker", "electric bike", "drone", "spinning reel",
  "squat rack power rack", "cordless drill", "adjustable weight bench", "wet dry vacuum",
  "wireless headphones earbuds", "impact driver kit", "men's jeans", "cooler",
  "insulated cooler",
];
export function knownCategory(slug) {
  const name = KNOWN_CATEGORIES.find((n) => slugify(n) === slug);
  return name ? { slug, name: categoryLabel(name), count: 0 } : null;
}

// "trail camera" -> "trail cameras", "men's watch" -> "men's watches".
export function plural(name) {
  const n = String(name || "");
  if (/(s|binoculars|jeans|earbuds)$/i.test(n)) return n;
  if (/(x|ch|sh)$/i.test(n)) return `${n}es`;
  return `${n}s`;
}

// Brands worth naming in category intros, matched in listing titles.
const BRANDS = [
  "Carhartt", "Patagonia", "Levi's", "Wrangler", "Nike", "Seiko", "Dell", "HP", "Lenovo",
  "Apple", "Samsung", "LG", "ASUS", "Acer", "MSI", "EcoFlow", "Jackery", "Bluetti", "Anker",
  "Coleman", "Big Agnes", "Philips", "Craftsman", "GearWrench", "DeWalt", "Milwaukee",
  "Makita", "Ryobi", "Ego", "YETI", "Stanley", "Hydro Flask", "JBL", "Bose", "Sony",
  "Sennheiser", "Garmin", "Vantrue", "Spypoint", "Bushnell", "Vortex", "Kingston",
  "Samsung", "Crucial", "WD", "NVIDIA", "Logitech", "SteelSeries", "Razer", "Daiwa",
  "Shimano", "Shakespeare", "Ugly Stik", "Traeger", "Pit Boss", "Weber", "eufy", "Yale",
  "Schlage", "ThermoMaven", "Meater", "Gooloo", "Noco", "DJI", "GoPro", "Navee", "Segway",
  "Oakley", "Ray-Ban", "Leatherman", "Gerber", "Victorinox", "Ring", "Kings Camo",
];
function brandsIn(deals, max = 4) {
  const counts = new Map();
  for (const d of deals) {
    for (const b of BRANDS) {
      const re = new RegExp(`(^|[^a-z])${b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`, "i");
      if (re.test(d.title || "")) counts.set(b, (counts.get(b) || 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, max).map(([b]) => b);
}

const list = (items) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} & ${items[items.length - 1]}`;

// ---------- category pages ----------

export function categoryCopy(cat, deals) {
  const label = categoryLabel(cat.name);
  const Name = titleCase(label);
  const live = deals.filter((d) => !d.priceRoseAfterDeal);
  const prices = live.map((d) => d.priceNow).filter((p) => p !== null && p !== undefined);
  const brands = brandsIn(live);
  const lo = prices.length ? Math.min(...prices) : null;
  const best = live.reduce((m, d) => Math.max(m, d.discountPct || 0), 0);

  const title = `${Name} Deals & Price Drops (Updated Daily)`;
  let intro;
  if (!live.length) {
    intro = `No live ${label} deals right now. We check ${plural(label)} every day and list one here only when its price drops below what we've tracked for it, not when a store invents a "was" price.`;
  } else {
    const parts = [
      `${live.length} live ${live.length === 1 ? `${label} deal` : `${label} deals`}`,
      brands.length ? ` from ${list(brands)}` : "",
      lo !== null ? `, starting at ${money(lo)}` : "",
      best >= 10 ? ` and up to ${Math.round(best)}% off` : "",
      ".",
    ];
    intro = `${parts.join("")} Every price is checked against our own price history, so you can see whether the discount is real before you buy.`;
  }
  // Search snippets stop around 155 characters: lead with the facts, then the promise.
  const description = live.length
    ? `${intro.split(/(?<=\.)\s/)[0]} Checked against our own price history.`
    : `No live ${label} deals right now. We check ${plural(label)} daily and list one only when the price really drops.`;
  return { Name, title, intro, description };
}

// ---------- deal pages ----------

export function dealTitle(deal) {
  // Short enough that Google shows the price (titles are cut around 60 characters).
  const name = nickname(deal.title, 46);
  if (deal.priceRoseAfterDeal) return `${name} Price History`;
  if (deal.previous && deal.priceNow !== null && deal.previous > deal.priceNow)
    return `${name} Price Drop: ${money(deal.priceNow)} (was ${money(deal.previous)})`;
  return `${name}: ${money(deal.priceNow)}`;
}

export function dealDescription(deal, store) {
  const name = shortTitle(deal.title);
  const bits = [];
  if (deal.priceRoseAfterDeal) {
    bits.push(`${name} price history at ${store}: we spotted it at ${money(deal.dealPrice)}, latest check ${money(deal.priceNow)}.`);
  } else {
    bits.push(
      `${name} is ${money(deal.priceNow)} at ${store}${deal.previous ? `, down from ${money(deal.previous)}` : ""}.`
    );
    if (deal.isLowestTracked) bits.push("Lowest price we've tracked.");
  }
  bits.push(`See the full price history${deal.history.length >= 2 ? ` (${deal.history.length} checks)` : ""}.`);
  return bits.join(" ");
}

// ---------- roundups ----------

function topCategories(r, max = 3) {
  const items = r.sections.flatMap((s) => s.items);
  const seen = [];
  for (const d of items) {
    const c = d.category ? titleCase(categoryLabel(d.category)) : null;
    if (c && !seen.includes(c)) seen.push(c);
    if (seen.length >= max) break;
  }
  return seen;
}

export function weeklyTitle(r, label) {
  const cats = topCategories(r);
  return cats.length ? `Best ${list(cats)} Deals This Week (${label})` : `Best Deals This Week (${label})`;
}

export function dailyTitle(r, day) {
  const cats = topCategories(r);
  return cats.length
    ? `Price Drops on ${cats.map((c) => titleCase(plural(c.toLowerCase()))).join(", ")} & More (${day})`
    : `Daily Price Drops (${day})`;
}
