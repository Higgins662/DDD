// Daily and weekly roundups: which deals go in, in what order, the short
// "why it's on the list" notes, and the ready-to-paste text for each channel.
// Everything is built from the same deal data the site already uses.

import { money, storeName, titleCase, SITE_URL } from "./data";

export const TZ = "America/New_York";
const DAY_MS = 86400000;

// ---------- dates (all in Eastern time) ----------

const keyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
export const dayKey = (iso) => keyFmt.format(new Date(iso)); // "2026-10-17"
export const todayKey = () => dayKey(new Date().toISOString());

const keyToUTC = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const utcToKey = (ms) => new Date(ms).toISOString().slice(0, 10);
export const addDays = (key, n) => utcToKey(keyToUTC(key) + n * DAY_MS);
export const isDayKey = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "") && utcToKey(keyToUTC(s)) === s;

// ISO 8601 week ("2026-W42"), Monday to Sunday.
export function weekKey(dk) {
  const t = new Date(keyToUTC(dk));
  const dow = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dow);
  const year = t.getUTCFullYear();
  const week = Math.ceil(((t - Date.UTC(year, 0, 1)) / DAY_MS + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}
export const isWeekKey = (s) => /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/.test(s || "");
export function weekDays(wk) {
  const [y, w] = wk.split("-W").map(Number);
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const monday = Date.UTC(y, 0, 4) - ((jan4.getUTCDay() || 7) - 1) * DAY_MS + (w - 1) * 7 * DAY_MS;
  return Array.from({ length: 7 }, (_, i) => utcToKey(monday + i * DAY_MS));
}

const fmt = (key, opts) => new Date(keyToUTC(key)).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });
export const longDay = (k) => fmt(k, { weekday: "long", month: "long", day: "numeric" });
export const shortDay = (k) => fmt(k, { weekday: "short", month: "short", day: "numeric" });
export const monthDay = (k) => fmt(k, { month: "short", day: "numeric" });
export function weekLabel(wk) {
  const d = weekDays(wk);
  return `${monthDay(d[0])} – ${monthDay(d[6])}`;
}

// ---------- item names and notes ----------

// eBay titles are written for search ("NEW ... NWT Size M w/t"). Make them readable.
export function shortTitle(title) {
  let t = String(title || "")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}️]/gu, "")
    .replace(/\.\.\.$|…$/, "")
    .replace(/\s+-\s+/g, " ")
    .replace(/\b(NEW|NWT|NIB|BNIB|Brand New)\b\s*(w\/t\S*|with tags)?/gi, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (t === t.toUpperCase()) t = titleCase(t.toLowerCase());
  else t = t.replace(/\b([A-Z]{5,})\b/g, (w) => (KEEP_CAPS.has(w) ? w : w[0] + w.slice(1).toLowerCase()));
  return clip(t, 64);
}

// Words that should stay in capitals even though they're long.
const KEEP_CAPS = new Set(["NVIDIA", "NVME", "QLED", "OLED", "HDMI", "WIFI", "USB-C", "GDDR", "DDR4", "DDR5"]);

// Cut at a word boundary, never mid-word.
const clip = (t, max) =>
  (t.length > max ? t.slice(0, max + 1).replace(/\s+\S*$/, "") : t).replace(/[\s,;:/(&+-]+$/, "");

// A shorter name for intros, subject lines and the preview image.
export const nickname = (title, max = 40) => clip(shortTitle(title).replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s{2,}/g, " "), max);

const pct = (d) => (d.discountPct ? Math.round(d.discountPct) : null);
const saved = (d) => (d.previous && d.priceNow !== null && d.previous > d.priceNow ? d.previous - d.priceNow : null);
const firstSeen = (d) => (d.history.length ? d.history[0].at : d.detectedAt);

