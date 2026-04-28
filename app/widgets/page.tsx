"use client";

import { useState } from "react";
import { TRACKED_STOCKS } from "@/lib/stocks";

export default function WidgetsPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://stockometer.com";
  const src = `${origin}/embed/${symbol}?theme=${theme}`;
  const embedCode = `<iframe src="${src}" width="320" height="140" frameborder="0" style="border-radius:12px;overflow:hidden;" loading="lazy"></iframe>`;

  const copy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6">
      <header className="space-y-2 border-b border-(--color-border) pb-4">
        <h1 className="text-3xl font-semibold">Embeddable Widgets</h1>
        <p className="text-sm text-(--color-text-muted) max-w-3xl">
          Embed live stock cards on your blog or website. Free backlinks for
          you, live data for your readers.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Config */}
        <div className="space-y-4">
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 space-y-4">
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wider text-(--color-text-muted)">
                Stock
              </label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm outline-none focus:border-(--color-brand)"
              >
                {TRACKED_STOCKS.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} — {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wider text-(--color-text-muted)">
                Theme
              </label>
              <div className="flex gap-2">
                {(["dark", "light"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm capitalize transition-colors ${
                      theme === t
                        ? "border-(--color-brand) bg-(--color-brand)/10 text-(--color-brand) font-semibold"
                        : "border-(--color-border) text-(--color-text-muted) hover:border-(--color-brand)/40"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Embed code */}
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-(--color-text-muted)">
              Embed Code
            </div>
            <pre className="overflow-x-auto rounded-lg bg-(--color-bg) p-3 text-xs text-(--color-text-muted) scrollbar-thin">
              {embedCode}
            </pre>
            <button
              onClick={copy}
              className="w-full rounded-lg bg-(--color-brand) py-2 text-sm font-semibold text-white transition-colors hover:bg-(--color-brand-hover)"
            >
              {copied ? "Copied ✓" : "Copy Code"}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wider text-(--color-text-muted)">
            Preview
          </div>
          <div
            className={`rounded-xl border p-8 ${
              theme === "dark"
                ? "border-(--color-border) bg-[#0d1117]"
                : "border-[#d0d7de] bg-[#f6f8fa]"
            }`}
          >
            <iframe
              src={src}
              width="320"
              height="140"
              style={{
                border: "none",
                borderRadius: "12px",
                overflow: "hidden",
              }}
              loading="lazy"
            />
          </div>
          <p className="text-xs text-(--color-text-dim)">
            The widget auto-updates with live market data. It links back to
            StockoMeter — giving you free backlinks and boosting your SEO.
          </p>
        </div>
      </div>
    </div>
  );
}
