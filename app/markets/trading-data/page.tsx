import { fetchLatestEod, type EodRecord } from "@/lib/marketstack";
import { TRACKED_SYMBOLS } from "@/lib/stocks";
import { changePercent, formatCompact, formatPercent } from "@/lib/format";
import { MarketsTabs } from "@/components/markets-tabs";
import { MarketStatsBar } from "@/components/market-stats-bar";
import { ErrorBanner } from "@/components/error-banner";
import { TradingDataTable } from "@/components/trading-data-table";
import { LiveRefresh } from "@/components/live-refresh";

export const revalidate = 65;

export const metadata = {
  title: "Trading Data — StockoMeter",
};

export default async function TradingDataPage() {
  let records: EodRecord[] = [];
  let error: string | null = null;

  try {
    records = await fetchLatestEod(TRACKED_SYMBOLS);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load market data";
  }

  const enriched = records.map((r) => ({
    ...r,
    change: changePercent(r.open, r.close),
    rangePct: r.low ? ((r.high - r.low) / r.low) * 100 : 0,
    dollarVolume: r.close * r.volume,
  }));

  const totalDollarVol = enriched.reduce((s, r) => s + r.dollarVolume, 0);
  const mostVolatile =
    [...enriched].sort((a, b) => b.rangePct - a.rangePct)[0] ?? null;
  const tightest =
    [...enriched].sort((a, b) => a.rangePct - b.rangePct)[0] ?? null;

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-3">
        <MarketsTabs />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <MarketStatsBar records={records} />
          <LiveRefresh intervalMs={65_000} />
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {!error && records.length > 0 && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Total Dollar Volume"
              value={`$${formatCompact(totalDollarVol)}`}
              sub={`${enriched.length} tickers · today`}
            />
            {mostVolatile && (
              <StatCard
                label="Most Volatile"
                value={mostVolatile.symbol}
                sub={`${formatPercent(mostVolatile.rangePct)} day range`}
                accent="brand"
              />
            )}
            {tightest && (
              <StatCard
                label="Tightest Range"
                value={tightest.symbol}
                sub={`${formatPercent(tightest.rangePct)} day range`}
                accent="brand"
              />
            )}
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold">Trading Data</h2>
              <p className="text-sm text-(--color-text-muted) max-w-3xl">
                Sortable, paginated view of every ticker — sort by dollar
                volume, change, intraday range, or any column.
              </p>
            </div>
            <TradingDataTable records={records} />
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: "brand";
}) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
      <div className="text-xs uppercase tracking-wider text-(--color-text-muted)">
        {label}
      </div>
      <div
        className={`mt-2 text-2xl font-semibold tabular ${
          accent === "brand" ? "text-(--color-brand)" : "text-(--color-text)"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-(--color-text-muted)">{sub}</div>
    </div>
  );
}
