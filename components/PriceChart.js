import { money } from "../lib/data";

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });

// A small server-rendered step chart of tracked prices. No client JS needed.
export default function PriceChart({ points }) {
  if (!points || points.length < 2) return null;

  const W = 560, H = 200, padL = 58, padR = 14, padT = 12, padB = 28;
  const prices = points.map((p) => p.price);
  let min = Math.min(...prices), max = Math.max(...prices);
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  min = Math.max(0, min - span * 0.15);
  max = max + span * 0.15;

  const t0 = new Date(points[0].at).getTime();
  const t1 = Math.max(new Date(points[points.length - 1].at).getTime(), t0 + 1);
  const x = (iso) => padL + ((new Date(iso).getTime() - t0) / (t1 - t0)) * (W - padL - padR);
  const y = (v) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);

  // Step path: price holds until the next check.
  let d = `M ${x(points[0].at)} ${y(points[0].price)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` H ${x(points[i].at)} V ${y(points[i].price)}`;
  }

  const ticks = [min + (max - min) * 0.1, (min + max) / 2, max - (max - min) * 0.1];

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Price history chart">
        {ticks.map((t, i) => (
          <g key={i}>
            <line className="grid-line" x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} />
            <text className="axis-label" x={padL - 8} y={y(t) + 4} textAnchor="end">
              {money(t).replace(/\.\d\d$/, "")}
            </text>
          </g>
        ))}
        <path className="line" d={d} />
        {points.map((p, i) => (
          <circle key={i} className="dot" cx={x(p.at)} cy={y(p.price)} r="4">
            <title>{`${fmtDate(p.at)}: ${money(p.price)}`}</title>
          </circle>
        ))}
        <text className="axis-label" x={padL} y={H - 6} textAnchor="start">{fmtDate(points[0].at)}</text>
        <text className="axis-label" x={W - padR} y={H - 6} textAnchor="end">
          {fmtDate(points[points.length - 1].at)}
        </text>
      </svg>
    </div>
  );
}

export function HistoryList({ points }) {
  if (!points || !points.length) return null;
  const rows = [...points].reverse().slice(0, 8);
  return (
    <ul className="history-list">
      {rows.map((p, i) => (
        <li key={i}>
          <span>{new Date(p.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" })}</span>
          <span>{money(p.price)}</span>
        </li>
      ))}
    </ul>
  );
}
