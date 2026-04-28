"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import type { EodRecord } from "@/lib/marketstack";
import { STOCKS_BY_SYMBOL, TRACKED_STOCKS } from "@/lib/stocks";
import { formatPlainPrice } from "@/lib/format";
import { TickerIcon } from "@/components/ticker-icon";
import {
  readAlerts,
  addAlert,
  removeAlert,
  clearTriggered,
  type PriceAlert,
} from "@/lib/alerts-store";

export function AlertsDashboard({ records }: { records: EodRecord[] }) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => setAlerts(readAlerts()), []);

  useEffect(() => {
    refresh();
    setMounted(true);
    const handler = () => refresh();
    window.addEventListener("alerts:changed", handler);
    return () => window.removeEventListener("alerts:changed", handler);
  }, [refresh]);

  const priceMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of records) map[r.symbol] = r.close;
    return map;
  }, [records]);

  const active = alerts.filter((a) => !a.triggered);
  const triggered = alerts.filter((a) => a.triggered);

  if (!mounted) {
    return (
      <div className="grid h-64 place-items-center rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text-muted)">
        Loading alerts…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Alert Form */}
      <AddAlertForm priceMap={priceMap} onAdd={refresh} />

      {/* Active Alerts */}
      {active.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Active Alerts ({active.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                currentPrice={priceMap[alert.symbol] ?? 0}
                onRemove={() => {
                  removeAlert(alert.id);
                  refresh();
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Triggered */}
      {triggered.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-(--color-text-muted)">
              Triggered ({triggered.length})
            </h2>
            <button
              onClick={() => {
                clearTriggered();
                refresh();
              }}
              className="text-xs text-(--color-text-muted) underline-offset-2 hover:text-(--color-down) hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {triggered.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                currentPrice={priceMap[alert.symbol] ?? 0}
                onRemove={() => {
                  removeAlert(alert.id);
                  refresh();
                }}
              />
            ))}
          </div>
        </section>
      )}

      {active.length === 0 && triggered.length === 0 && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-12 text-center">
          <div className="mx-auto mb-4 text-5xl">🔔</div>
          <h2 className="text-xl font-semibold">No alerts yet</h2>
          <p className="mt-2 max-w-md mx-auto text-sm text-(--color-text-muted)">
            Set a target price above and get notified when the stock reaches
            your level. Works right in your browser.
          </p>
        </div>
      )}
    </div>
  );
}

