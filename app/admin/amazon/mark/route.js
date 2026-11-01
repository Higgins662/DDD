import { NextResponse } from "next/server";
import { markAmazonPosted, passwordFromAuthHeader } from "../../../../lib/admin";

export const dynamic = "force-dynamic";

const json = (body, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });

// POST /admin/amazon/mark  { asin, posted }  -> { asin, posted_at }
// The /admin middleware already asked for the password; the database function checks it
// again. Only same-site JSON requests are accepted, so another site can't post a form here
// using the browser's saved admin password.
export async function POST(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!origin || new URL(origin).host !== host) return json({ error: "bad origin" }, 403);
  if (!(request.headers.get("content-type") || "").includes("application/json")) {
    return json({ error: "expected JSON" }, 415);
  }
  const password = passwordFromAuthHeader(request.headers.get("authorization"));
  if (!password) return json({ error: "unauthorized" }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad JSON" }, 400);
  }
  const asin = String(body?.asin || "").toUpperCase();
  if (!/^[A-Z0-9]{10}$/.test(asin) || typeof body?.posted !== "boolean") {
    return json({ error: "bad request" }, 400);
  }
  try {
    const row = await markAmazonPosted(password, asin, body.posted);
    return json(row);
  } catch (e) {
    const msg = String(e?.message || "");
    if (msg.includes("unauthorized")) return json({ error: "unauthorized" }, 401);
    if (msg.includes("not found")) return json({ error: "not found" }, 404);
    return json({ error: "database error" }, 502);
  }
}
