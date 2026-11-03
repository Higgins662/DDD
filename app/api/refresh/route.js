// On-demand refresh. The price-tracker scripts call this after they write new
// deals, so the site shows them within a minute instead of waiting for its
// caches to run out (which lets those caches stay long and keeps Vercel and
// Neon usage low).
//
// Two calls, in this order, each a POST with
//   Authorization: Bearer <SITE_REFRESH_SECRET>
//   /api/refresh?what=data   forget the saved deal list (re-read from Neon next time)
//   /api/refresh?what=pages  drop Vercel's saved copies of every public page
// They are separate requests so the data is certainly gone before any page is
// rebuilt; otherwise a page could be rebuilt from the old list and saved again.
// The scripts' helper (site_refresh.py) makes both calls.
import { revalidateTag } from "next/cache";
import { dangerouslyDeleteByTag } from "@vercel/functions";
import { timingSafeEqual } from "node:crypto";
import { forgetDeals } from "../../../lib/data";

export const dynamic = "force-dynamic";

const TAG = "deals"; // the Data Cache tag in lib/data.js and the page tag in next.config.mjs

function allowed(request) {
  const secret = process.env.SITE_REFRESH_SECRET || "";
  if (secret.length < 24) return false; // not set up (or too short to be safe)
  const given = Buffer.from(request.headers.get("authorization") || "");
  const wanted = Buffer.from(`Bearer ${secret}`);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}

const noStore = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

export async function POST(request) {
  if (!allowed(request)) return new Response("Not allowed.\n", { status: 401, headers: noStore });
  const what = new URL(request.url).searchParams.get("what") || "data";

  if (what === "data") {
    revalidateTag(TAG);
    forgetDeals();
    return Response.json({ ok: true, cleared: "data" }, { headers: noStore });
  }
  if (what === "pages") {
    if (!process.env.VERCEL) return Response.json({ ok: true, cleared: "nothing (not on Vercel)" }, { headers: noStore });
    await dangerouslyDeleteByTag(TAG);
    return Response.json({ ok: true, cleared: "pages" }, { headers: noStore });
  }
  return Response.json({ ok: false, error: "what must be data or pages" }, { status: 400, headers: noStore });
}

export function GET() {
  return new Response("Use POST.\n", { status: 405, headers: { ...noStore, Allow: "POST" } });
}