// Short factual notes shown as chips, strongest first.
export function facts(d) {
  const out = [];
  if (pct(d)) out.push({ kind: "drop", text: `${pct(d)}% off` });
  if (saved(d) >= 1) out.push({ kind: "save", text: `Save ${money(Math.round(saved(d)))}`.replace(".00", "") });
  if (d.isLowestTracked) out.push({ kind: "low", text: "Lowest we've tracked" });
  else if (d.priceDroppedAgain) out.push({ kind: "low", text: "Dropped again since we spotted it" });
  if (d.history.length >= 2) out.push({ kind: "since", text: `Tracked since ${monthDay(dayKey(firstSeen(d)))}` });
  return out;
}

// One plain-English sentence about the price history, for newsletters and the page.
// Rotate wording by position in the list (or by id) so a list doesn't repeat itself.
const pick = (d, options, i) =>
  options[(i ?? [...String(d.id)].reduce((a, c) => a + c.charCodeAt(0), 0)) % options.length];

export function historyNote(d, i) {
  const p = pct(d);
  const was = d.previous ? money(d.previous) : null;
  const since = monthDay(dayKey(firstSeen(d)));
  if (d.isLowestTracked && d.history.length >= 3)
    return pick(d, [
      `That's the lowest of ${d.history.length} price checks since ${since}.`,
      `Cheapest it's been since we started tracking it on ${since}.`,
      `Lowest price we've seen in ${d.history.length} checks.`,
    ], i);
  if (d.priceDroppedAgain) return `It dropped again after we first spotted it at ${money(d.dealPrice)}.`;
  if (d.lowest !== null && d.priceNow !== null && d.lowest < d.priceNow - 0.009)
    return `We've seen it as low as ${money(d.lowest)}, so this is good but not the floor.`;
  if (was && p)
    return pick(d, [
      `Down ${p}% from the ${was} it was selling for.`,
      `It was ${was} before this drop.`,
      `That's ${p}% under its usual ${was}.`,
    ], i);
  return "";
}

const score = (d) => (d.discountPct || 0) + (d.isLowestTracked ? 6 : 0) + (d.priceDroppedAgain ? 3 : 0);
const byScore = (a, b) => score(b) - score(a) || new Date(b.detectedAt) - new Date(a.detectedAt);
const live = (d) => !d.priceRoseAfterDeal;

function summarize(items) {
  const best = items.reduce((m, d) => (!m || (d.discountPct || 0) > (m.discountPct || 0) ? d : m), null);
  const totalSaved = items.reduce((s, d) => s + (saved(d) || 0), 0);
  const cats = [...new Set(items.map((d) => d.category).filter(Boolean))];
  return { best, totalSaved, cats };
}

const list = (arr) =>
  arr.length <= 1 ? arr.join("") : `${arr.slice(0, -1).join(", ")} and ${arr[arr.length - 1]}`;
const plural = (n, one, many = one + "s") => `${n} ${n === 1 ? one : many}`;

// ---------- building roundups ----------

