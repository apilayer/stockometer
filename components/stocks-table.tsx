"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { EodRecord } from "@/lib/marketstack";
import {
  STOCKS_BY_SYMBOL,
  SECTORS,
  type Sector,
} from "@/lib/stocks";
import {
  changePercent,
  formatCompact,
  formatPercent,
  formatPlainPrice,
} from "@/lib/format";
import { TickerIcon } from "@/components/ticker-icon";
import { Pagination, usePagination } from "@/components/pagination";

type Row = EodRecord & { change: number; sector?: Sector };

type SortKey = "volume" | "change" | "price" | "name";

const FILTERS: ("All" | Sector)[] = ["All", ...SECTORS];

export function StocksTable({ records }: { records: EodRecord[] }) {
  const [filter, setFilter] = useState<"All" | Sector>("All");
  const [sortKey, setSortKey] = useState<SortKey>("volume");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const enriched: Row[] = useMemo(
    () =>
      records.map((r) => ({
        ...r,
        change: changePercent(r.open, r.close),
        sector: STOCKS_BY_SYMBOL[r.symbol]?.sector,
      })),
    [records],
  );

  const filtered = useMemo(() => {
    const list =
      filter === "All"
        ? enriched
        : enriched.filter((r) => r.sector === filter);

    const dirMul = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.symbol.localeCompare(b.symbol) * dirMul;
        case "price":
          return (a.close - b.close) * dirMul;
        case "change":
          return (a.change - b.change) * dirMul;
        case "volume":
        default:
          return (a.volume - b.volume) * dirMul;
      }
    });
  }, [enriched, filter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const pagination = usePagination(filtered, 25);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors ${
              filter === f
                ? "bg-(--color-surface-2) text-(--color-text) ring-1 ring-(--color-border-strong)"
                : "text-(--color-text-muted) hover:bg-(--color-surface)"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-(--color-border) bg-(--color-surface) scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="text-(--color-text-muted)">
            <tr className="border-b border-(--color-border)">
              <Th onClick={() => toggleSort("name")} active={sortKey === "name"} dir={sortDir} align="left">
                Name
              </Th>
              <Th onClick={() => toggleSort("price")} active={sortKey === "price"} dir={sortDir} align="right">
                Price
              </Th>
              <Th onClick={() => toggleSort("change")} active={sortKey === "change"} dir={sortDir} align="right">
                24h Change
              </Th>
              <Th align="right">Day Range</Th>
              <Th onClick={() => toggleSort("volume")} active={sortKey === "volume"} dir={sortDir} align="right">
                Volume
              </Th>
              <Th align="right">Exchange</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border)/60">
            {pagination.visible.map((r) => (
              <Row key={r.symbol} row={r} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-(--color-text-muted)"
                >
                  No stocks match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination {...pagination} />
      </div>
    </section>
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
      className={`${align === "left" ? "text-left" : "text-right"} px-4 py-3 font-normal text-xs uppercase tracking-wider ${
        onClick ? "cursor-pointer select-none hover:text-(--color-text)" : ""
      } ${active ? "text-(--color-text)" : ""}`}
      onClick={onClick}
    >
      {children}
      {arrow}
    </th>
  );
}

function Row({ row }: { row: Row }) {
  const positive = row.change >= 0;
  const meta = STOCKS_BY_SYMBOL[row.symbol];
  const rangePct =
    row.high === row.low ? 50 : ((row.close - row.low) / (row.high - row.low)) * 100;

  return (
    <tr className="group transition-colors hover:bg-(--color-surface-2)">
      <td className="px-4 py-3">
        <Link href={`/stock/${row.symbol}`} className="flex items-center gap-3">
          <TickerIcon symbol={row.symbol} size={28} />
          <div className="min-w-0">
            <div className="font-semibold">{row.symbol}</div>
            <div className="truncate text-xs text-(--color-text-muted)">
              {meta?.name ?? row.name}
            </div>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 text-right tabular">
        ${formatPlainPrice(row.close)}
      </td>
      <td
        className={`px-4 py-3 text-right tabular font-medium ${
          positive ? "text-(--color-up)" : "text-(--color-down)"
        }`}
      >
        {formatPercent(row.change)}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col items-end gap-1">
          <div className="flex w-32 items-center gap-2 text-xs text-(--color-text-muted) tabular">
            <span>${formatPlainPrice(row.low)}</span>
            <div className="relative h-1 flex-1 rounded-full bg-(--color-border)">
              <div
                className="absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-(--color-brand)"
                style={{ left: `calc(${rangePct}% - 4px)` }}
              />
            </div>
            <span>${formatPlainPrice(row.high)}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right tabular text-(--color-text-muted)">
        {formatCompact(row.volume)}
      </td>
      <td className="px-4 py-3 text-right text-xs text-(--color-text-muted)">
        {row.exchange_code ?? row.exchange}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/stock/${row.symbol}`}
          className="rounded-md bg-(--color-brand) px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-(--color-brand-hover)"
        >
          Details
        </Link>
      </td>
    </tr>
  );
}
