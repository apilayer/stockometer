"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { type EodRecord } from "@/lib/marketstack";
import {
  STOCKS_BY_SYMBOL,
  SECTORS,
  type Sector,
  type StockMeta,
} from "@/lib/stocks";
import { changePercent, formatPlainPrice, formatPercent } from "@/lib/format";
import { TickerIcon } from "@/components/ticker-icon";

type SidebarItem = {
  symbol: string;
  name: string;
  sector: Sector;
  close: number;
  change: number;
  domain: string;
};

export function StockSidebar({
  records,
  currentSymbol,
}: {
  records: EodRecord[];
  currentSymbol: string;
}) {
  const [activeTab, setActiveTab] = useState<"all" | Sector>("all");
  const [search, setSearch] = useState("");

  const items: SidebarItem[] = useMemo(() => {
    return records
      .filter((r) => r.symbol !== currentSymbol)
      .map((r) => {
        const meta = STOCKS_BY_SYMBOL[r.symbol];
        return {
          symbol: r.symbol,
          name: meta?.name ?? r.name,
          sector: meta?.sector ?? ("Tech" as Sector),
          close: r.close,
          change: changePercent(r.open, r.close),
          domain: meta?.domain ?? "",
        };
      })
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }, [records, currentSymbol]);

  const filtered = useMemo(() => {
    let list = items;
    if (activeTab !== "all") {
      list = list.filter((s) => s.sector === activeTab);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, activeTab, search]);

  return (
    <aside className="flex flex-col rounded-xl border border-(--color-border) bg-(--color-surface) overflow-hidden">
      {/* Header */}
      <div className="border-b border-(--color-border) p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-(--color-text-dim) mb-2">
          Other Stocks
        </h3>
        <input
          type="text"
          placeholder="Search ticker…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-1.5 text-xs text-(--color-text) outline-none placeholder:text-(--color-text-dim) focus:border-(--color-brand) transition-colors"
        />
      </div>

      {/* Sector tabs */}
      <div className="flex flex-wrap gap-1 border-b border-(--color-border) p-2">
        <TabButton
          active={activeTab === "all"}
          onClick={() => setActiveTab("all")}
        >
          All
        </TabButton>
        {SECTORS.map((s) => (
          <TabButton
            key={s}
            active={activeTab === s}
            onClick={() => setActiveTab(s)}
          >
            {s}
          </TabButton>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-thin">
        {filtered.length === 0 && (
          <div className="px-3 py-8 text-center text-xs text-(--color-text-dim)">
            No stocks found
          </div>
        )}
        {filtered.map((item) => {
          const positive = item.change >= 0;
          return (
            <Link
              key={item.symbol}
              href={`/stock/${item.symbol}`}
              className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-(--color-surface-2) border-b border-(--color-border)/40 last:border-b-0"
            >
              <TickerIcon symbol={item.symbol} size={28} domain={item.domain} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold truncate">
                    {item.symbol}
                  </span>
                  <span className="text-xs tabular text-(--color-text-muted) shrink-0">
                    ${formatPlainPrice(item.close)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2 mt-0.5">
                  <span className="text-[11px] text-(--color-text-muted) truncate">
                    {item.name}
                  </span>
                  <span
                    className={`text-[11px] tabular font-medium shrink-0 ${
                      positive ? "text-(--color-up)" : "text-(--color-down)"
                    }`}
                  >
                    {formatPercent(item.change)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
        active
          ? "bg-(--color-brand) text-white"
          : "text-(--color-text-muted) hover:bg-(--color-surface-2) hover:text-(--color-text)"
      }`}
    >
      {children}
    </button>
  );
}