export function buildDaily(deals, dk) {
  const fresh = deals.filter((d) => live(d) && dayKey(d.detectedAt) === dk).sort(byScore);
  const weekAgo = addDays(dk, -6);
  const still = deals
    .filter((d) => live(d) && !fresh.includes(d))
    .filter((d) => {
      const k = dayKey(d.detectedAt);
      return k >= weekAgo && k < dk;
    })
    .sort(byScore)
    .slice(0, Math.max(3, 8 - fresh.length));
  const all = [...fresh, ...still];
  const { best, totalSaved, cats } = summarize(all);

  let intro;
  if (fresh.length) {
    const lead = fresh[0];
    intro =
      `${plural(fresh.length, "new real price drop")} today` +
      (pct(lead) ? `, led by the ${nickname(lead.title)} at ${pct(lead)}% off.` : ".");
    if (still.length) intro += ` Plus ${still.length} from earlier this week that ${still.length === 1 ? "is" : "are"} still live.`;
  } else if (still.length) {
    intro = `No new drops yet today, but ${plural(still.length, "deal")} from earlier this week ${still.length === 1 ? "is" : "are"} still live.`;
  } else {
    intro = "Nothing new today. The tracker checks prices every morning, so check back tomorrow.";
  }

  return {
    kind: "daily",
    key: dk,
    title: `Daily Drops · ${shortDay(dk)}`,
    heading: longDay(dk),
    eyebrow: "Daily Drops",
    intro,
    sections: [
      { title: "New today", items: fresh },
      { title: "Still going from earlier this week", items: still },
    ].filter((s) => s.items.length),
    count: all.length,
    freshCount: fresh.length,
    freshBest: summarize(fresh).best,
    best,
    totalSaved,
    cats,
    url: `${SITE_URL}/roundup/daily/${dk}`,
    shortUrl: `${SITE_URL}/r/d/${dk}`,
    prev: `/roundup/daily/${addDays(dk, -1)}`,
    next: dk < todayKey() ? `/roundup/daily/${addDays(dk, 1)}` : null,
  };
}

export function buildWeekly(deals, wk, limit = 10) {
  const days = new Set(weekDays(wk));
  const found = deals.filter((d) => days.has(dayKey(d.detectedAt)));
  const top = found.filter(live).sort(byScore).slice(0, limit);
  const { best, totalSaved, cats } = summarize(top);
  const allCats = [...new Set(found.map((d) => d.category).filter(Boolean))];

  let intro;
  if (top.length) {
    intro =
      `This week the tracker logged ${plural(found.length, "real price drop")}` +
      (allCats.length ? ` across ${plural(allCats.length, "category", "categories")}` : "") +
      `. Here ${top.length === 1 ? "is the one" : `are the ${top.length} best`} still live` +
      (best && pct(best) ? `, led by the ${nickname(best.title)} at ${pct(best)}% off.` : ".");
  } else {
    intro = found.length
      ? "Every deal from this week has already ended. Prices went back up."
      : "No deals were logged this week.";
  }
  const [firstDay, , , , , , lastDay] = weekDays(wk);
  const thisWeek = weekKey(todayKey());
  const prevWeek = weekKey(addDays(firstDay, -1));
  const nextWeek = weekKey(addDays(lastDay, 1));

  return {
    kind: "weekly",
    key: wk,
    title: `Weekly Roundup · ${weekLabel(wk)}`,
    heading: `The week's best drops`,
    subheading: weekLabel(wk),
    eyebrow: "Weekly Roundup",
    intro,
    sections: top.length ? [{ title: "Top deals still live", items: top }] : [],
    count: top.length,
    foundCount: found.length,
    best,
    totalSaved,
    cats: allCats,
    url: `${SITE_URL}/roundup/weekly/${wk}`,
    shortUrl: `${SITE_URL}/r/w/${wk}`,
    prev: `/roundup/weekly/${prevWeek}`,
    next: wk < thisWeek ? `/roundup/weekly/${nextWeek}` : null,
  };
}

// Most recent day (up to today) that has anything worth showing.
export function latestDailyKey(deals) {
  const t = todayKey();
  for (let i = 0; i < 14; i++) {
    const k = addDays(t, -i);
    if (buildDaily(deals, k).count) return k;
  }
  return t;
}

// ---------- channel text ----------

const priceLine = (d) => {
  const p = pct(d);
  return `${money(d.priceNow)}${d.previous ? ` (was ${money(d.previous)}${p ? `, ${p}% off` : ""})` : ""}`;
};
const allItems = (r) => r.sections.flatMap((s) => s.items);

// Tag links so Google Analytics shows which channel the visit came from.
export const tagged = (url, source, medium, kind) =>
  `${url}${url.includes("?") ? "&" : "?"}utm_source=${source}&utm_medium=${medium}&utm_campaign=${kind}_roundup`;