function AddAlertForm({
  priceMap,
  onAdd,
}: {
  priceMap: Record<string, number>;
  onAdd: () => void;
}) {
  const [symbol, setSymbol] = useState("");
  const [target, setTarget] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [suggestions, setSuggestions] = useState<typeof TRACKED_STOCKS>([]);

  const currentPrice = priceMap[symbol.toUpperCase()] ?? null;

  const handleSymbolChange = (val: string) => {
    setSymbol(val);
    if (val.trim().length > 0) {
      const q = val.trim().toUpperCase();
      setSuggestions(
        TRACKED_STOCKS.filter(
          (s) => s.symbol.includes(q) || s.name.toUpperCase().includes(q),
        ).slice(0, 5),
      );
    } else {
      setSuggestions([]);
    }
  };

  const submit = () => {
    const sym = symbol.trim().toUpperCase();
    const t = Number(target);
    if (!sym || !t || t <= 0) return;

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    addAlert(sym, t, direction);
    setSymbol("");
    setTarget("");
    setSuggestions([]);
    onAdd();
  };

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
      <div className="text-xs uppercase tracking-wider text-(--color-text-muted) mb-3">
        New Alert
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative w-40">
          <label className="mb-1 block text-[11px] text-(--color-text-muted)">
            Symbol
          </label>
          <input
            type="text"
            placeholder="AAPL"
            value={symbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm outline-none placeholder:text-(--color-text-dim) focus:border-(--color-brand)"
          />
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-(--color-border) bg-(--color-surface) shadow-lg">
              {suggestions.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => {
                    setSymbol(s.symbol);
                    setSuggestions([]);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-(--color-surface-2)"
                >
                  <TickerIcon symbol={s.symbol} size={18} domain={s.domain} />
                  <span className="font-semibold">{s.symbol}</span>
                  <span className="text-xs text-(--color-text-muted) truncate">
                    {s.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-32">
          <label className="mb-1 block text-[11px] text-(--color-text-muted)">
            Direction
          </label>
          <select
            value={direction}
            onChange={(e) =>
              setDirection(e.target.value as "above" | "below")
            }
            className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm outline-none focus:border-(--color-brand)"
          >
            <option value="above">Goes above</option>
            <option value="below">Drops below</option>
          </select>
        </div>

        <div className="w-36">
          <label className="mb-1 block text-[11px] text-(--color-text-muted)">
            Target Price ($)
          </label>
          <input
            type="number"
            placeholder="150.00"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            step={0.01}
            min={0}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm tabular outline-none placeholder:text-(--color-text-dim) focus:border-(--color-brand)"
          />
        </div>

        {currentPrice !== null && currentPrice > 0 && (
          <div className="text-xs text-(--color-text-muted) pb-2">
            Current: <span className="font-medium text-(--color-text)">${formatPlainPrice(currentPrice)}</span>
          </div>
        )}

        <button
          onClick={submit}
          disabled={!symbol.trim() || !Number(target) || Number(target) <= 0}
          className="rounded-lg bg-(--color-brand) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--color-brand-hover) disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Set Alert
        </button>
      </div>
    </div>
  );
}

function AlertCard({
  alert,
  currentPrice,
  onRemove,
}: {
  alert: PriceAlert;
  currentPrice: number;
  onRemove: () => void;
}) {
  const meta = STOCKS_BY_SYMBOL[alert.symbol];
  const distance =
    currentPrice > 0
      ? ((alert.targetPrice - currentPrice) / currentPrice) * 100
      : 0;
  const isClose = Math.abs(distance) < 5;
  const isTriggered = alert.triggered;

  // Progress toward target
  let progress = 0;
  if (currentPrice > 0 && alert.targetPrice > 0) {
    if (alert.direction === "above") {
      progress = Math.min((currentPrice / alert.targetPrice) * 100, 100);
    } else {
      progress = Math.min((alert.targetPrice / currentPrice) * 100, 100);
    }
  }

  return (
    <div
      className={`relative rounded-xl border p-4 transition-colors ${
        isTriggered
          ? "border-(--color-up)/40 bg-(--color-up)/5"
          : isClose
            ? "border-(--color-brand)/40 bg-(--color-brand)/5"
            : "border-(--color-border) bg-(--color-surface)"
      }`}
    >
      <button
        onClick={onRemove}
        className="absolute right-3 top-3 text-xs text-(--color-text-dim) transition-colors hover:text-(--color-down)"
        title="Remove alert"
      >
        ✕
      </button>

      <div className="flex items-center gap-3 mb-3">
        <Link href={`/stock/${alert.symbol}`}>
          <TickerIcon symbol={alert.symbol} size={32} domain={meta?.domain} />
        </Link>
        <div>
          <div className="font-semibold">{alert.symbol}</div>
          <div className="text-xs text-(--color-text-muted) truncate max-w-[140px]">
            {meta?.name}
          </div>
        </div>
        {isTriggered && (
          <span className="ml-auto rounded-full bg-(--color-up)/15 px-2 py-0.5 text-[10px] font-bold text-(--color-up)">
            TRIGGERED
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between text-sm">
        <div>
          <span className="text-(--color-text-muted)">
            {alert.direction === "above" ? "Above" : "Below"}
          </span>
          <span className="ml-1.5 font-bold tabular text-(--color-brand)">
            ${formatPlainPrice(alert.targetPrice)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-(--color-text-muted)">Now </span>
          <span className="font-medium tabular">
            ${formatPlainPrice(currentPrice)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="relative h-1.5 rounded-full bg-(--color-border)">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
              isTriggered
                ? "bg-(--color-up)"
                : isClose
                  ? "bg-(--color-brand)"
                  : "bg-(--color-text-muted)"
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-(--color-text-dim)">
          <span>{distance > 0 ? `${distance.toFixed(1)}% away` : `${Math.abs(distance).toFixed(1)}% past`}</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
