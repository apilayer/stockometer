import Link from "next/link";
import { fetchLatestEod, type EodRecord } from "@/lib/marketstack";
import { TRACKED_SYMBOLS, STOCKS_BY_SYMBOL } from "@/lib/stocks";
import { changePercent, formatPlainPrice, formatPercent } from "@/lib/format";

export async function TickerMarquee() {
  let records: EodRecord[] = [];
  try {
    records = await fetchLatestEod(TRACKED_SYMBOLS);
  } catch {
    return null;
  }

  if (records.length === 0) return null;

  const items = records.map((r) => {
    const change = changePercent(r.open, r.close);
    const meta = STOCKS_BY_SYMBOL[r.symbol];
    return { symbol: r.symbol, name: meta?.name ?? r.name, close: r.close, change };
  });

  // Double the items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-b border-(--color-border) bg-(--color-surface)">
      <div className="marquee-track flex w-max gap-6 py-1.5 px-4">
        {doubled.map((item, i) => (
          <Link
            key={`${item.symbol}-${i}`}
            href={`/stock/${item.symbol}`}
            className="group flex shrink-0 items-center gap-2 text-xs transition-opacity hover:opacity-80"
          >
            <span className="font-semibold text-(--color-text)">
              {item.symbol}
            </span>
            <span className="tabular text-(--color-text-muted)">
              ${formatPlainPrice(item.close)}
            </span>
            <span
              className={`tabular font-medium ${
                item.change >= 0 ? "text-(--color-up)" : "text-(--color-down)"
              }`}
            >
              {formatPercent(item.change)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
