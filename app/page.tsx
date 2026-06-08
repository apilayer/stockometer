import { fetchTopStocks, type EodRecord } from "@/lib/marketstack";
import { HeroCards } from "@/components/hero-cards";
import { StocksTable } from "@/components/stocks-table";
import { MarketsTabs } from "@/components/markets-tabs";
import { MarketStatsBar } from "@/components/market-stats-bar";
import { ErrorBanner } from "@/components/error-banner";
import { LiveRefresh } from "@/components/live-refresh";
import { MarketCharts } from "@/components/market-charts";
import { MarketstackBanner } from "@/components/marketstack-banner";

export const revalidate = 65;

const UNIVERSE_SIZE = Number(process.env.STOCKOMETER_UNIVERSE_SIZE ?? 100);

export default async function HomePage() {
  let records: EodRecord[] = [];
  let error: string | null = null;

  try {
    records = await fetchTopStocks(UNIVERSE_SIZE);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load market data";
  }

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
          <HeroCards rows={records} />

          <MarketstackBanner />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Market Overview</h2>
            <MarketCharts records={records} />
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold">
                Top Stocks by 24h Volume
              </h2>
              <p className="text-sm text-(--color-text-muted) max-w-3xl">
                A live view of the {records.length} most actively-traded stocks
                on the major US markets, ranked by volume. See the latest price,
                daily change, day range and how much is trading — updated
                continuously.
              </p>
            </div>
            <StocksTable records={records} />
          </section>
        </>
      )}

      {!error && records.length === 0 && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-8 text-center text-(--color-text-muted)">
          No data returned by Marketstack. Try again in a moment.
        </div>
      )}

      {/* Floating compact data-source banner */}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] -translate-x-1/2 px-2">
        <div className="pointer-events-auto mx-auto w-fit">
          <MarketstackBanner variant="compact" />
        </div>
      </div>
    </div>
  );
}
