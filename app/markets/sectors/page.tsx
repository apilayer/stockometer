import { fetchLatestEod, type EodRecord } from "@/lib/marketstack";
import { TRACKED_SYMBOLS } from "@/lib/stocks";
import { aggregateBySector } from "@/lib/aggregations";
import { MarketsTabs } from "@/components/markets-tabs";
import { MarketStatsBar } from "@/components/market-stats-bar";
import { ErrorBanner } from "@/components/error-banner";
import { SectorCard } from "@/components/sector-card";
import { LiveRefresh } from "@/components/live-refresh";

export const revalidate = 65;

export const metadata = {
  title: "Sectors — StockoMeter",
};

export default async function MarketsSectorsPage() {
  let records: EodRecord[] = [];
  let error: string | null = null;
  try {
    records = await fetchLatestEod(TRACKED_SYMBOLS);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load market data";
  }

  const sectors = aggregateBySector(records);

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

      {!error && sectors.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Sector Performance</h2>
            <p className="text-sm text-(--color-text-muted) max-w-3xl">
              Today&apos;s performance grouped by sector — sorted by average
              change. The heatmap below the cards shows every ticker as a tile
              colored by intraday change.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sectors.map((s) => (
              <SectorCard key={s.sector} agg={s} />
            ))}
          </div>
        </section>
      )}

      {!error && records.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Heatmap</h2>
          <Heatmap records={records} />
        </section>
      )}
    </div>
  );
}

function Heatmap({ records }: { records: EodRecord[] }) {
  const tiles = records
    .map((r) => ({
      symbol: r.symbol,
      change: r.open ? ((r.close - r.open) / r.open) * 100 : 0,
      volume: r.volume,
      close: r.close,
    }))
    .sort((a, b) => b.volume - a.volume);

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {tiles.map((t) => {
          const intensity = Math.min(Math.abs(t.change) / 4, 1);
          const bg =
            t.change >= 0
              ? `rgba(46, 189, 133, ${0.15 + intensity * 0.55})`
              : `rgba(246, 70, 93, ${0.15 + intensity * 0.55})`;
          return (
            <a
              key={t.symbol}
              href={`/stock/${t.symbol}`}
              className="rounded-md p-3 transition-transform hover:scale-[1.03]"
              style={{ background: bg }}
            >
              <div className="font-semibold text-sm">{t.symbol}</div>
              <div className="text-xs tabular text-white/90">
                {t.change >= 0 ? "+" : ""}
                {t.change.toFixed(2)}%
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
