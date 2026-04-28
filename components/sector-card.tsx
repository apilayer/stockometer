import Link from "next/link";
import { changePercent, formatCompact, formatPercent, formatPlainPrice } from "@/lib/format";
import type { SectorAggregate } from "@/lib/aggregations";
import { TickerIcon } from "@/components/ticker-icon";

export function SectorCard({
  agg,
  showRecords = false,
}: {
  agg: SectorAggregate;
  showRecords?: boolean;
}) {
  const positive = agg.avgChange >= 0;
  const tone = positive ? "text-(--color-up)" : "text-(--color-down)";

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) overflow-hidden">
      <div className="flex items-center justify-between gap-4 p-5">
        <div>
          <div className="text-sm text-(--color-text-muted)">Sector</div>
          <div className="text-xl font-semibold">{agg.sector}</div>
          <div className="mt-1 text-xs text-(--color-text-muted)">
            {agg.count} tickers · {formatCompact(agg.totalVolume)} volume
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-semibold tabular ${tone}`}>
            {formatPercent(agg.avgChange)}
          </div>
          <div className="mt-1 text-xs">
            <span className="text-(--color-up)">▲ {agg.advancers}</span>
            <span className="mx-1 text-(--color-text-dim)">/</span>
            <span className="text-(--color-down)">▼ {agg.decliners}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-(--color-border)">
        <div className="bg-(--color-surface) p-3">
          <div className="text-[10px] uppercase tracking-wider text-(--color-text-muted)">
            Top
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            {agg.topPerformer && (
              <>
                <span className="font-semibold">{agg.topPerformer.symbol}</span>
                <span className="text-xs text-(--color-up) tabular">
                  {formatPercent(agg.topPerformer.change)}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="bg-(--color-surface) p-3">
          <div className="text-[10px] uppercase tracking-wider text-(--color-text-muted)">
            Lagging
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            {agg.bottomPerformer && (
              <>
                <span className="font-semibold">
                  {agg.bottomPerformer.symbol}
                </span>
                <span className="text-xs text-(--color-down) tabular">
                  {formatPercent(agg.bottomPerformer.change)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {showRecords && (
        <ul className="divide-y divide-(--color-border)/60 px-2">
          {agg.records.map((r) => {
            const c = changePercent(r.open, r.close);
            return (
              <li key={r.symbol}>
                <Link
                  href={`/stock/${r.symbol}`}
                  className="flex items-center justify-between gap-3 rounded px-2 py-2 transition-colors hover:bg-(--color-surface-2)"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <TickerIcon symbol={r.symbol} size={24} />
                    <span className="font-medium text-sm">{r.symbol}</span>
                    <span className="truncate text-xs text-(--color-text-muted)">
                      {r.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 tabular text-sm">
                    <span>${formatPlainPrice(r.close)}</span>
                    <span
                      className={`min-w-16 text-right ${
                        c >= 0 ? "text-(--color-up)" : "text-(--color-down)"
                      }`}
                    >
                      {formatPercent(c)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
