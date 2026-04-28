import Link from "next/link";
import { fetchLatestEod, type EodRecord } from "@/lib/marketstack";
import { TRACKED_SYMBOLS, STOCKS_BY_SYMBOL } from "@/lib/stocks";
import { formatPlainPrice } from "@/lib/format";
import { DIVIDEND_DATA, dividendYield, nextExDate } from "@/lib/dividends";
import { TickerIcon } from "@/components/ticker-icon";
import { ErrorBanner } from "@/components/error-banner";
import { LiveRefresh } from "@/components/live-refresh";

export const revalidate = 65;

export const metadata = {
  title: "Dividend Calendar — StockoMeter",
  description:
    "See dividend yields, annual payouts, and estimated ex-dividend dates for 38 US stocks. Find the best dividend stocks to buy.",
};

export default async function DividendsPage() {
  let records: EodRecord[] = [];
  let error: string | null = null;
  try {
    records = await fetchLatestEod(TRACKED_SYMBOLS);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load market data";
  }

  const priceMap: Record<string, number> = {};
  for (const r of records) priceMap[r.symbol] = r.close;

  const rows = DIVIDEND_DATA.map((d) => {
    const price = priceMap[d.symbol] ?? 0;
    const yld = dividendYield(d.annualDividend, price);
    const next = nextExDate(d);
    const meta = STOCKS_BY_SYMBOL[d.symbol];
    return { ...d, price, yield: yld, nextExDate: next, name: meta?.name ?? d.symbol, sector: meta?.sector };
  });

  const payers = rows.filter((r) => r.annualDividend > 0).sort((a, b) => b.yield - a.yield);
  const nonPayers = rows.filter((r) => r.annualDividend === 0);

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6">
      <header className="space-y-2 border-b border-(--color-border) pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Dividend Calendar</h1>
            <p className="mt-1 text-sm text-(--color-text-muted) max-w-3xl">
              Estimated annual dividends and yields for tracked stocks.
              Yields calculated from latest closing prices.
            </p>
          </div>
          <LiveRefresh intervalMs={65_000} />
        </div>
      </header>

      {error && <ErrorBanner message={error} />}

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        <StatPill label="Dividend Payers" value={String(payers.length)} />
        <StatPill label="Avg Yield" value={`${(payers.reduce((s, r) => s + r.yield, 0) / (payers.length || 1)).toFixed(2)}%`} />
        <StatPill label="Highest Yield" value={payers.length > 0 ? `${payers[0].symbol} ${payers[0].yield.toFixed(2)}%` : "—"} />
        <StatPill label="No Dividend" value={String(nonPayers.length)} />
      </div>

      {/* Payers Table */}
      {payers.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-(--color-border) bg-(--color-surface) scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-(--color-text-muted)">
              <tr className="border-b border-(--color-border)">
                <th className="px-4 py-3 text-left font-normal">Stock</th>
                <th className="px-4 py-3 text-left font-normal">Sector</th>
                <th className="px-4 py-3 text-right font-normal">Price</th>
                <th className="px-4 py-3 text-right font-normal">Annual Div</th>
                <th className="px-4 py-3 text-right font-normal">Yield</th>
                <th className="px-4 py-3 text-left font-normal">Frequency</th>
                <th className="px-4 py-3 text-left font-normal">Next Est. Ex-Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)/60">
              {payers.map((r) => {
                const highYield = r.yield >= 3;
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
                          <div className="text-xs text-(--color-text-muted) truncate max-w-[140px]">
                            {r.name}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-(--color-surface-2) px-2 py-0.5 text-[11px] text-(--color-text-muted)">
                        {r.sector ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular font-medium">
                      ${formatPlainPrice(r.price)}
                    </td>
                    <td className="px-4 py-3 text-right tabular font-medium text-(--color-up)">
                      ${r.annualDividend.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`tabular font-semibold ${
                          highYield ? "text-(--color-up)" : "text-(--color-text)"
                        }`}
                      >
                        {r.yield.toFixed(2)}%
                      </span>
                      {highYield && (
                        <span className="ml-1.5 rounded-full bg-(--color-up)/15 px-1.5 py-0.5 text-[10px] font-medium text-(--color-up)">
                          High
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-(--color-text-muted)">
                      {r.frequency}
                    </td>
                    <td className="px-4 py-3 text-xs tabular text-(--color-text-muted)">
                      {r.nextExDate
                        ? r.nextExDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Non-payers */}
      {nonPayers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-(--color-text-muted)">
            No Dividend
          </h2>
          <div className="flex flex-wrap gap-2">
            {nonPayers.map((r) => (
              <Link
                key={r.symbol}
                href={`/stock/${r.symbol}`}
                className="flex items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm transition-colors hover:border-(--color-brand)/40"
              >
                <TickerIcon symbol={r.symbol} size={20} />
                <span className="font-medium">{r.symbol}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-(--color-text-dim) text-center">
        Dividend data is estimated from public filings. Actual amounts and dates
        may vary. Not financial advice.
      </p>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2">
      <div className="text-[11px] uppercase tracking-wider text-(--color-text-muted)">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold tabular">{value}</div>
    </div>
  );
}
