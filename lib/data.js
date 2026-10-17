// Read-only data access for the public site.
// Only the `public_deals` and `public_price_history` views are readable with this key;
// every other table in the database stays private.

// The publishable key is meant to be public; it can only read the two views above.
const SUPABASE_URL = process.env.SUPABASE_URL || "https://dicxnfzdhhxhycfqwrrh.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_76oJmwNPCyjYyuVuy366KQ_VE8-she2";



async function query(path) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY");
    return [];
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: SUPABASE_KEY, Accept: "application/json" },
      cache: "no-store", // always read the latest deals
    });
    if (!res.ok) {
      console.error(`Supabase ${res.status} for ${path}: ${await res.text()}`);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error(`Supabase fetch failed for ${path}:`, err);
    return [];
  }
}

const num = (v) => (v === null || v === undefined ? null : Number(v));

export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function titleCase(text) {
  // Capitalize words, but not the letter after an apostrophe ("Men's", not "Men'S").
  return String(text || "").replace(/(^|[\s\-/(])([a-z])/g, (_, pre, ch) => pre + ch.toUpperCase());
}

// Remove "#ad" and hashtags from social captions so they read like site copy.
export function cleanCaption(caption) {
  return String(caption || "")
    .replace(/(^|\s)#\w+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function shapeDeal(d, history = []) {
  const points = history
    .filter((p) => p.source === d.source && p.product_id === d.product_id)
    .map((p) => ({ price: num(p.price), at: p.checked_at }))
    .sort((a, b) => new Date(a.at) - new Date(b.at));

  const dealPrice = num(d.price_current);
  const previous = num(d.price_previous);
  const latest = points.length ? points[points.length - 1] : null;

  // If our latest price check is newer than the deal and the price went up, say so.
  const priceNow =
    latest && new Date(latest.at) > new Date(d.detected_at) ? latest.price : dealPrice;
  const priceRoseAfterDeal = priceNow !== null && dealPrice !== null && priceNow > dealPrice + 0.009;

  const priceDroppedAgain = priceNow !== null && dealPrice !== null && priceNow < dealPrice - 0.009;

  const prices = points.map((p) => p.price).filter((p) => p !== null);
  const lowest = prices.length ? Math.min(...prices) : null;
  const highest = prices.length ? Math.max(...prices) : null;

  // Recompute the discount from the price we show, so the badge never goes stale.
  const discountPct =
    previous && priceNow !== null && previous > priceNow
      ? ((previous - priceNow) / previous) * 100
      : num(d.discount_pct);

  return {
    id: d.id,
    source: d.source,
    productId: d.product_id,
    title: d.title,
    image: d.image_url,
    url: d.product_url,
    dealPrice,
    previous,
    priceNow,
    discountPct,
    caption: cleanCaption(d.caption),
    status: d.status,
    detectedAt: d.detected_at,
    category: d.category || null,
    categorySlug: d.category ? slugify(d.category) : null,
    history: points,
    lastChecked: latest ? latest.at : d.detected_at,
    lowest,
    highest,
    // Only claim "lowest tracked" once there are enough checks for it to mean something.
    isLowestTracked:
      prices.length >= 3 && lowest !== null && priceNow !== null && priceNow <= lowest + 0.009,
    priceRoseAfterDeal,
    priceDroppedAgain,
  };
}

const DEAL_COLUMNS =
  "id,source,product_id,title,image_url,product_url,price_current,price_previous,discount_pct,caption,status,detected_at,posted_at,category";

async function historyFor(deals) {
  if (!deals.length) return [];
  const ids = [...new Set(deals.map((d) => d.product_id))]
    .map((id) => `"${String(id).replace(/"/g, "")}"`)
    .join(",");
  return query(
    `public_price_history?select=source,product_id,price,checked_at&product_id=in.(${encodeURIComponent(
      ids
    )})&order=checked_at.asc&limit=5000`
  );
}

export async function getDeals() {
  const rows = await query(
    `public_deals?select=${DEAL_COLUMNS}&order=detected_at.desc&limit=200`
  );
  const history = await historyFor(rows);
  return rows.map((d) => shapeDeal(d, history));
}

export async function getDeal(id) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const rows = await query(`public_deals?select=${DEAL_COLUMNS}&id=eq.${id}&limit=1`);
  if (!rows.length) return null;
  const history = await historyFor(rows);
  return shapeDeal(rows[0], history);
}

export function categoriesFrom(deals) {
  const map = new Map();
  for (const d of deals) {
    if (!d.category) continue;
    const entry = map.get(d.categorySlug) || { slug: d.categorySlug, name: d.category, count: 0 };
    entry.count += 1;
    map.set(d.categorySlug, entry);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export const money = (v) =>
  v === null || v === undefined
    ? "—"
    : v.toLocaleString("en-US", { style: "currency", currency: "USD" });

export const storeName = (source) =>
  ({ ebay: "eBay", amazon: "Amazon", walmart: "Walmart" }[source] || titleCase(source));

export function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.max(1, Math.round(diff / 60))} min ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)} hr ago`;
  const days = Math.round(diff / 86400);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

// The public address used for canonical links, the sitemap and link previews.
export const SITE_URL =
  process.env.SITE_URL ||
  (process.env.VERCEL ? "https://dropdaddeals.com" : "http://localhost:3000");
