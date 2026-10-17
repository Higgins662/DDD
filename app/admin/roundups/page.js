import Link from "next/link";
import CopyBox from "../../../components/CopyBox";
import { getDeals } from "../../../lib/data";
import {
  buildDaily, buildWeekly, facebookPost, groupPost, isDayKey, isWeekKey, latestDailyKey,
  newsletter, shortDay, smsText, todayKey, weekKey, weekLabel,
} from "../../../lib/roundup";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · roundup share kit", robots: { index: false, follow: false } };

function Kit({ r }) {
  const nl = newsletter(r);
  return (
    <section className="kit">
      <div className="kit-head">
        <div>
          <p className="eyebrow">{r.eyebrow}</p>
          <h2>{r.kind === "daily" ? shortDay(r.key) : weekLabel(r.key)}</h2>
          <p className="adm-sub">{r.intro}</p>
        </div>
        <div className="kit-links">
          <Link href={r.url.replace(/^https?:\/\/[^/]+/, "")} target="_blank">Open page ↗</Link>
          <a href={`${r.url.replace(/^https?:\/\/[^/]+/, "")}/opengraph-image`} target="_blank" rel="noopener">
            Preview image ↗
          </a>
        </div>
      </div>
      <div className="kit-grid">
        <CopyBox
          label="Facebook Page post"
          text={facebookPost(r)}
          rows={14}
          hint="One link only. Facebook limits and down-ranks posts with several links. The link preview shows the roundup card."
        />
        <CopyBox
          label="Facebook Group post"
          text={groupPost(r)}
          rows={14}
          hint="Check each group's rules first. Many only allow deal posts on certain days, or ask for the link in a comment."
        />
        <CopyBox
          label="SMS"
          text={smsText(r)}
          rows={4}
          limit={160}
          hint="Plain characters only, so it stays one 160-character message. Only text people who opted in."
        />
        <CopyBox label="Email subject" text={nl.subject} rows={2} />
        <CopyBox label="Email preview text" text={nl.preheader} rows={2} />
        <CopyBox label="Email body (plain text)" text={nl.body} rows={18} />
      </div>
    </section>
  );
}

export default async function RoundupKit({ searchParams }) {
  const { day, week } = await searchParams;
  const deals = await getDeals();
  const dk = isDayKey(day) && day <= todayKey() ? day : latestDailyKey(deals);
  const wk = isWeekKey(week) ? week : weekKey(todayKey());
  const daily = buildDaily(deals, dk);
  const weekly = buildWeekly(deals, wk);

  return (
    <div className="wrap adm">
      <div className="adm-head">
        <div>
          <p className="eyebrow">Admin · not linked anywhere</p>
          <h1>Roundup share kit</h1>
        </div>
        <div className="adm-meta">
          <Link href="/admin">← Deal status</Link>
        </div>
      </div>
      <p className="adm-sub">
        Ready-to-paste text for the latest daily and weekly roundups. Pick another day with{" "}
        <code>?day=2026-10-16</code> or week with <code>?week=2026-W42</code>.
      </p>
      <Kit r={daily} />
      <Kit r={weekly} />
    </div>
  );
}
