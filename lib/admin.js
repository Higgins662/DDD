// Server-only helpers for the password-protected /admin page.
// The password is never stored in the site: the browser sends it with
// HTTP Basic Auth and the database checks it against a bcrypt hash
// (public.admin_check / public.admin_deals in Supabase).

import { usingNeon, neonJson } from "./db";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://dicxnfzdhhxhycfqwrrh.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_76oJmwNPCyjYyuVuy366KQ_VE8-she2";

// "Basic base64(user:password)" -> password (the username is ignored).
export function passwordFromAuthHeader(header) {
  if (!header || !header.startsWith("Basic ")) return null;
  try {
    const decoded = atob(header.slice(6).trim());
    const i = decoded.indexOf(":");
    const pw = i >= 0 ? decoded.slice(i + 1) : decoded;
    return pw.length >= 8 && pw.length <= 200 ? pw : null;
  } catch {
    return null;
  }
}

async function rpc(fn, body) {
  return fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

export async function checkAdminPassword(password) {
  if (!password) return false;
  if (usingNeon) {
    try {
      return (await neonJson("select public.admin_check($1) as ok", [password])) === true;
    } catch {
      return false;
    }
  }
  try {
    const res = await rpc("admin_check", { p_key: password });
    return res.ok && (await res.json()) === true;
  } catch {
    return false;
  }
}

export async function getAdminDeals(password) {
  if (usingNeon) {
    const rows = await neonJson(
      "select coalesce(json_agg(a), '[]'::json) from public.admin_deals($1) a",
      [password]
    );
    return rows || [];
  }
  const res = await rpc("admin_deals", { p_key: password });
  if (!res.ok) throw new Error(`admin_deals failed: ${res.status}`);
  return res.json();
}

// Private Amazon watch list (amazon_watch.py writes it; schema `amazon` in Neon,
// readable only through this password-checked function). Neon only: returns
// null when the site is on the Supabase fallback.
export async function getAdminAmazon(password) {
  if (!usingNeon) return null;
  return neonJson("select public.admin_amazon($1)", [password]);
}
