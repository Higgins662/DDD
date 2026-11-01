"use client";

import { useState } from "react";

// "Posted" checkbox for an Amazon watch item. Saves to the database through
// /admin/amazon/mark, so it holds on every device and amazon_watch.py won't flag the
// item again for REPOST_DAYS (the script's AMAZON_REPOST_DAYS, 45).
const REPOST_DAYS = 45;
const day = (d) =>
  d.toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" });

export default function PostedCheck({ asin, postedAt }) {
  const [posted, setPosted] = useState(postedAt || null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function toggle(e) {
    const want = e.target.checked;
    const before = posted;
    setPosted(want ? new Date().toISOString() : null);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/admin/amazon/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asin, posted: want }),
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setPosted(data.posted_at || null);
    } catch (err) {
      setPosted(before);
      setError(`Couldn't save (${err.message}). Try again.`);
    } finally {
      setBusy(false);
    }
  }

  const back = posted ? new Date(new Date(posted).getTime() + REPOST_DAYS * 86400000) : null;
  return (
    <div className={`amz-check${posted ? " on" : ""}`}>
      <label>
        <input type="checkbox" checked={!!posted} onChange={toggle} disabled={busy} />
        <span>{posted ? `Posted ${day(new Date(posted))}` : "I posted this"}</span>
      </label>
      {posted ? <span className="adm-sub">Off the list until {day(back)}</span> : null}
      {busy ? <span className="adm-sub">saving…</span> : null}
      {error ? <span className="adm-sub kit-over">{error}</span> : null}
    </div>
  );
}
