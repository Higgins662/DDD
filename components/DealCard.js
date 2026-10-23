import Link from "next/link";
import { money, storeName, timeAgo } from "../lib/data";

export default function DealCard({ deal }) {
  const pct = deal.discountPct ? Math.round(deal.discountPct) : null;
  return (
    <Link prefetch={false} href={`/deal/${deal.id}`} className="card">
      <div className="card-img">
        {deal.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={deal.image} alt="" loading="lazy" />
        ) : null}
        {deal.priceRoseAfterDeal ? (
          <span className="tag muted">Price went up</span>
        ) : pct ? (
          <span className="tag">−{pct}%</span>
        ) : null}
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span>{storeName(deal.source)}</span>
          <span>{timeAgo(deal.detectedAt)}</span>
        </div>
        <h3 className="card-title">{deal.title}</h3>
        <div className="prices">
          <span className="price-now">{money(deal.priceNow)}</span>
          {deal.previous && !deal.priceRoseAfterDeal ? (
            <span className="price-was">{money(deal.previous)}</span>
          ) : null}
          {deal.isLowestTracked && !deal.priceRoseAfterDeal ? (
            <span className="badge-low">Lowest tracked</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
