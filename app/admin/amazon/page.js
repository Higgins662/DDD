import Link from "next/link";
import { headers } from "next/headers";
import CopyBox from "../../../components/CopyBox";
import { getAdminAmazon, passwordFromAuthHeader } from "../../../lib/admin";
import { money } from "../../../lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · Amazon watch",
  robots: { index: false, follow: false, nocache: true },
};

// Private list filled by amazon_watch.py (RapidAPI Real-Time Amazon Data).
// Nothing here is shown on the public site; posting stays manual with
// amazon_poster.py, in your own words, with no prices or percentages.

const TZ = "America/New_York";
const when = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-US", {
        timeZone: TZ,
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

const stateOf = (i) => (i.posted_at ? "posted" : i.dismissed_at ? "dismissed" : "new");

const VIEWS = [
  { key: "new", label: "To post", test: (i) => stateOf(i) === "new" },
  { key: "drop", label: "Our price drops", test: (i) => stateOf(i) === "new" && i.flag === "drop" },
  { key: "discount", label: "Amazon markdowns", test: (i) => stateOf(i) === "new" && i.flag === "discount" },
  { key: "done", label: "Posted or dismissed", test: (i) => stateOf(i) !== "new" },
  { key: "all", label: "All (30 days)", test: () => true },
];

const SORTS = [
  { key: "discount", label: "Biggest discount" },
  { key: "newest", label: "Newest" },
];

// Percent below Amazon's list price, and percent below the price we recorded
// just before the latest fall. The bigger one is the item's discount.
function discountOf(i) {
  const cur = Number(i.price_current);
  if (!Number.isFinite(cur) || cur <= 0) return { pct: 0, basis: null };
  const list = Number(i.list_price);
  const vsList = Number.isFinite(list) && list > cur ? ((list - cur) / list) * 100 : 0;
  const pts = (i.history || []).map((h) => Number(h.p)).filter((n) => Number.isFinite(n));
  let prev = null;
  for (let k = pts.length - 1; k >= 0; k--) {
    if (pts[k] > cur + 0.005) {
      prev = pts[k];
      break;
    }
  }
  const vsOurs = prev ? ((prev - cur) / prev) * 100 : 0;
  if (!vsList && !vsOurs) return { pct: 0, basis: null };
  return vsOurs > vsList ? { pct: vsOurs, basis: "vs our last" } : { pct: vsList, basis: "vs list" };
}

const href = (view, sort) => {
  const q = [];
  if (view !== "new") q.push(`view=${view}`);
  if (sort !== "discount") q.push(`sort=${sort}`);
  return `/admin/amazon${q.length ? `?${q.join("&")}` : ""}`;
};

function Spark({ history }) {
  const pts = (history || []).map((h) => Number(h.p)).filter((n) => Number.isFinite(n));
  if (pts.length < 2) return null;
  const w = 120;
  const h = 32;
  const lo = Math.min(...pts);
  const hi = Math.max(...pts);
  const span = hi - lo || 1;
  const xy = pts.map((p, i) => [(i / (pts.length - 1)) * (w - 4) + 2, h - 3 - ((p - lo) / span) * (h - 6)]);
  const d = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lx, ly] = xy[xy.length - 1];
  return (
    <svg className="amz-spark" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="2.6" fill="var(--accent)" />
    </svg>
  );
}

function Popularity({ i }) {
  const bits = [];
  if (i.is_best_seller) bits.push("Best Seller");
  if (i.is_amazon_choice) bits.push("Amazon's Choice");
  if (i.sales_volume) bits.push(i.sales_volume);
  if (i.num_ratings) bits.push(`${Number(i.num_ratings).toLocaleString("en-US")} ratings${i.rating ? ` · ${i.rating}★` : ""}`);
  return bits.length ? <div className="adm-sub">{bits.join(" · ")}</div> : null;
}

