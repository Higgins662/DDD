import { unstable_cache } from "next/cache";
import { usingNeon, neonJson } from "./db";

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

// Categories come from the tracker's eBay search words, which are sometimes
// clumsy ("obd2 scanner bluetooth"). Nicer names for display; the address
// (/category/<slug>) stays the same.
const CATEGORY_LABELS = {
  "obd2 scanner bluetooth": "OBD2 scanner",
  "electric scooter adult": "electric scooter",
  "squat rack power rack": "squat rack",
  "wireless headphones earbuds": "wireless earbuds",
  "nvme ssd": "NVMe SSD",
  "impact driver kit": "impact driver",
  "wireless meat thermometer": "meat thermometer",
};
export const categoryLabel = (name) => CATEGORY_LABELS[String(name || "").toLowerCase()] || name;

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

  // When it ended: the first price check of the latest run of checks above the
  // deal price (a dip back to the deal price and up again restarts the clock).
  let endedAt = null;
  if (priceRoseAfterDeal) {
    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i];
      if (new Date(p.at) <= new Date(d.detected_at) || p.price === null || p.price <= dealPrice + 0.009) break;
      endedAt = p.at;
    }
  }

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
    title: stripStoreBrand(d.title, d.source),
    image: d.image_url,
    url: d.product_url,
    dealPrice,
    previous,
    priceNow,
    discountPct,
    caption: cleanCaption(d.caption),
    status: d.status,
    detectedAt: d.detected_at,
    category: d.category ? categoryLabel(d.category) : null,
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
    endedAt,
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

async function fetchDealsSupabase() {
  const rows = await query(
    `public_deals?select=${DEAL_COLUMNS}&order=detected_at.desc&limit=200`
  );
  const history = await historyFor(rows);
  return { rows, history };
}

// Neon: the same two reads as one round trip. Throws on failure so a bad read
// is never cached.
async function fetchDealsNeon() {
  const data = await neonJson(
    `with d as (
       select ${DEAL_COLUMNS} from public.public_deals
       order by detected_at desc nulls last limit 200)
     select json_build_object(
       'rows', coalesce((select json_agg(d order by d.detected_at desc nulls last) from d), '[]'::json),
       'history', coalesce((
         select json_agg(h order by h.checked_at)
         from (select source, product_id, price, checked_at from public.public_price_history
               where product_id in (select product_id from d)) h), '[]'::json)
     ) as data`
  );
  if (!data || !Array.isArray(data.rows)) throw new Error("Neon returned no deal data");
  return data;
}

// Neon's free plan includes 100 compute-hours a month, and the database only
// sleeps after 5 idle minutes. Vercel's shared data cache keeps one copy of the
// deal list for 15 minutes across all servers, so the database wakes at most a
// few times an hour instead of staying on around the clock.
const NEON_CACHE_SECONDS = 15 * 60;
const fetchDealsNeonCached = unstable_cache(fetchDealsNeon, ["deals-neon-v1"], {
  revalidate: NEON_CACHE_SECONDS,
  tags: ["deals"],
});

async function fetchDeals() {
  if (!usingNeon) return fetchDealsSupabase();
  try {
    return await fetchDealsNeonCached();
  } catch (err) {
    console.error("Neon read failed:", err);
    return { rows: [], history: [] };
  }
}

// Supabase usage: every page render used to download the whole deal list and
// price history (~85 KB). Crawlers rendering ~2 pages a second turned that into
// gigabytes a day. Keep one copy in memory for a minute and share it between
// renders (and between a page and its metadata). A failed or empty read is not
// kept, so a Supabase hiccup doesn't stick.
const DEALS_TTL_MS = 60 * 1000;
let dealsCache = null; // { at, promise }

function cachedDeals() {
  const now = Date.now();
  if (dealsCache && now - dealsCache.at < DEALS_TTL_MS) return dealsCache.promise;
  const entry = { at: now, promise: null };
  entry.promise = fetchDeals().then((data) => {
    if (!data.rows.length && dealsCache === entry) dealsCache = null;
    return data;
  });
  dealsCache = entry;
  return entry.promise;
}

// Ended deals (price went back up) stay under "Recently ended" for a week,
// then drop off the lists, roundups and sitemap. Their own page still opens
// (links in old posts keep working); it says the deal ended and isn't indexed.
const ENDED_KEEP_MS = 7 * 24 * 60 * 60 * 1000;
const expired = (deal, now = Date.now()) =>
  deal.priceRoseAfterDeal && deal.endedAt && now - new Date(deal.endedAt).getTime() > ENDED_KEEP_MS;

export async function getDeals() {
  const { rows, history } = await cachedDeals();
  return rows.map((d) => shapeDeal(d, history)).filter((d) => !expired(d));
}

export async function getDeal(id) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  // Most deal pages are for deals already in the shared list above.
  const { rows: all, history: allHistory } = await cachedDeals();
  const hit = all.find((d) => d.id === id);
  if (hit) return shapeDeal(hit, allHistory);
  if (usingNeon) {
    // A deal no longer in the list (old link): one small direct read.
    try {
      const one = await neonJson(
        `select json_build_object(
           'rows', coalesce((select json_agg(d) from (select ${DEAL_COLUMNS} from public.public_deals where id = $1::uuid) d), '[]'::json),
           'history', coalesce((select json_agg(h order by h.checked_at) from (
              select p.source, p.product_id, p.price, p.checked_at from public.public_price_history p
              join public.public_deals d on d.source = p.source and d.product_id = p.product_id
              where d.id = $1::uuid) h), '[]'::json))`,
        [id]
      );
      if (!one || !one.rows.length) return null;
      return shapeDeal(one.rows[0], one.history);
    } catch (err) {
      console.error("Neon deal read failed:", err);
      return null;
    }
  }
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
  ({
    ebay: "eBay",
    amazon: "Amazon",
    walmart: "Walmart",
    kingscamo: "Kings Camo",
    dicks: "DICK'S Sporting Goods",
  }[source] || titleCase(source));

// DICK'S rule for content partners: no headline or title that names DICK'S
// may carry sale-type words, and every page title ends in "DropDadDeals". So a
// DICK'S product name never includes the store or its house brand "DSG"; the
// store is named in the body ("See it on DICK'S Sporting Goods"). Only applied
// to DICK'S deals, since "DSG" also means a gearbox in eBay car-part titles.
export function stripStoreBrand(title, source) {
  if (source !== "dicks") return title;
  const t = String(title || "")
    .replace(/\bDICK['’]?S\s+Sporting\s+Goods\b/gi, " ")
    .replace(/\bDICK['’]?S\b/gi, " ")
    .replace(/\bDSG\b/g, " ")
    .replace(/^[\s\-–—:|,]+|[\s\-–—:|,]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return t || title;
}

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
