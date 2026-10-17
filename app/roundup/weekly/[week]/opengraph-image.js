import { getDeals } from "../../../../lib/data";
import { buildWeekly, isWeekKey, todayKey, weekKey } from "../../../../lib/roundup";
import { roundupImage, ogSize } from "../../../../lib/roundupImage";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "DropDadDeals weekly roundup";

export default async function Image({ params }) {
  const { week } = await params;
  const key = isWeekKey(week) ? week : weekKey(todayKey());
  return roundupImage(buildWeekly(await getDeals(), key));
}
