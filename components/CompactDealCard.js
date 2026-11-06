import Link from "next/link";
import { money, storeName } from "../lib/data";

// Small horizontal deal card (photo on the left, like the admin Amazon watch
// rows) so many more fit on a screen. Used by the Black Friday page.
export default function CompactDealCard({ deal }) {
  const pct = deal.discountPct ? Math.round(deal.discountPct) : null;
  return (
    <Link prefetch={false} href={`/deal/${deal.id}`} className="mini">
      <div className="mini-img">
        {deal.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={deal.image} alt="" loading="lazy" />
        ) : null}
      </div>
      <div className="mini-body">
        <div className="mini-store">{storeName(deal.source)}</div>
        <h3 className="mini-title">{deal.title}</h3>
        <div className="mini-prices">
          <span className="mini-now">{money(deal.priceNow)}</span>
          {deal.previous ? <span className="mini-was">{money(deal.previous)}</span> : null}
        </div>
      </div>
      {pct ? <span className="mini-pct">−{pct}%</span> : null}
    </Link>
  );
}
