import Link from "next/link";
import { fetchEodHistory, type EodRecord } from "@/lib/marketstack";
import { STOCKS_BY_SYMBOL } from "@/lib/stocks";
import {
  changePercent,
  formatCompact,
  formatPercent,
  formatPlainPrice,
} from "@/lib/format";
import { TickerIcon } from "@/components/ticker-icon";
import { ErrorBanner } from "@/components/error-banner";
import type { CompareSeries } from "@/components/compare-chart";
import { ComparePicker } from "@/components/compare-picker";
import dynamic from "next/dynamic";

const CompareChart = dynamic(
  () => import("@/components/compare-chart").then((mod) => mod.CompareChart)
);
const CandlestickChart = dynamic(
  () => import("@/components/candlestick-chart").then((mod) => mod.CandlestickChart)
);
export const revalidate = 3600;

const MAX_SYMBOLS = 6;

function parseSymbols(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split("-")
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s && s !== "VS"),
    ),
  ).slice(0, MAX_SYMBOLS);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbols: string }>;
}) {
  const { symbols: raw } = await params;
  const symbols = parseSymbols(raw);
  const headline =
    symbols.length === 2
      ? `${symbols[0]} vs ${symbols[1]}`
      : symbols.join(" vs ");
  return {
    title: `${headline} comparison — StockoMeter`,
    description: `Side-by-side comparison of ${headline}: price, day change, 90-day return, volume.`,
  };
}

