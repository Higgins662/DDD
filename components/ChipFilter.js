"use client";

// Category chips that filter the deal list in the browser. The cards are all
// in the page already; picking chips only hides the others with a <style>
// rule, so no new page is requested from the server. (Chip links used to be
// /?cat=a,b,c addresses, and bots crawled millions of combinations, each one
// rebuilding the page on Vercel.) The selection is kept in the address after
// a "#" (/#cat=a,b), which browsers never send to the server, so a filtered
// view can still be bookmarked or shared.
import { useEffect, useState } from "react";

const HASH = "#cat=";

function readHash() {
  if (typeof window === "undefined") return null;
  const h = window.location.hash;
  if (!h.startsWith(HASH)) return null;
  return decodeURIComponent(h.slice(HASH.length)).split(",").map((s) => s.trim()).filter(Boolean);
}

// Slugs are a-z, 0-9 and dashes, but quote them safely anyway.
const q = (s) => JSON.stringify(String(s));

export default function ChipFilter({ categories, initial = [], feedId }) {
  const known = new Set(categories.map((c) => c.slug));
  const clean = (list) => [...new Set(list.filter((s) => known.has(s)))].sort();
  const [selected, setSelected] = useState(() => clean(initial));
  const [ready, setReady] = useState(false);

  // A shared /#cat=... link (or the back-compat redirect from /?cat=...).
  useEffect(() => {
    const fromHash = readHash();
    if (fromHash) setSelected(clean(fromHash));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the address in step so the view can be bookmarked. On a category
  // page an empty selection is written as "#cat=" (= all deals), otherwise
  // reloading would bring the page's own category back.
  useEffect(() => {
    if (!ready) return;
    const base = window.location.pathname + window.location.search;
    const wantsHash = selected.length || initial.length;
    const next = wantsHash ? `${base}${HASH}${selected.join(",")}` : base;
    if (next !== base + window.location.hash) window.history.replaceState(window.history.state, "", next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, ready]);

  const toggle = (slug) =>
    setSelected((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug].sort()));

  const picked = categories.filter((c) => selected.includes(c.slug));
  const shown = picked.reduce((n, c) => n + c.count, 0);
  const anyLive = picked.some((c) => c.live > 0);
  const anyEnded = picked.some((c) => c.ended > 0);

  let css = "";
  if (selected.length) {
    const scope = `#${feedId}`;
    css += `${scope} [data-cat]${selected.map((s) => `:not([data-cat=${q(s)}])`).join("")}{display:none}`;
    if (!anyLive) css += `${scope} [data-sec="live"]{display:none}`;
    if (!anyEnded) css += `${scope} [data-sec="ended"]{display:none}`;
  }

  return (
    <>
      {css ? <style>{css}</style> : null}
      <nav className="chips" aria-label="Filter by category (select any number)">
        <button
          type="button"
          className={`chip${selected.length ? "" : " active"}`}
          aria-pressed={!selected.length}
          onClick={() => setSelected([])}
        >
          All deals
        </button>
        {categories.map((c) => {
          const on = selected.includes(c.slug);
          return (
            <button
              type="button"
              key={c.slug}
              className={`chip${on ? " active" : ""}`}
              aria-pressed={on}
              aria-label={`${c.label}, ${c.count} deal${c.count === 1 ? "" : "s"}`}
              onClick={() => toggle(c.slug)}
            >
              {on ? <span className="chip-check" aria-hidden="true">✓</span> : null}
              {c.label}
              <span className="count">{c.count}</span>
            </button>
          );
        })}
      </nav>

      {selected.length > 0 && (
        <p className="filter-summary" aria-live="polite">
          Showing {shown} deal{shown === 1 ? "" : "s"} in {selected.length}{" "}
          {selected.length === 1 ? "category" : "categories"} ·{" "}
          <button type="button" className="linklike" onClick={() => setSelected([])}>
            Clear filter
          </button>
        </p>
      )}
    </>
  );
}