// Facebook Page post: one link (Facebook limits and down-ranks link posts).
export function facebookPost(r) {
  const items = allItems(r).slice(0, 5);
  const lines = items.map((d, i) => `${i === 0 ? "🔥" : "•"} ${shortTitle(d.title)} – ${priceLine(d)}`);
  const more = r.count > items.length ? `\n…and ${r.count - items.length} more.` : "";
  return [
    `📉 ${r.title}`,
    "",
    r.intro,
    "",
    ...lines,
    more ? more.trim() : null,
    "",
    "Every deal is checked against our own price history, not a made-up \"was\" price. Full list with price charts:",
    tagged(r.url, "facebook", "social", r.kind),
    "",
    "#ad Affiliate links: we may earn a commission. Prices change fast.",
  ]
    .filter((l) => l !== null)
    .join("\n");
}

// Facebook Group post: conversational, no hashtags, disclosure up front.
export function groupPost(r) {
  const items = allItems(r).slice(0, 4);
  const lead = r.kind === "daily" ? "Today's real price drops" : "This week's best real price drops";
  return [
    `${lead} (affiliate links, I may earn a small commission):`,
    "",
    ...items.map((d, i) => `• ${shortTitle(d.title)}: ${priceLine(d)}. ${historyNote(d, i)}`.trim()),
    "",
    `I check prices daily and only post real drops. The full list, with price history for each one, is here: ${tagged(r.url, "facebook_group", "social", r.kind)}`,
  ].join("\n");
}

// SMS: plain characters only (an emoji or curly quote cuts the limit from 160 to 70).
export function smsText(r) {
  const best = r.best;
  const stop = " Reply STOP to opt out";
  const head = `DropDadDeals${r.kind === "weekly" ? " weekly" : ""}: ${headline(r)}`;
  const upTo = best && pct(best) ? `, up to ${pct(best)}% off` : "";
  const name = best ? nickname(best.title, 30).replace(/["“”]/g, "in").replace(/[‘’]/g, "'") : "";
  let msg = `${head}${upTo}. ${r.shortUrl}${stop}`;
  const withName = `${head}${upTo} (${name} ${money(best?.priceNow)}). ${r.shortUrl}${stop}`;
  if (best && withName.length <= 160) msg = withName;
  return msg.replace(/[^\x20-\x7E]/g, "");
}

// "2 new price drops today + 6 still live" / "The week's 10 best price drops"
export function headline(r) {
  if (r.kind === "weekly") return `the week's ${r.count} best price drops`;
  const still = r.count - r.freshCount;
  if (!r.freshCount) return `${plural(r.count, "deal")} still live`;
  return `${plural(r.freshCount, "new price drop")} today${still ? ` + ${still} still live` : ""}`;
}

export function newsletter(r) {
  const items = allItems(r);
  const h = headline(r);
  const subject = `${h[0].toUpperCase()}${h.slice(1)}${r.best && pct(r.best) ? `, up to ${pct(r.best)}% off` : ""}`;
  const preheader = r.best ? `${nickname(r.best.title)} for ${money(r.best.priceNow)}, and more.` : r.intro;
  const body = [
    r.intro,
    "",
    ...items.flatMap((d, i) => [
      `${i + 1}. ${shortTitle(d.title)}`,
      `   ${priceLine(d)} at ${storeName(d.source)}`,
      historyNote(d, i) ? `   ${historyNote(d, i)}` : null,
      d.caption ? `   ${d.caption}` : null,
      `   Price history and link: ${tagged(`${SITE_URL}/deal/${d.id}`, "newsletter", "email", r.kind)}`,
      "",
    ]),
    `See the full roundup: ${tagged(r.url, "newsletter", "email", r.kind)}`,
    "",
    "We earn a commission when you buy through our links, at no extra cost to you. Prices change often; the store's price at checkout is the one that applies.",
  ]
    .filter((l) => l !== null)
    .join("\n");
  return { subject, preheader, body };
}
