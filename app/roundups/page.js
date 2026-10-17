import Link from "next/link";
import { getDeals, money } from "../../lib/data";
import {
  addDays, buildDaily, buildWeekly, nickname, shortDay, todayKey, weekKey, weekLabel, weekDays,
} from "../../lib/roundup";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Roundups",
  description: "Daily and weekly roundups of real price drops, checked against our own price history.",
  alternates: { canonical: "/roundups" },
};

export default async function Roundups() {
  const deals = await getDeals();
  const today = todayKey();
  const days = Array.from({ length: 7 }, (_, i) => buildDaily(deals, addDays(today, -i))).filter(
    (r, i) => r.freshCount || i === 0
  );
  const thisWeek = weekKey(today);
  const weeks = [];
  for (let wk = thisWeek, i = 0; i < 4; i++) {
    const r = buildWeekly(deals, wk);
    if (r.count || i === 0) weeks.push(r);
    wk = weekKey(addDays(weekDays(wk)[0], -1));
  }

  return (
    <div className="wrap ru">
      <header className="ru-head">
        <p className="eyebrow">Roundups · Field notes</p>
        <h1>Roundups</h1>
        <p className="ru-intro">
          The day's new price drops and the week's best, in one list. Every deal is checked against
          our own price history before it makes the cut.
        </p>
      </header>

      <section className="ru-section">
        <h2 className="section-title">This week</h2>
        <div className="ru-index">
          {weeks.slice(0, 1).map((r) => (
            <Link key={r.key} href={`/roundup/weekly/${r.key}`} className="ru-index-card ru-index-feature">
              <span className="ru-index-kicker">Weekly roundup · {weekLabel(r.key)}</span>
              <span className="ru-index-title">{r.count ? `Top ${r.count} of the week` : "Building up…"}</span>
              <span className="ru-index-sub">
                {r.best ? `Led by the ${nickname(r.best.title)} at ${money(r.best.priceNow)}` : r.intro}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="ru-section">
        <h2 className="section-title">Daily drops</h2>
        <div className="ru-index">
          {days.map((r) => (
            <Link key={r.key} href={`/roundup/daily/${r.key}`} className="ru-index-card">
              <span className="ru-index-kicker">{r.key === today ? "Today" : shortDay(r.key)}</span>
              <span className="ru-index-title">
                {r.freshCount ? `${r.freshCount} new drop${r.freshCount === 1 ? "" : "s"}` : "Nothing new yet"}
              </span>
              <span className="ru-index-sub">
                {r.freshBest ? `${nickname(r.freshBest.title)} · ${money(r.freshBest.priceNow)}` : "Still-live deals from this week"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {weeks.length > 1 ? (
        <section className="ru-section">
          <h2 className="section-title">Past weeks</h2>
          <div className="ru-index">
            {weeks.slice(1).map((r) => (
              <Link key={r.key} href={`/roundup/weekly/${r.key}`} className="ru-index-card">
                <span className="ru-index-kicker">{weekLabel(r.key)}</span>
                <span className="ru-index-title">Top {r.count} of the week</span>
                <span className="ru-index-sub">{r.best ? nickname(r.best.title) : ""}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
