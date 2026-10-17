// Short link for SMS: /r/w/2026-W42 -> /roundup/weekly/2026-W42
import { NextResponse } from "next/server";
import { isWeekKey } from "../../../../lib/roundup";

export async function GET(request, { params }) {
  const { week } = await params;
  const to = isWeekKey(week) ? `/roundup/weekly/${week}` : "/roundup/weekly/latest";
  return NextResponse.redirect(new URL(`${to}?utm_source=sms&utm_medium=sms&utm_campaign=weekly`, request.url), 308);
}
