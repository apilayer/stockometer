"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ScreenerRow } from "@/app/screener/page";
import { formatCompact, formatPercent, formatPlainPrice } from "@/lib/format";
import { TickerIcon } from "@/components/ticker-icon";
import { readWatchlist, writeWatchlist } from "@/components/watchlist-store";

export function ScreenerTable({ rows }: { rows: ScreenerRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const router = useRouter();

  const allSelected = rows.length > 0 && selected.size === rows.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.symbol)));
    }
  };

  const toggle = (symbol: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });
  };

  const compareSelected = () => {
    if (selected.size < 2) return;
    const symbols = Array.from(selected).slice(0, 6);
    router.push(`/compare/${symbols.join("-vs-")}`);
  };

  const addSelectedToWatchlist = () => {
    const current = readWatchlist();
    const merged = Array.from(new Set([...current, ...selected]));
    writeWatchlist(merged);
    setSelected(new Set());
  };

  return (
    <div className="space-y-3">
      {/* Action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-(--color-brand)/30 bg-(--color-brand)/10 px-4 py-2.5 animate-fade-in">
          <span className="text-sm font-medium text-(--color-brand)">
            {selected.size} selected
          </span>
          <div className="h-4 w-px bg-(--color-border)" />
          <button
            onClick={compareSelected}
            disabled={selected.size < 2}
            className="rounded-lg bg-(--color-brand) px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-(--color-brand-hover) disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Compare {selected.size >= 2 ? `(${selected.size})` : ""}
          </button>
          <button
            onClick={addSelectedToWatchlist}
            className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs font-semibold text-(--color-text) transition-colors hover:bg-(--color-surface-2)"
          >
            + Watchlist
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-(--color-text-muted) hover:text-(--color-down)"
          >
            Clear
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-(--color-border) bg-(--color-surface) scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-(--color-text-muted)">
            <tr className="border-b border-(--color-border)">
              <th className="px-3 py-3 text-left font-normal w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="size-3.5 accent-(--color-brand) rounded cursor-pointer"
                />
              </th>
              <th className="px-3 py-3 text-left font-normal">Ticker</th>
              <th className="px-3 py-3 text-left font-normal">Sector</th>
              <th className="px-3 py-3 text-right font-normal">Price</th>
              <th className="px-3 py-3 text-right font-normal">Change</th>
              <th className="px-3 py-3 text-right font-normal">Day Range</th>
              <th className="px-3 py-3 text-right font-normal">Volume</th>
              <th className="px-3 py-3 text-right font-normal">Exchange</th>
              <th className="px-3 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border)/60">
            {rows.map((r) => {
              const isSelected = selected.has(r.symbol);
              const positive = r.change >= 0;
              const rangePct =
                r.high === r.low
                  ? 50
                  : ((r.close - r.low) / (r.high - r.low)) * 100;

              return (
                <tr
                  key={r.symbol}
                  className={`transition-colors hover:bg-(--color-surface-2) ${
                    isSelected ? "bg-(--color-brand)/5" : ""
                  }`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(r.symbol)}
                      className="size-3.5 accent-(--color-brand) rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/stock/${r.symbol}`}
                      className="flex items-center gap-3"
                    >
                      <TickerIcon symbol={r.symbol} size={28} />
                      <div>
                        <div className="font-semibold">{r.symbol}</div>
                        <div className="text-xs text-(--color-text-muted) truncate max-w-[150px]">
                          {r.name}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    {r.sector && (
                      <span className="inline-flex rounded-full bg-(--color-surface-2) px-2 py-0.5 text-[11px] text-(--color-text-muted)">
                        {r.sector}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right tabular font-medium">
                    ${formatPlainPrice(r.close)}
                  </td>
                  <td
                    className={`px-3 py-3 text-right tabular font-semibold ${
                      positive ? "text-(--color-up)" : "text-(--color-down)"
                    }`}
                  >
                    {formatPercent(r.change)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex w-28 items-center gap-1.5 text-[11px] text-(--color-text-muted) tabular">
                        <span>${formatPlainPrice(r.low)}</span>
                        <div className="relative h-1 flex-1 rounded-full bg-(--color-border)">
                          <div
                            className="absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-(--color-brand)"
                            style={{ left: `calc(${rangePct}% - 4px)` }}
                          />
                        </div>
                        <span>${formatPlainPrice(r.high)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular text-(--color-text-muted)">
                    {formatCompact(r.volume)}
                  </td>
                  <td className="px-3 py-3 text-right text-xs text-(--color-text-muted)">
                    {r.exchange}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/stock/${r.symbol}`}
                        className="rounded-md bg-(--color-brand) px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-(--color-brand-hover)"
                      >
                        Chart
                      </Link>
                      <Link
                        href={`/compare/${r.symbol}`}
                        className="rounded-md border border-(--color-border) px-2.5 py-1 text-[11px] font-medium text-(--color-text) transition-colors hover:border-(--color-brand) hover:text-(--color-brand)"
                      >
                        Compare
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected.size === 0 && (
        <p className="text-center text-xs text-(--color-text-dim)">
          Select stocks with checkboxes to compare or add to watchlist in bulk.
        </p>
      )}
    </div>
  );
}
