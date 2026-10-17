import { getDeals } from "../../../../lib/data";
import { buildDaily, isDayKey, latestDailyKey } from "../../../../lib/roundup";
import { roundupImage, ogSize } from "../../../../lib/roundupImage";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "DropDadDeals daily price drops";

export default async function Image({ params }) {
  const { date } = await params;
  const deals = await getDeals();
  const key = isDayKey(date) ? date : latestDailyKey(deals);
  return roundupImage(buildDaily(deals, key));
}
