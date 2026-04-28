"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

type SortKey =
  | "dollarVolume"
  | "change"
  | "rangePct"
  | "volume"
  | "close"
  | "symbol";

type Row = EodRecord & {
  change: number;
  dollarVolume: number;
  rangePct: number;
};

export function TradingDataTable({ records }: { records: EodRecord[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("dollarVolume");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const enriched: Row[] = useMemo(
    () =>
      records.map((r) => ({
        ...r,
        change: changePercent(r.open, r.close),
        dollarVolume: r.close * r.volume,
        rangePct: r.low ? ((r.high - r.low) / r.low) * 100 : 0,
      })),
    [records],
  );

  const sorted = useMemo(() => {
    const dirMul = sortDir === "asc" ? 1 : -1;
    return [...enriched].sort((a, b) => {
      switch (sortKey) {
        case "symbol":
          return a.symbol.localeCompare(b.symbol) * dirMul;
        case "close":
          return (a.close - b.close) * dirMul;
        case "change":
          return (a.change - b.change) * dirMul;
        case "rangePct":
          return (a.rangePct - b.rangePct) * dirMul;
        case "volume":
          return (a.volume - b.volume) * dirMul;
        case "dollarVolume":
        default:
          return (a.dollarVolume - b.dollarVolume) * dirMul;
      }
    });
  }, [enriched, sortKey, sortDir]);

  const pagination = usePagination(sorted, 25);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-(--color-border) bg-(--color-surface) scrollbar-thin">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wider text-(--color-text-muted)">
          <tr className="border-b border-(--color-border)">
            <Th
              align="left"
              onClick={() => toggleSort("symbol")}
              active={sortKey === "symbol"}
              dir={sortDir}
            >
              Ticker
            </Th>
            <Th align="right">Open</Th>
            <Th align="right">High</Th>
            <Th align="right">Low</Th>
            <Th
              align="right"
              onClick={() => toggleSort("close")}
              active={sortKey === "close"}
              dir={sortDir}
            >
              Close
            </Th>
            <Th
              align="right"
              onClick={() => toggleSort("change")}
              active={sortKey === "change"}
              dir={sortDir}
            >
              Change
            </Th>
            <Th
              align="right"
              onClick={() => toggleSort("rangePct")}
              active={sortKey === "rangePct"}
              dir={sortDir}
            >
              Range %
            </Th>
            <Th
              align="right"
              onClick={() => toggleSort("volume")}
              active={sortKey === "volume"}
              dir={sortDir}
            >
              Volume
            </Th>
            <Th
              align="right"
              onClick={() => toggleSort("dollarVolume")}
              active={sortKey === "dollarVolume"}
              dir={sortDir}
            >
              $ Volume
            </Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-(--color-border)/60">
          {pagination.visible.map((r) => {
            const positive = r.change >= 0;
            const meta = STOCKS_BY_SYMBOL[r.symbol];
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
                    <TickerIcon symbol={r.symbol} size={26} />
                    <div className="min-w-0">
                      <div className="font-semibold">{r.symbol}</div>
                      <div className="truncate text-xs text-(--color-text-muted)">
                        {meta?.name ?? r.name}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right tabular text-(--color-text-muted)">
                  ${formatPlainPrice(r.open)}
                </td>
                <td className="px-4 py-3 text-right tabular text-(--color-up)">
                  ${formatPlainPrice(r.high)}
                </td>
                <td className="px-4 py-3 text-right tabular text-(--color-down)">
                  ${formatPlainPrice(r.low)}
                </td>
                <td className="px-4 py-3 text-right tabular font-medium">
                  ${formatPlainPrice(r.close)}
                </td>
                <td
                  className={`px-4 py-3 text-right tabular font-medium ${
                    positive ? "text-(--color-up)" : "text-(--color-down)"
                  }`}
                >
                  {formatPercent(r.change)}
                </td>
                <td className="px-4 py-3 text-right tabular text-(--color-text-muted)">
                  {r.rangePct.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right tabular text-(--color-text-muted)">
                  {formatCompact(r.volume)}
                </td>
                <td className="px-4 py-3 text-right tabular">
                  ${formatCompact(r.dollarVolume)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination {...pagination} />
    </div>
  );
}

function Th({
  children,
  align,
  onClick,
  active,
  dir,
}: {
  children: React.ReactNode;
  align: "left" | "right";
  onClick?: () => void;
  active?: boolean;
  dir?: "asc" | "desc";
}) {
  const arrow = active ? (dir === "asc" ? " ▲" : " ▼") : "";
  return (
    <th
      className={`${align === "left" ? "text-left" : "text-right"} px-4 py-3 font-normal ${
        onClick ? "cursor-pointer select-none hover:text-(--color-text)" : ""
      } ${active ? "text-(--color-text)" : ""}`}
      onClick={onClick}
    >
      {children}
      {arrow}
    </th>
  );
}
