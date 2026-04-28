"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import type { EodRecord } from "@/lib/marketstack";
import { STOCKS_BY_SYMBOL, TRACKED_STOCKS } from "@/lib/stocks";
import {
  formatCompact,
  formatPercent,
  formatPlainPrice,
  changePercent,
} from "@/lib/format";
import { TickerIcon } from "@/components/ticker-icon";
import {
  readPortfolio,
  addHolding,
  removeHolding,
  type Holding,
} from "@/lib/portfolio-store";

const SECTOR_COLORS: Record<string, string> = {
  Tech: "#3b82f6",
  Finance: "#10b981",
  Healthcare: "#8b5cf6",
  Consumer: "#f59e0b",
  Energy: "#ef4444",
  Auto: "#06b6d4",
  Industrial: "#f97316",
};

export function PortfolioDashboard({ records }: { records: EodRecord[] }) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    setHoldings(readPortfolio());
  }, []);

  useEffect(() => {
    refresh();
    setMounted(true);
    const handler = () => refresh();
    window.addEventListener("portfolio:changed", handler);
    return () => window.removeEventListener("portfolio:changed", handler);
  }, [refresh]);

  const priceMap = useMemo(() => {
    const map: Record<string, EodRecord> = {};
    for (const r of records) map[r.symbol] = r;
    return map;
  }, [records]);

  const rows = useMemo(() => {
    return holdings.map((h) => {
      const rec = priceMap[h.symbol];
      const price = rec?.close ?? 0;
      const dayChange = rec ? changePercent(rec.open, rec.close) : 0;
      const marketValue = price * h.shares;
      const costBasis = h.avgCost * h.shares;
      const totalPL = marketValue - costBasis;
      const totalPLPct = costBasis > 0 ? (totalPL / costBasis) * 100 : 0;
      const dayPL = rec
        ? (rec.close - rec.open) * h.shares
        : 0;
      const sector = STOCKS_BY_SYMBOL[h.symbol]?.sector;
      return {
        ...h,
        price,
        dayChange,
        marketValue,
        costBasis,
        totalPL,
        totalPLPct,
        dayPL,
        sector,
      };
    });
  }, [holdings, priceMap]);

  const totals = useMemo(() => {
    const totalValue = rows.reduce((s, r) => s + r.marketValue, 0);
    const totalCost = rows.reduce((s, r) => s + r.costBasis, 0);
    const totalPL = totalValue - totalCost;
    const totalPLPct = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
    const dayPL = rows.reduce((s, r) => s + r.dayPL, 0);
    const dayPLPct = totalValue > 0 ? (dayPL / (totalValue - dayPL)) * 100 : 0;
    return { totalValue, totalCost, totalPL, totalPLPct, dayPL, dayPLPct };
  }, [rows]);

  // Sector allocation for donut
  const sectorAlloc = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of rows) {
      const key = r.sector ?? "Other";
      map[key] = (map[key] ?? 0) + r.marketValue;
    }
    return Object.entries(map)
      .map(([sector, value]) => ({
        sector,
        value,
        pct: totals.totalValue > 0 ? (value / totals.totalValue) * 100 : 0,
        color: SECTOR_COLORS[sector] ?? "#6b7280",
      }))
      .sort((a, b) => b.value - a.value);
  }, [rows, totals.totalValue]);

  if (!mounted) {
    return (
      <div className="grid h-64 place-items-center rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text-muted)">
        Loading portfolio…
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState />
        <div className="mx-auto max-w-sm">
          <AddHoldingForm onAdd={refresh} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Value"
          value={`$${formatPlainPrice(totals.totalValue)}`}
        />
        <SummaryCard
          label="Day P&L"
          value={`${totals.dayPL >= 0 ? "+" : ""}$${formatPlainPrice(Math.abs(totals.dayPL))}`}
          sub={formatPercent(totals.dayPLPct)}
          tone={totals.dayPL >= 0 ? "up" : "down"}
        />
        <SummaryCard
          label="Total P&L"
          value={`${totals.totalPL >= 0 ? "+" : ""}$${formatPlainPrice(Math.abs(totals.totalPL))}`}
          sub={formatPercent(totals.totalPLPct)}
          tone={totals.totalPL >= 0 ? "up" : "down"}
        />
        <SummaryCard
          label="Holdings"
          value={String(holdings.length)}
          sub={`${sectorAlloc.length} sector${sectorAlloc.length === 1 ? "" : "s"}`}
        />
      </div>

      {/* Allocation + Add Form */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Holdings Table */}
        <div className="overflow-x-auto rounded-xl border border-(--color-border) bg-(--color-surface) scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-(--color-text-muted)">
              <tr className="border-b border-(--color-border)">
                <th className="px-4 py-3 text-left font-normal">Stock</th>
                <th className="px-4 py-3 text-right font-normal">Shares</th>
                <th className="px-4 py-3 text-right font-normal">Avg Cost</th>
                <th className="px-4 py-3 text-right font-normal">Price</th>
                <th className="px-4 py-3 text-right font-normal">Mkt Value</th>
                <th className="px-4 py-3 text-right font-normal">Day P&L</th>
                <th className="px-4 py-3 text-right font-normal">Total P&L</th>
                <th className="px-4 py-3 text-right font-normal">Weight</th>
                <th className="px-4 py-3 font-normal" />
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)/60">
              {rows.map((r) => (
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
                        <div className="text-xs text-(--color-text-muted) truncate max-w-[120px]">
                          {STOCKS_BY_SYMBOL[r.symbol]?.name}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right tabular">
                    {r.shares.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right tabular text-(--color-text-muted)">
                    ${formatPlainPrice(r.avgCost)}
                  </td>
                  <td className="px-4 py-3 text-right tabular font-medium">
                    ${formatPlainPrice(r.price)}
                  </td>
                  <td className="px-4 py-3 text-right tabular font-medium">
                    ${formatPlainPrice(r.marketValue)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular font-medium ${
                      r.dayPL >= 0 ? "text-(--color-up)" : "text-(--color-down)"
                    }`}
                  >
                    {r.dayPL >= 0 ? "+" : ""}${formatPlainPrice(Math.abs(r.dayPL))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div
                      className={`tabular font-semibold ${
                        r.totalPL >= 0
                          ? "text-(--color-up)"
                          : "text-(--color-down)"
                      }`}
                    >
                      {r.totalPL >= 0 ? "+" : ""}$
                      {formatPlainPrice(Math.abs(r.totalPL))}
                    </div>
                    <div
                      className={`text-xs tabular ${
                        r.totalPLPct >= 0
                          ? "text-(--color-up)"
                          : "text-(--color-down)"
                      }`}
                    >
                      {formatPercent(r.totalPLPct)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular text-(--color-text-muted)">
                    {totals.totalValue > 0
                      ? `${((r.marketValue / totals.totalValue) * 100).toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        removeHolding(r.symbol);
                        refresh();
                      }}
                      className="text-xs text-(--color-text-dim) transition-colors hover:text-(--color-down)"
                      title="Remove holding"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column: Allocation + Add */}
        <div className="space-y-4">
          <AllocationDonut sectors={sectorAlloc} />
          <AddHoldingForm onAdd={refresh} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function SummaryCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "up" | "down";
}) {
  const toneClass =
    tone === "up"
      ? "text-(--color-up)"
      : tone === "down"
        ? "text-(--color-down)"
        : "";
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
      <div className="text-xs uppercase tracking-wider text-(--color-text-muted)">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-bold tabular ${toneClass}`}>
        {value}
      </div>
      {sub && (
        <div className={`mt-0.5 text-sm tabular ${toneClass}`}>{sub}</div>
      )}
    </div>
  );
}

function AllocationDonut({
  sectors,
}: {
  sectors: { sector: string; value: number; pct: number; color: string }[];
}) {
  const R = 60;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
      <div className="text-xs uppercase tracking-wider text-(--color-text-muted) mb-3">
        Allocation
      </div>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 160 160" className="size-28 shrink-0">
          {sectors.map((s) => {
            const dash = (s.pct / 100) * C;
            const gap = C - dash;
            const thisOffset = offset;
            offset += dash;
            return (
              <circle
                key={s.sector}
                cx="80"
                cy="80"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="18"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-thisOffset}
                transform="rotate(-90 80 80)"
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
        <div className="flex flex-col gap-1.5 min-w-0">
          {sectors.map((s) => (
            <div key={s.sector} className="flex items-center gap-2 text-xs">
              <div
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="truncate text-(--color-text-muted)">
                {s.sector}
              </span>
              <span className="ml-auto tabular font-medium">
                {s.pct.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddHoldingForm({ onAdd }: { onAdd: () => void }) {
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [cost, setCost] = useState("");
  const [suggestions, setSuggestions] = useState<typeof TRACKED_STOCKS>([]);

  const handleSymbolChange = (val: string) => {
    setSymbol(val);
    if (val.trim().length > 0) {
      const q = val.trim().toUpperCase();
      setSuggestions(
        TRACKED_STOCKS.filter(
          (s) =>
            s.symbol.includes(q) || s.name.toUpperCase().includes(q),
        ).slice(0, 5),
      );
    } else {
      setSuggestions([]);
    }
  };

  const pickSuggestion = (sym: string) => {
    setSymbol(sym);
    setSuggestions([]);
  };

  const submit = () => {
    const sym = symbol.trim().toUpperCase();
    const sh = Number(shares);
    const c = Number(cost);
    if (!sym || !sh || sh <= 0 || !c || c <= 0) return;
    addHolding({ symbol: sym, shares: sh, avgCost: c });
    setSymbol("");
    setShares("");
    setCost("");
    setSuggestions([]);
    onAdd();
  };

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
      <div className="text-xs uppercase tracking-wider text-(--color-text-muted) mb-3">
        Add Holding
      </div>
      <div className="space-y-2.5">
        <div className="relative">
          <input
            type="text"
            placeholder="Symbol (e.g. AAPL)"
            value={symbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm outline-none placeholder:text-(--color-text-dim) focus:border-(--color-brand)"
          />
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-(--color-border) bg-(--color-surface) shadow-lg">
              {suggestions.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => pickSuggestion(s.symbol)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-(--color-surface-2)"
                >
                  <TickerIcon symbol={s.symbol} size={20} domain={s.domain} />
                  <span className="font-semibold">{s.symbol}</span>
                  <span className="text-xs text-(--color-text-muted) truncate">
                    {s.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="number"
          placeholder="Shares"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          min={0}
          step={0.01}
          className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm tabular outline-none placeholder:text-(--color-text-dim) focus:border-(--color-brand)"
        />
        <input
          type="number"
          placeholder="Avg cost per share ($)"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          min={0}
          step={0.01}
          className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm tabular outline-none placeholder:text-(--color-text-dim) focus:border-(--color-brand)"
        />
        <button
          onClick={submit}
          disabled={
            !symbol.trim() ||
            !Number(shares) ||
            !Number(cost) ||
            Number(shares) <= 0 ||
            Number(cost) <= 0
          }
          className="w-full rounded-lg bg-(--color-brand) py-2 text-sm font-semibold text-white transition-colors hover:bg-(--color-brand-hover) disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add to Portfolio
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-12 text-center">
      <div className="mx-auto mb-4 text-5xl">📊</div>
      <h2 className="text-xl font-semibold">Start tracking your portfolio</h2>
      <p className="mt-2 max-w-md mx-auto text-sm text-(--color-text-muted)">
        Add your first holding to see real-time P&L, allocation breakdown, and
        day-over-day performance. Everything stays in your browser — no login
        needed.
      </p>
      <div className="mt-6 inline-flex items-center gap-4 text-sm text-(--color-text-muted)">
        <span className="flex items-center gap-1.5">
          <span className="text-(--color-up)">✓</span> Real-time prices
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-(--color-up)">✓</span> No sign-up
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-(--color-up)">✓</span> 100% private
        </span>
      </div>
    </div>
  );
}