export default async function AmazonWatchPage({ searchParams }) {
  const { view: rawView, sort: rawSort } = await searchParams;
  const view = VIEWS.find((v) => v.key === rawView) || VIEWS[0];
  const sort = SORTS.find((x) => x.key === rawSort) || SORTS[0];

  const password = passwordFromAuthHeader((await headers()).get("authorization"));
  let data = null;
  let error = null;
  try {
    data = await getAdminAmazon(password);
    if (!data) error = "The Amazon watch list needs the Neon database (DATABASE_URL), which this deployment doesn't have.";
  } catch {
    error = "Couldn't load the Amazon watch list from the database. Try refreshing.";
  }
  const items = data?.items || [];
  const run = data?.last_run || null;
  const counts = Object.fromEntries(VIEWS.map((v) => [v.key, items.filter(v.test).length]));
  const shown = items
    .filter(view.test)
    .map((i) => ({ ...i, disc: discountOf(i) }))
    .sort((a, b) =>
      sort.key === "discount"
        ? b.disc.pct - a.disc.pct || String(b.flagged_at).localeCompare(String(a.flagged_at))
        : String(b.flagged_at).localeCompare(String(a.flagged_at))
    );

  const tiles = [
    { label: "New to post", value: data?.new_count ?? "—" },
    { label: "Items tracked", value: data?.tracked ?? "—" },
    { label: "Requests left this month", value: run?.quota_remaining ?? "—" },
    { label: "Seen in last run", value: run?.products_seen ?? "—" },
  ];

  return (
    <div className="wrap adm">
      <div className="adm-head">
        <div>
          <p className="eyebrow">Admin · private, not on the website</p>
          <h1>Amazon watch</h1>
        </div>
        <div className="adm-meta">
          <div>Last run: <strong>{when(run?.ran_at) || "never"}</strong></div>
          {run?.searches?.length ? <div>Searched: {run.searches.join(", ")}</div> : null}
          <div className="adm-tz">Times are Eastern</div>
          <div><Link prefetch={false} href="/admin">← Deals &amp; posting status</Link></div>
        </div>
      </div>

      {error ? <p className="notice">{error}</p> : null}
      {run?.error ? <p className="notice">Last run reported: {run.error}</p> : null}

      <div className="adm-tiles">
        {tiles.map((t) => (
          <div key={t.label} className="adm-tile">
            <div className="adm-tile-num">{t.value}</div>
            <div className="adm-tile-label">{t.label}</div>
          </div>
        ))}
      </div>

      <p className="amz-rule">
        Post in your own words with <code>amazon_poster.py</code>. Leave out prices, percentages and
        Amazon&apos;s title. The prices here are for you only.
      </p>

      <nav className="chips" aria-label="Filter">
        {VIEWS.map((v) => (
          <Link
            prefetch={false}
            key={v.key}
            href={href(v.key, sort.key)}
            className={`chip${v.key === view.key ? " active" : ""}`}
            scroll={false}
          >
            {v.label}
            <span className="count">{counts[v.key]}</span>
          </Link>
        ))}
      </nav>

      <div className="amz-sort" role="group" aria-label="Sort">
        <span className="adm-sub">Sort:</span>
        {SORTS.map((x) => (
          <Link
            prefetch={false}
            key={x.key}
            href={href(view.key, x.key)}
            className={`amz-sort-btn${x.key === sort.key ? " active" : ""}`}
            scroll={false}
          >
            {x.label}
          </Link>
        ))}
      </div>

      <ol className="amz-list">
        {shown.map((i) => {
          const st = stateOf(i);
          const link = i.affiliate_url || i.product_url;
          const cmd = `py amazon_poster.py --dry-run --item "YOUR WORDS | ${link}"`;
          return (
            <li key={i.asin} className={`amz-item${st !== "new" ? " amz-done" : ""}`}>
              <div className="amz-img">
                {i.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image_url} alt="" loading="lazy" referrerPolicy="no-referrer" />
                ) : null}
              </div>
              <div className="amz-body">
                <div className="amz-top">
                  <span className={`adm-badge ${i.flag === "drop" ? "adm-posted" : "adm-ready"}`}>
                    {i.flag === "drop" ? "price drop" : "Amazon markdown"}
                  </span>
                  {st !== "new" ? <span className="adm-badge adm-none">{st}</span> : null}
                  <span className="adm-sub">
                    {i.search_name} · flagged {when(i.flagged_at)} · {i.asin}
                  </span>
                </div>
                <a className="amz-title" href={i.product_url} target="_blank" rel="noopener nofollow noreferrer">
                  {i.title}
                </a>
                <Popularity i={i} />
                <p className="amz-reason">{i.flag_reason}</p>
                {!i.affiliate_url ? (
                  <p className="kit-hint kit-over">No tag on this link: set AMAZON_PARTNER_TAG for amazon_watch.py.</p>
                ) : null}
                {st === "new" ? (
                  <div className="amz-copy">
                    <CopyBox label="Post it (preview first)" text={cmd} rows={2} showCount={false} />
                    <CopyBox
                      label="Not posting it"
                      text={`py amazon_watch.py --dismiss ${i.asin}`}
                      rows={2}
                      showCount={false}
                    />
                  </div>
                ) : null}
              </div>
              <div className="amz-price">
                {i.disc.pct >= 1 ? (
                  <div className="amz-pct" title={`${Math.round(i.disc.pct)}% ${i.disc.basis}`}>
                    −{Math.round(i.disc.pct)}%<span>{i.disc.basis}</span>
                  </div>
                ) : null}
                <div className="adm-num">{money(Number(i.price_current))}</div>
                {i.list_price ? (
                  <div className="adm-sub adm-num">
                    list <s>{money(Number(i.list_price))}</s>
                  </div>
                ) : null}
                <Spark history={i.history} />
                <div className="adm-sub">{i.checks} check{i.checks === 1 ? "" : "s"}</div>
              </div>
            </li>
          );
        })}
        {shown.length === 0 && !error ? <li className="empty">Nothing in this view.</li> : null}
      </ol>

      <p className="adm-foot">
        Filled by <code>amazon_watch.py</code>. &ldquo;Price drop&rdquo; = our own recorded price fell
        15%+ to a new 30-day low. &ldquo;Amazon markdown&rdquo; = Amazon shows 25%+ off and the item is
        popular. Items you post with <code>amazon_poster.py</code> move to &ldquo;Posted&rdquo; on the next
        watch run.
      </p>
    </div>
  );
}
