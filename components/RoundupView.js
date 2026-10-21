import Link from "next/link";
import { money, storeName } from "../lib/data";
import { facts, historyNote, shortTitle } from "../lib/roundup";
import FollowFacebook from "./FollowFacebook";

function RoundupItem({ d, n }) {
  const store = storeName(d.source);
  const note = historyNote(d, n - 1);
  return (
    <li className="ru-item">
      <div className="ru-rank" aria-hidden="true">{String(n).padStart(2, "0")}</div>
      <Link href={`/deal/${d.id}`} className="ru-img" tabIndex={-1} aria-hidden="true">
        {d.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={d.image} alt="" loading="lazy" />
        ) : null}
      </Link>
      <div className="ru-body">
        <div className="ru-store">{store}</div>
        <h3 className="ru-title">
          <Link href={`/deal/${d.id}`}>{shortTitle(d.title)}</Link>
        </h3>
        <div className="ru-prices">
          <span className="price-now">{money(d.priceNow)}</span>
          {d.previous ? <span className="price-was">{money(d.previous)}</span> : null}
        </div>
        <ul className="ru-facts">
          {facts(d).map((f) => (
            <li key={f.kind} className={`ru-fact ru-fact-${f.kind}`}>{f.text}</li>
          ))}
        </ul>
        {note ? <p className="ru-note">{note}</p> : null}
        {d.caption ? (
          <blockquote className="ru-take">
            <span className="ru-take-label">Dad's take</span>
            {d.caption}
          </blockquote>
        ) : null}
        <div className="ru-actions">
          <a className="ru-cta" href={d.url} target="_blank" rel="sponsored nofollow noopener">
            See it on {store} →
          </a>
          <Link href={`/deal/${d.id}`} className="ru-link">Price history</Link>
        </div>
      </div>
    </li>
  );
}

export default function RoundupView({ r, otherLink }) {
  let n = 0;
  return (
    <div className="wrap ru">
      <header className="ru-head">
        <p className="eyebrow">{r.eyebrow} · Field notes</p>
        <h1>{r.heading}</h1>
        {r.subheading ? <p className="ru-sub">{r.subheading}</p> : null}
        <p className="ru-intro">{r.intro}</p>
        {r.count ? (
          <dl className="ru-stats">
            <div><dt>Deals</dt><dd>{r.count}</dd></div>
            {r.best?.discountPct ? (
              <div><dt>Biggest drop</dt><dd>{Math.round(r.best.discountPct)}%</dd></div>
            ) : null}
            {r.totalSaved >= 1 ? (
              <div><dt>Total savings</dt><dd>{money(Math.round(r.totalSaved)).replace(".00", "")}</dd></div>
            ) : null}
          </dl>
        ) : null}
      </header>

      {r.sections.map((s) => (
        <section key={s.title} className="ru-section">
          <h2 className="section-title">{s.title}</h2>
          <ol className="ru-list">
            {s.items.map((d) => (
              <RoundupItem key={d.id} d={d} n={++n} />
            ))}
          </ol>
        </section>
      ))}

      <FollowFacebook variant="card" where="roundup" />

      <nav className="ru-nav" aria-label="More roundups">
        <Link href={r.prev}>← {r.kind === "daily" ? "Previous day" : "Previous week"}</Link>
        <Link href="/roundups">All roundups</Link>
        {otherLink ? <Link href={otherLink.href}>{otherLink.label}</Link> : null}
        {r.next ? <Link href={r.next}>{r.kind === "daily" ? "Next day" : "Next week"} →</Link> : <span />}
      </nav>

      <p className="ru-disclose">
        Affiliate links: DropDadDeals earns a commission when you buy, at no extra cost to you.
        Prices change often, and the price at checkout is the one that applies.{" "}
        <Link href="/disclosure">Learn more</Link>.
      </p>
    </div>
  );
}
