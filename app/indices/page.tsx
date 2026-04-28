import Link from "next/link";
import { fetchLatestEod, type EodRecord } from "@/lib/marketstack";
import { TRACKED_SYMBOLS } from "@/lib/stocks";
import { aggregateBySector, type SectorAggregate } from "@/lib/aggregations";
import { changePercent, formatCompact, formatPercent } from "@/lib/format";
import { MarketStatsBar } from "@/components/market-stats-bar";
import { ErrorBanner } from "@/components/error-banner";
import { LiveRefresh } from "@/components/live-refresh";

export const revalidate = 65;

export const metadata = {
  title: "Indices — StockoMeter",
};

type Index = {
  name: string;
  description: string;
  records: EodRecord[];
};

export default async function IndicesPage() {
  let records: EodRecord[] = [];
  let error: string | null = null;
  try {
    records = await fetchLatestEod(TRACKED_SYMBOLS);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load market data";
  }

  const sectors = aggregateBySector(records);

  const composite: Index = {
    name: "StockoMeter Composite",
    description: "Equal-weighted index of every ticker we track.",
    records,
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6">
      <header className="space-y-2 border-b border-(--color-border) pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-3xl font-semibold">Indices</h1>
          <LiveRefresh intervalMs={65_000} />
        </div>
        <p className="text-sm text-(--color-text-muted) max-w-3xl">
          Synthetic equal-weighted indices computed live from the StockoMeter
          universe. Each index value is the average close of its constituents.
        </p>
        <MarketStatsBar records={records} />
      </header>

      {error && <ErrorBanner message={error} />}

      {!error && records.length > 0 && (
        <>
          <section className="rounded-xl border border-(--color-brand)/40 bg-(--color-brand)/5 p-6">
            <CompositeRow index={composite} headline />
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Sector Indices</h2>
            <div className="overflow-x-auto rounded-xl border border-(--color-border) bg-(--color-surface) scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-(--color-text-muted)">
                  <tr className="border-b border-(--color-border)">
                    <th className="px-4 py-3 text-left font-normal">Index</th>
                    <th className="px-4 py-3 text-right font-normal">Value</th>
                    <th className="px-4 py-3 text-right font-normal">
                      Day Change
                    </th>
                    <th className="px-4 py-3 text-right font-normal">
                      Constituents
                    </th>
                    <th className="px-4 py-3 text-right font-normal">
                      Adv / Dec
                    </th>
                    <th className="px-4 py-3 text-right font-normal">
                      Total Volume
                    </th>
                    <th className="px-4 py-3 text-right font-normal">Top</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-border)/60">
                  {sectors.map((s) => (
                    <SectorIndexRow key={s.sector} agg={s} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function indexValue(records: EodRecord[]): number {
  if (records.length === 0) return 0;
  return records.reduce((s, r) => s + r.close, 0) / records.length;
}

function indexChange(records: EodRecord[]): number {
  if (records.length === 0) return 0;
  const sum = records.reduce((s, r) => s + changePercent(r.open, r.close), 0);
  return sum / records.length;
}

function CompositeRow({ index, headline }: { index: Index; headline?: boolean }) {
  const value = indexValue(index.records);
  const change = indexChange(index.records);
  const positive = change >= 0;
  const advancers = index.records.filter(
    (r) => changePercent(r.open, r.close) > 0,
  ).length;
  const totalVol = index.records.reduce((s, r) => s + r.volume, 0);

  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-(--color-brand)">
          Composite
        </div>
        <h2
          className={`mt-1 font-semibold ${headline ? "text-2xl" : "text-lg"}`}
        >
          {index.name}
        </h2>
        <p className="mt-1 text-sm text-(--color-text-muted) max-w-xl">
          {index.description}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
        <Stat label="Value" value={value.toFixed(2)} />
        <Stat
          label="Day Change"
          value={formatPercent(change)}
          tone={positive ? "up" : "down"}
        />
        <Stat
          label="Advancers"
          value={`${advancers} / ${index.records.length}`}
        />
        <Stat label="Volume" value={formatCompact(totalVol)} />
      </div>
    </div>
  );
}

function SectorIndexRow({ agg }: { agg: SectorAggregate }) {
  const value = indexValue(agg.records);
  const change = indexChange(agg.records);
  const positive = change >= 0;
  return (
    <tr className="hover:bg-(--color-surface-2)">
      <td className="px-4 py-3">
        <div className="font-semibold">StockoMeter {agg.sector}</div>
        <div className="text-xs text-(--color-text-muted)">
          Equal-weighted · {agg.count} stocks
        </div>
      </td>
      <td className="px-4 py-3 text-right tabular font-medium">
        {value.toFixed(2)}
      </td>
      <td
        className={`px-4 py-3 text-right tabular font-medium ${
          positive ? "text-(--color-up)" : "text-(--color-down)"
        }`}
      >
        {formatPercent(change)}
      </td>
      <td className="px-4 py-3 text-right tabular text-(--color-text-muted)">
        {agg.count}
      </td>
      <td className="px-4 py-3 text-right text-xs">
        <span className="text-(--color-up)">▲ {agg.advancers}</span>
        <span className="mx-1 text-(--color-text-dim)">/</span>
        <span className="text-(--color-down)">▼ {agg.decliners}</span>
      </td>
      <td className="px-4 py-3 text-right tabular text-(--color-text-muted)">
        {formatCompact(agg.totalVolume)}
      </td>
      <td className="px-4 py-3 text-right">
        {agg.topPerformer && (
          <Link
            href={`/stock/${agg.topPerformer.symbol}`}
            className="text-(--color-brand) hover:underline"
          >
            {agg.topPerformer.symbol}{" "}
            <span className="text-(--color-up) tabular">
              {formatPercent(agg.topPerformer.change)}
            </span>
          </Link>
        )}
      </td>
    </tr>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  const color =
    tone === "up"
      ? "text-(--color-up)"
      : tone === "down"
        ? "text-(--color-down)"
        : "text-(--color-text)";
  return (
    <div>
      <div className="text-xs text-(--color-text-muted)">{label}</div>
      <div className={`mt-0.5 font-medium tabular ${color}`}>{value}</div>
    </div>
  );
}
