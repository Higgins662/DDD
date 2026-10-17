import { notFound, redirect } from "next/navigation";
import RoundupView from "../../../../components/RoundupView";
import { getDeals } from "../../../../lib/data";
import { buildDaily, isDayKey, latestDailyKey, todayKey, weekKey, shortTitle } from "../../../../lib/roundup";

export const dynamic = "force-dynamic";

async function load(date) {
  if (date === "latest" || date === "today") redirect(`/roundup/daily/${latestDailyKey(await getDeals())}`);
  if (!isDayKey(date) || date > todayKey() || date < "2026-10-01") notFound();
  return buildDaily(await getDeals(), date);
}

export async function generateMetadata({ params }) {
  const { date } = await params;
  if (!isDayKey(date)) return {};
  const r = await load(date);
  const desc = r.best
    ? `${r.intro} Top pick: ${shortTitle(r.best.title)}.`
    : r.intro;
  return {
    title: r.title,
    description: desc,
    alternates: { canonical: `/roundup/daily/${date}` },
    openGraph: { title: `${r.title} | DropDadDeals`, description: desc, type: "article" },
    robots: r.count ? undefined : { index: false, follow: true },
  };
}

export default async function DailyRoundup({ params }) {
  const { date } = await params;
  const r = await load(date);
  return (
    <RoundupView
      r={r}
      otherLink={{ href: `/roundup/weekly/${weekKey(date)}`, label: "This week's roundup" }}
    />
  );
}
