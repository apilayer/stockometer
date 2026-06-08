import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchEodHistory, fetchLatestEod } from "@/lib/marketstack";
import {
  changePercent,
  formatCompact,
  formatDate,
  formatPercent,
  formatPlainPrice,
} from "@/lib/format";
import { STOCKS_BY_SYMBOL, TRACKED_SYMBOLS } from "@/lib/stocks";
import { TickerIcon } from "@/components/ticker-icon";
import dynamic from "next/dynamic";

const PriceChart = dynamic(
  () => import("@/components/price-chart").then((mod) => mod.PriceChart),
);
import { WatchlistToggle } from "@/components/watchlist-toggle";
import { EodHistoryTable } from "@/components/eod-history-table";
import { BrokerSection } from "@/components/broker-section";
import { StockSidebar } from "@/components/stock-sidebar";
import { AddToPortfolioButton } from "@/components/add-to-portfolio-button";

export const revalidate = 3600;

export default async function StockPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();
  const meta = STOCKS_BY_SYMBOL[symbol];

  let history: Awaited<ReturnType<typeof fetchEodHistory>> = [];
  let error: string | null = null;
  try {
    // Fetch extra look-back so the 99-day MA can render across the visible 90.
    history = await fetchEodHistory(symbol, 190);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load price history";
  }

  // Fetch sidebar data (shares cache with homepage)
  let sidebarRecords: Awaited<ReturnType<typeof fetchLatestEod>> = [];
  try {
    sidebarRecords = await fetchLatestEod(TRACKED_SYMBOLS);
  } catch {
    // Sidebar is non-critical — silently degrade
  }

  if (!error && history.length === 0) notFound();

  // `history` holds extra look-back for the chart's MAs; all page-level stats
  // and tables stay scoped to the most recent 90 sessions (DESC order).
  const recent = history.slice(0, 90);

  const latest = recent[0];
  const prev = recent[1];
  const dayChange = latest ? changePercent(latest.open, latest.close) : 0;
  const periodChange =
    latest && recent.length > 1
      ? changePercent(recent[recent.length - 1].close, latest.close)
      : 0;
  const dayOverDay = latest && prev ? changePercent(prev.close, latest.close) : 0;
  const positive = dayChange >= 0;

  const periodHigh = recent.length
    ? Math.max(...recent.map((r) => r.high))
    : 0;
  const periodLow = recent.length ? Math.min(...recent.map((r) => r.low)) : 0;
  const avgVolume =
    recent.length > 0
      ? recent.reduce((s, r) => s + r.volume, 0) / recent.length
      : 0;

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <nav className="text-sm text-(--color-text-muted)">
          <Link
            href="/"
            className="transition-colors hover:text-(--color-brand)"
          >
            Markets
          </Link>{" "}
          <span className="text-(--color-text-dim)">/</span>{" "}
          <span className="text-(--color-text)">{symbol}</span>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={`/compare/${symbol}`}
            className="rounded-md border border-(--color-border) px-3 py-1.5 text-sm font-medium text-(--color-text) transition-colors hover:border-(--color-brand) hover:text-(--color-brand)"
          >
            Compare ↔
          </Link>
          <AddToPortfolioButton symbol={symbol} currentPrice={latest?.close ?? 0} />
          <WatchlistToggle symbol={symbol} />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-(--color-down)/40 bg-(--color-down)/10 p-4 text-(--color-down)">
          {error}
        </div>
      )}

      {/* 2-column layout: main content + sidebar */}
      <div className="flex gap-6 items-start">
        {/* Main column */}
        <div className="flex-1 min-w-0 space-y-8">
          {latest && (
            <header className="flex flex-wrap items-end justify-between gap-6 rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
              <div className="flex items-start gap-4">
                <TickerIcon symbol={symbol} size={56} />
                <div>
                  <div className="flex items-center gap-2 text-(--color-text-muted)">
                    <span className="rounded bg-(--color-surface-2) px-1.5 py-0.5 text-xs">
                      {latest.exchange_code ?? latest.exchange}
                    </span>
                    <span className="text-xs">
                      {meta?.sector ?? latest.asset_type}
                    </span>
                  </div>
                  <h1 className="mt-1 text-2xl font-semibold">
                    {symbol}{" "}
                    <span className="text-(--color-text-muted) font-normal text-lg">
                      {meta?.name ?? latest.name}
                    </span>
                  </h1>
                  <div className="mt-3 flex flex-wrap items-baseline gap-3">
                    <div className="text-4xl font-bold tabular">
                      ${formatPlainPrice(latest.close)}
                    </div>
                    <div
                      className={`text-base font-semibold tabular ${
                        positive ? "text-(--color-up)" : "text-(--color-down)"
                      }`}
                    >
                      {formatPercent(dayChange)} today
                    </div>
                    {prev && (
                      <div
                        className={`text-xs tabular ${
                          dayOverDay >= 0
                            ? "text-(--color-up)"
                            : "text-(--color-down)"
                        }`}
                      >
                        {formatPercent(dayOverDay)} vs prior close
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-(--color-text-dim)">
                    As of {formatDate(latest.date)} · {latest.price_currency}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 text-sm">
                <Stat label="Open" value={`$${formatPlainPrice(latest.open)}`} />
                <Stat label="Day High" value={`$${formatPlainPrice(latest.high)}`} />
                <Stat label="Day Low" value={`$${formatPlainPrice(latest.low)}`} />
                <Stat label="Volume" value={formatCompact(latest.volume)} />
                <Stat label="90d High" value={`$${formatPlainPrice(periodHigh)}`} />
                <Stat label="90d Low" value={`$${formatPlainPrice(periodLow)}`} />
                <Stat label="Avg Volume" value={formatCompact(avgVolume)} />
                <Stat
                  label="90d Change"
                  value={formatPercent(periodChange)}
                  accent={periodChange >= 0 ? "up" : "down"}
                />
              </div>
            </header>
          )}

          {history.length > 1 && (
            <section className="space-y-3">
              <div className="flex items-end justify-between">
                <h2 className="text-lg font-semibold">Price chart</h2>
                <span className="text-xs text-(--color-text-muted)">
                  Scroll to zoom · drag to pan · {history.length} sessions
                </span>
              </div>
              <PriceChart history={history} visibleBars={90} />
            </section>
          )}

          <BrokerSection symbol={symbol} />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Price history</h2>
            <EodHistoryTable history={recent} />
          </section>
        </div>

        {/* Sidebar — hidden on mobile */}
        {sidebarRecords.length > 0 && (
          <div className="hidden lg:block w-72 shrink-0 sticky top-20">
            <StockSidebar
              records={sidebarRecords}
              currentSymbol={symbol}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "up" | "down";
}) {
  const color =
    accent === "up"
      ? "text-(--color-up)"
      : accent === "down"
        ? "text-(--color-down)"
        : "text-(--color-text)";
  return (
    <div>
      <div className="text-xs text-(--color-text-muted)">{label}</div>
      <div className={`mt-0.5 font-medium tabular ${color}`}>{value}</div>
    </div>
  );
}
