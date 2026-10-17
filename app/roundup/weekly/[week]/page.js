import { notFound, redirect } from "next/navigation";
import RoundupView from "../../../../components/RoundupView";
import { getDeals } from "../../../../lib/data";
import { buildWeekly, isWeekKey, todayKey, weekKey, weekDays, shortTitle } from "../../../../lib/roundup";

export const dynamic = "force-dynamic";

async function load(week) {
  if (week === "latest" || week === "this-week") redirect(`/roundup/weekly/${weekKey(todayKey())}`);
  if (!isWeekKey(week) || week > weekKey(todayKey()) || weekDays(week)[6] < "2026-10-01") notFound();
  return buildWeekly(await getDeals(), week);
}

export async function generateMetadata({ params }) {
  const { week } = await params;
  if (!isWeekKey(week)) return {};
  const r = await load(week);
  const desc = r.best ? `${r.intro} Top pick: ${shortTitle(r.best.title)}.` : r.intro;
  return {
    title: r.title,
    description: desc,
    alternates: { canonical: `/roundup/weekly/${week}` },
    openGraph: { title: `${r.title} | DropDadDeals`, description: desc, type: "article" },
    robots: r.count ? undefined : { index: false, follow: true },
  };
}

export default async function WeeklyRoundup({ params }) {
  const { week } = await params;
  const r = await load(week);
  const last = weekDays(week)[6];
  const day = last > todayKey() ? todayKey() : last;
  return <RoundupView r={r} otherLink={{ href: `/roundup/daily/${day}`, label: "Daily drops" }} />;
}
