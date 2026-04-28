import { fetchLatestEod, type EodRecord } from "@/lib/marketstack";
import { TRACKED_SYMBOLS } from "@/lib/stocks";
import { MarketStatsBar } from "@/components/market-stats-bar";
import { ErrorBanner } from "@/components/error-banner";
import { StocksTable } from "@/components/stocks-table";
import { LiveRefresh } from "@/components/live-refresh";

export const revalidate = 65;

export const metadata = {
  title: "Stocks — StockoMeter",
};

export default async function StocksPage() {
  let records: EodRecord[] = [];
  let error: string | null = null;
  try {
    records = await fetchLatestEod(TRACKED_SYMBOLS);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load market data";
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6">
      <header className="space-y-2 border-b border-(--color-border) pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-3xl font-semibold">Stocks</h1>
          <LiveRefresh intervalMs={65_000} />
        </div>
        <p className="text-sm text-(--color-text-muted) max-w-3xl">
          Browse every ticker StockoMeter tracks. Filter by sector or sort any
          column. Click any ticker for the 90-day chart and EOD history.
        </p>
        <MarketStatsBar records={records} />
      </header>

      {error && <ErrorBanner message={error} />}

      {!error && records.length > 0 && <StocksTable records={records} />}
    </div>
  );
}
