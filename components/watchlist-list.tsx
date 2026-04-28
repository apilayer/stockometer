"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { EodRecord } from "@/lib/marketstack";
import { STOCKS_BY_SYMBOL } from "@/lib/stocks";
import {
  changePercent,
  formatCompact,
  formatPercent,
  formatPlainPrice,
} from "@/lib/format";
import { TickerIcon } from "@/components/ticker-icon";
import { Pagination, usePagination } from "@/components/pagination";
import { readWatchlist, toggleWatchlist } from "@/components/watchlist-store";

export function WatchlistList({ records }: { records: EodRecord[] }) {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSymbols(readWatchlist());
    const handler = () => setSymbols(readWatchlist());
    window.addEventListener("watchlist:changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("watchlist:changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const lookup = useMemo(
    () => new Map(records.map((r) => [r.symbol, r])),
    [records],
  );
  const rows = useMemo(
    () =>
      symbols
        .map((s) => lookup.get(s))
        .filter((r): r is EodRecord => Boolean(r)),
    [symbols, lookup],
  );
  const missing = useMemo(
    () => symbols.filter((s) => !lookup.has(s)),
    [symbols, lookup],
  );

  const pagination = usePagination(rows, 25);

  if (!mounted) {
    return (
      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-8 text-center text-(--color-text-muted)">
        Loading watchlist…
      </div>
    );
  }

  if (symbols.length === 0) {
    return (
      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-8 text-center">
        <div className="text-lg font-semibold">Your watchlist is empty</div>
        <p className="mt-2 text-sm text-(--color-text-muted) max-w-md mx-auto">
          Open any{" "}
          <Link href="/stocks" className="text-(--color-brand) hover:underline">
            stock detail page
          </Link>{" "}
          and click <span className="font-semibold">☆ Add to Watchlist</span> to
          start tracking. Your list lives in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-(--color-border) bg-(--color-surface) scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-(--color-text-muted)">
            <tr className="border-b border-(--color-border)">
              <th className="px-4 py-3 text-left font-normal">Ticker</th>
              <th className="px-4 py-3 text-right font-normal">Price</th>
              <th className="px-4 py-3 text-right font-normal">Change</th>
              <th className="px-4 py-3 text-right font-normal">Volume</th>
              <th className="px-4 py-3 text-right font-normal">Exchange</th>
              <th className="px-4 py-3 text-right font-normal"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border)/60">
            {pagination.visible.map((r) => {
              const c = changePercent(r.open, r.close);
              const meta = STOCKS_BY_SYMBOL[r.symbol];
              const positive = c >= 0;
              return (
                <tr
                  key={r.symbol}
                  className="transition-colors hover:bg-(--color-surface-2)"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/stock/${r.symbol}`}
                      className="flex items-center gap-3"
                    >
                      <TickerIcon symbol={r.symbol} size={28} />
                      <div>
                        <div className="font-semibold">{r.symbol}</div>
                        <div className="text-xs text-(--color-text-muted)">
                          {meta?.name ?? r.name}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right tabular">
                    ${formatPlainPrice(r.close)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular font-medium ${
                      positive ? "text-(--color-up)" : "text-(--color-down)"
                    }`}
                  >
                    {formatPercent(c)}
                  </td>
                  <td className="px-4 py-3 text-right tabular text-(--color-text-muted)">
                    {formatCompact(r.volume)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-(--color-text-muted)">
                    {r.exchange_code ?? r.exchange}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        toggleWatchlist(r.symbol);
                      }}
                      className="text-xs text-(--color-text-muted) transition-colors hover:text-(--color-down)"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination {...pagination} />
      </div>

      {missing.length > 0 && (
        <div className="rounded-md border border-(--color-border) bg-(--color-surface) p-3 text-xs text-(--color-text-muted)">
          {missing.length} watched ticker{missing.length === 1 ? "" : "s"} not in
          the StockoMeter universe yet:{" "}
          <span className="text-(--color-text)">{missing.join(", ")}</span>.
          They&apos;re still saved locally.
        </div>
      )}
    </div>
  );
}
