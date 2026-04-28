"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TRACKED_STOCKS } from "@/lib/stocks";
import { TickerIcon } from "@/components/ticker-icon";

export function buildCompareUrl(symbols: string[]): string {
  const cleaned = Array.from(
    new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean)),
  );
  if (cleaned.length === 0) return "/compare";
  if (cleaned.length === 2) return `/compare/${cleaned[0]}-vs-${cleaned[1]}`;
  return `/compare/${cleaned.join("-")}`;
}

export function ComparePicker({
  current,
  max = 6,
}: {
  current: string[];
  max?: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const remove = (sym: string) => {
    const next = current.filter((s) => s !== sym);
    router.push(buildCompareUrl(next));
  };

  const add = (sym: string) => {
    const upper = sym.toUpperCase();
    if (current.includes(upper)) return;
    if (current.length >= max) return;
    setQuery("");
    router.push(buildCompareUrl([...current, upper]));
  };

  const q = query.trim().toUpperCase();
  const suggestions = TRACKED_STOCKS.filter(
    (s) =>
      !current.includes(s.symbol) &&
      (q === "" ||
        s.symbol.includes(q) ||
        s.name.toUpperCase().includes(q)),
  ).slice(0, 8);

  const canAddCustom = q.length >= 1 && !TRACKED_STOCKS.some((s) => s.symbol === q);

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        {current.map((sym) => {
          const meta = TRACKED_STOCKS.find((s) => s.symbol === sym);
          return (
            <span
              key={sym}
              className="inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg) py-1 pl-1 pr-3"
            >
              <TickerIcon symbol={sym} domain={meta?.domain} size={22} />
              <span className="text-sm font-semibold">{sym}</span>
              <button
                onClick={() => remove(sym)}
                aria-label={`Remove ${sym}`}
                className="text-(--color-text-muted) transition-colors hover:text-(--color-down)"
              >
                ×
              </button>
            </span>
          );
        })}
        {current.length === 0 && (
          <span className="text-sm text-(--color-text-muted)">
            Add tickers below to start comparing
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (suggestions[0]) add(suggestions[0].symbol);
                else if (canAddCustom) add(q);
              }
            }}
            placeholder={
              current.length >= max
                ? `Up to ${max} tickers`
                : "Search a ticker to add (e.g. NVDA)"
            }
            disabled={current.length >= max}
            className="flex-1 rounded-md border border-(--color-border) bg-(--color-bg) px-3 py-1.5 text-sm outline-none transition-colors focus:border-(--color-brand) disabled:opacity-50"
          />
          <span className="text-xs text-(--color-text-muted)">
            {current.length}/{max}
          </span>
        </div>

        {(query || current.length < max) && (
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s.symbol}
                onClick={() => add(s.symbol)}
                className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-bg) px-2.5 py-1 text-xs transition-colors hover:border-(--color-brand) hover:text-(--color-brand)"
              >
                <TickerIcon symbol={s.symbol} domain={s.domain} size={16} />
                <span className="font-semibold">{s.symbol}</span>
                <span className="text-(--color-text-muted)">{s.name}</span>
              </button>
            ))}
            {canAddCustom && (
              <button
                onClick={() => add(q)}
                className="rounded-full border border-(--color-brand) bg-(--color-brand)/10 px-2.5 py-1 text-xs font-medium text-(--color-brand) transition-colors hover:bg-(--color-brand)/20"
              >
                + Add {q}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
