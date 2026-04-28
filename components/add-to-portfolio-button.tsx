"use client";

import { useState } from "react";
import { addHolding } from "@/lib/portfolio-store";

export function AddToPortfolioButton({
  symbol,
  currentPrice,
}: {
  symbol: string;
  currentPrice: number;
}) {
  const [open, setOpen] = useState(false);
  const [shares, setShares] = useState("");
  const [cost, setCost] = useState(currentPrice > 0 ? currentPrice.toFixed(2) : "");
  const [done, setDone] = useState(false);

  const submit = () => {
    const sh = Number(shares);
    const c = Number(cost);
    if (!sh || sh <= 0 || !c || c <= 0) return;
    addHolding({ symbol: symbol.toUpperCase(), shares: sh, avgCost: c });
    setDone(true);
    setTimeout(() => {
      setOpen(false);
      setDone(false);
      setShares("");
      setCost(currentPrice > 0 ? currentPrice.toFixed(2) : "");
    }, 1200);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-sm font-medium text-(--color-text) transition-colors hover:border-(--color-brand) hover:text-(--color-brand)"
      >
        <svg
          viewBox="0 0 16 16"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <circle cx="8" cy="8" r="6.5" />
          <path d="M8 5.5v5M5.5 8h5" />
        </svg>
        Add to Portfolio
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 text-4xl">✅</div>
                <div className="text-lg font-semibold">Added to Portfolio</div>
                <div className="mt-1 text-sm text-(--color-text-muted)">
                  {shares} shares of {symbol} at ${Number(cost).toFixed(2)}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold">
                    Add {symbol} to Portfolio
                  </h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-md p-1 text-(--color-text-muted) transition-colors hover:text-(--color-text) hover:bg-(--color-surface-2)"
                  >
                    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-(--color-text-muted)">
                      Number of Shares
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                      min={0}
                      step={0.01}
                      autoFocus
                      className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-4 py-2.5 text-sm tabular outline-none placeholder:text-(--color-text-dim) focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand)/30"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-(--color-text-muted)">
                      Average Cost per Share ($)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 150.00"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      min={0}
                      step={0.01}
                      className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-4 py-2.5 text-sm tabular outline-none placeholder:text-(--color-text-dim) focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand)/30"
                    />
                    <div className="mt-1 flex items-center gap-2 text-xs text-(--color-text-dim)">
                      <span>Current price: ${currentPrice.toFixed(2)}</span>
                      {cost !== currentPrice.toFixed(2) && currentPrice > 0 && (
                        <button
                          onClick={() => setCost(currentPrice.toFixed(2))}
                          className="text-(--color-brand) hover:underline"
                        >
                          Use current
                        </button>
                      )}
                    </div>
                  </div>

                  {Number(shares) > 0 && Number(cost) > 0 && (
                    <div className="rounded-lg bg-(--color-bg) p-3 text-sm">
                      <div className="flex justify-between text-(--color-text-muted)">
                        <span>Total cost</span>
                        <span className="font-medium text-(--color-text) tabular">
                          ${(Number(shares) * Number(cost)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={submit}
                    disabled={!Number(shares) || Number(shares) <= 0 || !Number(cost) || Number(cost) <= 0}
                    className="w-full rounded-lg bg-(--color-brand) py-2.5 text-sm font-semibold text-white transition-colors hover:bg-(--color-brand-hover) disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Add to Portfolio
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
