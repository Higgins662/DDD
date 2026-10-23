import Link from "next/link";
import { headers } from "next/headers";
import { getAdminDeals, passwordFromAuthHeader } from "../../lib/admin";
import { money, storeName, titleCase } from "../../lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · deal status",
  robots: { index: false, follow: false, nocache: true },
};

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

const VIEWS = [
  { key: "all", label: "All items", test: () => true },
  { key: "on-site", label: "On website", test: (d) => d.on_site },
  { key: "ready", label: "Ready for X", test: (d) => d.status === "ready" },
  { key: "x-posted", label: "Posted to X", test: (d) => !!d.posted_at },
  { key: "fb-posted", label: "Posted to Facebook", test: (d) => !!d.facebook_posted_at },
  { key: "fb-not", label: "Not on Facebook", test: (d) => !d.facebook_posted_at && d.status !== "skipped" },
  { key: "skipped", label: "Skipped", test: (d) => d.status === "skipped" },
];

const isTest = (d) => (d.image_url || "").includes("example.com");

function StatusBadge({ status }) {
  return <span className={`adm-badge adm-${status || "none"}`}>{status || "—"}</span>;
}

export default async function AdminPage({ searchParams }) {
  const { view: rawView } = await searchParams;
  const view = VIEWS.find((v) => v.key === rawView) || VIEWS[0];

  // The middleware already checked the password; reuse it to load the report.
  const password = passwordFromAuthHeader((await headers()).get("authorization"));
  let deals = [];
  let error = null;
  try {
    deals = await getAdminDeals(password);
  } catch (e) {
    error = "Couldn't load deals from the database. Try refreshing.";
  }

  const counts = Object.fromEntries(VIEWS.map((v) => [v.key, deals.filter(v.test).length]));
  const shown = deals.filter(view.test);
  const lastRun = deals.reduce((m, d) => (d.detected_at > (m || "") ? d.detected_at : m), null);
  const lastCheck = deals.reduce((m, d) => (d.last_checked > (m || "") ? d.last_checked : m), null);

  const tiles = [
    { label: "Items in database", value: deals.length },
    { label: "Showing on website", value: counts["on-site"] },
    { label: "Posted to X", value: counts["x-posted"] },
    { label: "Ready for X", value: counts.ready },
    { label: "Posted to Facebook", value: counts["fb-posted"] },
    { label: "Skipped", value: counts.skipped },
  ];

  return (
    <div className="wrap adm">
      <div className="adm-head">
        <div>
          <p className="eyebrow">Admin · not linked anywhere</p>
          <h1>Deals &amp; posting status</h1>
        </div>
        <div className="adm-meta">
          <div>Newest item: <strong>{when(lastRun) || "—"}</strong></div>
          <div>Last price check: <strong>{when(lastCheck) || "—"}</strong></div>
          <div className="adm-tz">Times are Eastern</div>
          <div><Link prefetch={false} href="/admin/roundups">Roundup share kit →</Link></div>
        </div>
      </div>

      {error ? <p className="notice">{error}</p> : null}

      <div className="adm-tiles">
        {tiles.map((t) => (
          <div key={t.label} className="adm-tile">
            <div className="adm-tile-num">{t.value}</div>
            <div className="adm-tile-label">{t.label}</div>
          </div>
        ))}
      </div>

      <nav className="chips" aria-label="Filter">
        {VIEWS.map((v) => (
          <Link prefetch={false}
            key={v.key}
            href={v.key === "all" ? "/admin" : `/admin?view=${v.key}`}
            className={`chip${v.key === view.key ? " active" : ""}`}
            scroll={false}
          >
            {v.label}
            <span className="count">{counts[v.key]}</span>
          </Link>
        ))}
      </nav>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Found</th>
              <th>X</th>
              <th>Facebook</th>
              <th>Website</th>
              <th>Price checks</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((d) => {
              const pct = d.discount_pct ? Math.round(Number(d.discount_pct)) : null;
              const fbUrl = d.facebook_post_id ? `https://www.facebook.com/${d.facebook_post_id}` : null;
              return (
                <tr key={d.id} className={isTest(d) ? "adm-test" : undefined}>
                  <td className="adm-item">
                    {d.image_url && !isTest(d) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.image_url} alt="" loading="lazy" />
                    ) : (
                      <span className="adm-noimg" />
                    )}
                    <div>
                      <a href={d.product_url} target="_blank" rel="noopener nofollow">
                        {d.title || d.product_id}
                      </a>
                      <div className="adm-sub">
                        {storeName(d.source)}
                        {d.category ? ` · ${titleCase(d.category)}` : ""}
                        {isTest(d) ? " · test row" : ""}
                      </div>
                    </div>
                  </td>
                  <td className="adm-num">
                    <div>{money(d.price_current === null ? null : Number(d.price_current))}</div>
                    <div className="adm-sub">
                      {d.price_previous ? <s>{money(Number(d.price_previous))}</s> : null}
                      {pct ? ` −${pct}%` : ""}
                    </div>
                  </td>
                  <td className="adm-when">{when(d.detected_at)}</td>
                  <td>
                    <StatusBadge status={d.status} />
                    <div className="adm-sub">
                      {d.posted_at ? `Posted ${when(d.posted_at)}` : d.platform ? `Platform: ${d.platform}` : "No platform"}
                    </div>
                  </td>
                  <td>
                    {d.facebook_posted_at ? (
                      <>
                        <span className="adm-badge adm-posted">posted</span>
                        <div className="adm-sub">
                          {fbUrl ? (
                            <a href={fbUrl} target="_blank" rel="noopener">{when(d.facebook_posted_at)}</a>
                          ) : (
                            when(d.facebook_posted_at)
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="adm-badge adm-none">not posted</span>
                    )}
                  </td>
                  <td>
                    {d.on_site ? (
                      <Link prefetch={false} href={`/deal/${d.id}`} className="adm-badge adm-ready">live</Link>
                    ) : (
                      <span className="adm-badge adm-none">hidden</span>
                    )}
                  </td>
                  <td className="adm-num">
                    <div>{d.price_checks || 0}</div>
                    <div className="adm-sub">
                      {d.last_checked ? `${when(d.last_checked)} · ${money(Number(d.last_price))}` : "never"}
                    </div>
                  </td>
                </tr>
              );
            })}
            {shown.length === 0 && !error ? (
              <tr>
                <td colSpan={7} className="empty">Nothing in this view.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="adm-foot">
        Read-only. "Website" is live when the X status is ready or posted and the row isn't a test
        row; that's what decides whether a deal shows on dropdaddeals.com.
      </p>
    </div>
  );
}
