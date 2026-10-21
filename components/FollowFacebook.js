import { FACEBOOK_URL } from "../lib/brand";

// The Facebook "f" mark, sized by CSS (1em by default).
export function FacebookIcon({ className = "fb-icon" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
      />
    </svg>
  );
}

// Small always-visible button in the sticky header.
export function HeaderFollow() {
  return (
    <a className="nav-follow" href={FACEBOOK_URL} target="_blank" rel="noopener" aria-label="Follow DropDadDeals on Facebook">
      <FacebookIcon />
      <span className="nav-follow-text">Follow</span>
    </a>
  );
}

// Big call-to-action block. `variant` = "banner" (home page, under the hero)
// or "card" (deal pages and roundups).
export default function FollowFacebook({ variant = "banner", where = "" }) {
  const isCard = variant === "card";
  return (
    <aside className={`follow follow-${variant}`} aria-label="Follow DropDadDeals on Facebook" data-where={where}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="follow-dad" src="/dropdad.webp" alt="" width="568" height="760" loading="lazy" />
      <div className="follow-copy">
        <p className="follow-kicker">Also on Facebook</p>
        <p className="follow-title">
          {isCard ? "We share a few picks a day on Facebook." : "Follow DropDadDeals on Facebook."}
        </p>
        <p className="follow-sub">
          {isCard
            ? "Not every deal gets posted there, so the full list always lives here."
            : "We post a few of each day's price drops to our Facebook Page. Not every deal makes it there, so the full list always lives here."}{" "}
          Following is free with a Facebook account, and posts include affiliate links.
        </p>
      </div>
      <a className="follow-btn" href={FACEBOOK_URL} target="_blank" rel="noopener">
        <FacebookIcon />
        Follow on Facebook
      </a>
    </aside>
  );
}
