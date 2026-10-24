import { AMAZON_STOREFRONT_URL } from "../lib/brand";

// Plain shopping-bag mark (not Amazon's logo).
function BagIcon() {
  return (
    <svg className="fb-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 8h14l-1.2 12.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9L5 8zm4 0V6a3 3 0 0 1 6 0v2"
      />
    </svg>
  );
}

// Card linking to the DropDadDeals Amazon storefront. Same layout as the
// Facebook block, in a quieter cream outline so the two don't compete.
// `where` is only a label for analytics/debugging.
export default function AmazonStorefront({ where = "" }) {
  return (
    <aside className="follow follow-amazon" aria-label="DropDadDeals Amazon storefront" data-where={where}>
      <div className="follow-copy">
        <p className="follow-kicker">Also on Amazon</p>
        <p className="follow-title">Shop the DropDadDeals Amazon storefront.</p>
        <p className="follow-sub">
          Our Amazon picks, all in one place. As an Amazon Associate I earn from qualifying
          purchases.
        </p>
      </div>
      <a className="follow-btn" href={AMAZON_STOREFRONT_URL} target="_blank" rel="sponsored noopener">
        <BagIcon />
        Visit the storefront
      </a>
    </aside>
  );
}
