// Short link for SMS: /r/d/2026-10-17 -> /roundup/daily/2026-10-17
import { NextResponse } from "next/server";
import { isDayKey } from "../../../../lib/roundup";

export async function GET(request, { params }) {
  const { date } = await params;
  const to = isDayKey(date) ? `/roundup/daily/${date}` : "/roundup/daily/latest";
  return NextResponse.redirect(new URL(`${to}?utm_source=sms&utm_medium=sms&utm_campaign=daily`, request.url), 308);
}
