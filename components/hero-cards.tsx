import Link from "next/link";
import type { EodRecord } from "@/lib/marketstack";
import { changePercent, formatPercent, formatPlainPrice } from "@/lib/format";
import { TickerIcon } from "@/components/ticker-icon";

type Card = {
  title: string;
  rows: EodRecord[];
};

export function HeroCards({ rows }: { rows: EodRecord[] }) {
  const withChange = rows.map((r) => ({
    rec: r,
    change: changePercent(r.open, r.close),
  }));

  const popular = ["AAPL", "NVDA", "TSLA"];
  const hot = popular
    .map((s) => rows.find((r) => r.symbol === s))
    .filter((r): r is EodRecord => Boolean(r));

  const active = [...withChange]
    .sort((a, b) => b.rec.volume - a.rec.volume)
    .slice(3, 6)
    .map((x) => x.rec);

  const gainers = [...withChange]
    .sort((a, b) => b.change - a.change)
    .slice(0, 3)
    .map((x) => x.rec);

  const topVolume = [...withChange]
    .sort((a, b) => b.rec.volume - a.rec.volume)
    .slice(0, 3)
    .map((x) => x.rec);

  const cards: Card[] = [
    { title: "Hot", rows: hot.length ? hot : rows.slice(0, 3) },
    { title: "Active", rows: active },
    { title: "Top Gainer", rows: gainers },
    { title: "Top Volume", rows: topVolume },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <CardBlock key={c.title} card={c} />
      ))}
    </div>
  );
}

function CardBlock({ card }: { card: Card }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-(--color-text-muted)">{card.title}</span>
        <Link
          href="/"
          className="text-(--color-text-muted) transition-colors hover:text-(--color-brand)"
        >
          More ›
        </Link>
      </div>
      <ul className="divide-y divide-(--color-border)/60">
        {card.rows.map((r) => (
          <CardRow key={r.symbol} rec={r} />
        ))}
      </ul>
    </div>
  );
}

function CardRow({ rec }: { rec: EodRecord }) {
  const change = changePercent(rec.open, rec.close);
  const positive = change >= 0;
  return (
    <li>
      <Link
        href={`/stock/${rec.symbol}`}
        className="flex items-center justify-between gap-3 py-2 transition-colors hover:bg-(--color-surface-2) -mx-2 px-2 rounded"
      >
        <div className="flex items-center gap-2 min-w-0">
          <TickerIcon symbol={rec.symbol} size={26} />
          <span className="font-medium text-sm truncate">{rec.symbol}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 tabular text-sm">
          <span>${formatPlainPrice(rec.close)}</span>
          <span
            className={
              positive ? "text-(--color-up)" : "text-(--color-down)"
            }
          >
            {formatPercent(change)}
          </span>
        </div>
      </Link>
    </li>
  );
}