export default async function CompareSymbolsPage({
  params,
}: {
  params: Promise<{ symbols: string }>;
}) {
  const { symbols: raw } = await params;
  const symbols = parseSymbols(raw);

  const results = await Promise.all(
    symbols.map(async (sym) => {
      try {
        const history = await fetchEodHistory(sym, 90);
        return { symbol: sym, history, error: null as string | null };
      } catch (e) {
        return {
          symbol: sym,
          history: [] as EodRecord[],
          error: e instanceof Error ? e.message : "Failed to load",
        };
      }
    }),
  );

  const usable = results.filter((r) => r.history.length > 0);
  const failed = results.filter((r) => r.history.length === 0);
  const series: CompareSeries[] = usable.map((r) => ({
    symbol: r.symbol,
    history: r.history,
  }));

  const headline =
    symbols.length === 2
      ? `${symbols[0]} vs ${symbols[1]}`
      : symbols.join(" vs ");

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6">
      <nav className="text-sm text-(--color-text-muted)">
        <Link
          href="/compare"
          className="transition-colors hover:text-(--color-brand)"
        >
          Compare
        </Link>{" "}
        <span className="text-(--color-text-dim)">/</span>{" "}
        <span className="text-(--color-text)">{headline}</span>
      </nav>

      <header className="space-y-2 border-b border-(--color-border) pb-4">
        <h1 className="text-3xl font-semibold">{headline}</h1>
        <p className="text-sm text-(--color-text-muted) max-w-3xl">
          90-day comparison indexed to 100 at the start. Each ticker links to
          its detailed page.
        </p>
      </header>

      {failed.length > 0 && (
        <ErrorBanner
          message={`Couldn't load: ${failed.map((f) => f.symbol).join(", ")}`}
        />
      )}

      <ComparePicker current={symbols} />

      {series.length > 0 && (
        <>
          <CompareChart series={series} />

          {/* Individual candlestick charts */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">
              Individual price charts
            </h2>
            <div className="grid gap-4 xl:grid-cols-2">
              {usable.map((r) => {
                const meta = STOCKS_BY_SYMBOL[r.symbol];
                return (
                  <div key={r.symbol} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TickerIcon
                        symbol={r.symbol}
                        domain={meta?.domain}
                        size={24}
                      />
                      <Link
                        href={`/stock/${r.symbol}`}
                        className="text-sm font-semibold transition-colors hover:text-(--color-brand)"
                      >
                        {r.symbol}
                        <span className="ml-1.5 font-normal text-(--color-text-muted)">
                          {meta?.name ?? r.history[0]?.name}
                        </span>
                      </Link>
                    </div>
                    <CandlestickChart history={r.history} />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {usable.map((r) => (
              <CompareCard key={r.symbol} symbol={r.symbol} history={r.history} />
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Side-by-side metrics</h2>
            <div className="overflow-x-auto rounded-xl border border-(--color-border) bg-(--color-surface) scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-(--color-text-muted)">
                  <tr className="border-b border-(--color-border)">
                    <th className="px-4 py-3 text-left font-normal">Metric</th>
                    {usable.map((r) => (
                      <th
                        key={r.symbol}
                        className="px-4 py-3 text-right font-normal"
                      >
                        {r.symbol}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-border)/60">
                  <MetricRow
                    label="Latest close"
                    rows={usable}
                    pick={(r) => `$${formatPlainPrice(r.history[0].close)}`}
                  />
                  <MetricRow
                    label="Day change"
                    rows={usable}
                    pick={(r) => {
                      const c = changePercent(
                        r.history[0].open,
                        r.history[0].close,
                      );
                      return {
                        text: formatPercent(c),
                        tone: c >= 0 ? "up" : "down",
                      };
                    }}
                  />
                  <MetricRow
                    label="90d return"
                    rows={usable}
                    pick={(r) => {
                      const sorted = [...r.history].sort(
                        (a, b) =>
                          new Date(a.date).getTime() -
                          new Date(b.date).getTime(),
                      );
                      const c = changePercent(
                        sorted[0].close,
                        sorted[sorted.length - 1].close,
                      );
                      return {
                        text: formatPercent(c),
                        tone: c >= 0 ? "up" : "down",
                      };
                    }}
                  />
                  <MetricRow
                    label="90d high"
                    rows={usable}
                    pick={(r) =>
                      `$${formatPlainPrice(Math.max(...r.history.map((h) => h.high)))}`
                    }
                  />
                  <MetricRow
                    label="90d low"
                    rows={usable}
                    pick={(r) =>
                      `$${formatPlainPrice(Math.min(...r.history.map((h) => h.low)))}`
                    }
                  />
                  <MetricRow
                    label="Avg volume"
                    rows={usable}
                    pick={(r) =>
                      formatCompact(
                        r.history.reduce((s, h) => s + h.volume, 0) /
                          r.history.length,
                      )
                    }
                  />
                  <MetricRow
                    label="Sector"
                    rows={usable}
                    pick={(r) => STOCKS_BY_SYMBOL[r.symbol]?.sector ?? "—"}
                  />
                  <MetricRow
                    label="Exchange"
                    rows={usable}
                    pick={(r) =>
                      r.history[0].exchange_code ?? r.history[0].exchange
                    }
                  />
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {series.length === 0 && failed.length === results.length && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-10 text-center">
          <div className="text-lg font-semibold">
            No data for any of these tickers
          </div>
          <p className="mt-2 text-sm text-(--color-text-muted)">
            Try a different combination from the picker above.
          </p>
        </div>
      )}
    </div>
  );
}

function MetricRow({
  label,
  rows,
  pick,
}: {
  label: string;
  rows: { symbol: string; history: EodRecord[] }[];
  pick: (
    r: { symbol: string; history: EodRecord[] },
  ) => string | { text: string; tone?: "up" | "down" };
}) {
  return (
    <tr className="hover:bg-(--color-surface-2)">
      <td className="px-4 py-3 text-(--color-text-muted)">{label}</td>
      {rows.map((r) => {
        const v = pick(r);
        const text = typeof v === "string" ? v : v.text;
        const tone = typeof v === "string" ? undefined : v.tone;
        return (
          <td
            key={r.symbol}
            className={`px-4 py-3 text-right tabular ${
              tone === "up"
                ? "text-(--color-up)"
                : tone === "down"
                  ? "text-(--color-down)"
                  : ""
            }`}
          >
            {text}
          </td>
        );
      })}
    </tr>
  );
}

function CompareCard({
  symbol,
  history,
}: {
  symbol: string;
  history: EodRecord[];
}) {
  const latest = history[0];
  const meta = STOCKS_BY_SYMBOL[symbol];
  const change = changePercent(latest.open, latest.close);
  const sortedAsc = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const periodChange = changePercent(
    sortedAsc[0].close,
    sortedAsc[sortedAsc.length - 1].close,
  );
  return (
    <Link
      href={`/stock/${symbol}`}
      className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 transition-colors hover:border-(--color-brand)/60 hover:bg-(--color-surface-2)"
    >
      <div className="flex items-center gap-3">
        <TickerIcon symbol={symbol} domain={meta?.domain} size={36} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{symbol}</div>
          <div className="truncate text-xs text-(--color-text-muted)">
            {meta?.name ?? latest.name}
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold tabular">
            ${formatPlainPrice(latest.close)}
          </div>
          <div
            className={`text-xs tabular font-medium ${
              change >= 0 ? "text-(--color-up)" : "text-(--color-down)"
            }`}
          >
            {formatPercent(change)}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-(--color-text-muted)">90d return</div>
          <div
            className={`mt-0.5 font-medium tabular ${
              periodChange >= 0
                ? "text-(--color-up)"
                : "text-(--color-down)"
            }`}
          >
            {formatPercent(periodChange)}
          </div>
        </div>
        <div>
          <div className="text-(--color-text-muted)">Volume</div>
          <div className="mt-0.5 font-medium tabular">
            {formatCompact(latest.volume)}
          </div>
        </div>
      </div>
    </Link>
  );
}
