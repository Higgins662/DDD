// Database access. The site reads from Neon when DATABASE_URL is set (a
// read-only login that can see only the two public views and run the two
// password-checked admin functions). Without it, it falls back to Supabase's
// REST API, so removing DATABASE_URL in Vercel and redeploying switches back.
import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL || "";
export const usingNeon = Boolean(DATABASE_URL);

let sqlClient = null;
function sql() {
  if (!sqlClient) sqlClient = neon(DATABASE_URL);
  return sqlClient;
}

// Run one statement whose single column is a JSON value (json_agg / a function
// result) and return that value. Rows come back shaped exactly like Supabase's
// REST API (ISO timestamps, numbers as JSON numbers), so the rest of the site
// doesn't care which database answered.
export async function neonJson(text, params = []) {
  const rows = await sql().query(text, params);
  const first = rows[0];
  if (!first) return null;
  return Object.values(first)[0];
}
