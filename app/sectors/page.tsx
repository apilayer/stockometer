import { fetchLatestEod, type EodRecord } from "@/lib/marketstack";
import { TRACKED_SYMBOLS } from "@/lib/stocks";
import { aggregateBySector } from "@/lib/aggregations";
import { MarketStatsBar } from "@/components/market-stats-bar";
import { ErrorBanner } from "@/components/error-banner";
import { SectorCard } from "@/components/sector-card";
import { LiveRefresh } from "@/components/live-refresh";

export const revalidate = 65;

export const metadata = {
  title: "Sectors — StockoMeter",
};

export default async function SectorsPage() {
  let records: EodRecord[] = [];
  let error: string | null = null;
  try {
    records = await fetchLatestEod(TRACKED_SYMBOLS);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load market data";
  }

  const sectors = aggregateBySector(records);

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6">
      <header className="space-y-2 border-b border-(--color-border) pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-3xl font-semibold">Sectors</h1>
          <LiveRefresh intervalMs={65_000} />
        </div>
        <p className="text-sm text-(--color-text-muted) max-w-3xl">
          Deep dive into every sector. Each card expands to show its
          constituent tickers with live prices and day change.
        </p>
        <MarketStatsBar records={records} />
      </header>

      {error && <ErrorBanner message={error} />}

      {!error && sectors.length > 0 && (
        <section className="grid gap-4 lg:grid-cols-2">
          {sectors.map((s) => (
            <SectorCard key={s.sector} agg={s} showRecords />
          ))}
        </section>
      )}
    </div>
  );
}
