import Link from "next/link";
import { fetchLatestEod, type EodRecord } from "@/lib/marketstack";
import {
  STOCKS_BY_SYMBOL,
  TRACKED_SYMBOLS,
  SECTORS,
  type Sector,
} from "@/lib/stocks";
import {
  changePercent,
  formatCompact,
  formatPercent,
  formatPlainPrice,
} from "@/lib/format";
import { TickerIcon } from "@/components/ticker-icon";
import { ErrorBanner } from "@/components/error-banner";
import {
  ScreenerFilters,
  type ScreenerParams,
} from "@/components/screener-filters";
import { LiveRefresh } from "@/components/live-refresh";
import { ScreenerTable } from "@/components/screener-table";

export const revalidate = 65;

type RawSearchParams = Record<string, string | string[] | undefined>;

function parseParams(raw: RawSearchParams): ScreenerParams {
  const get = (k: string) => {
    const v = raw[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const num = (k: string): number | null => {
    const v = get(k);
    if (v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const sectorsParam = get("sectors") ?? "";
  const sectors = sectorsParam
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is Sector => SECTORS.includes(s as Sector));

  const sortRaw = get("sort");
  const sort: ScreenerParams["sort"] =
    sortRaw === "price" ||
    sortRaw === "volume" ||
    sortRaw === "name" ||
    sortRaw === "change"
      ? sortRaw
      : "change";

  const dir: ScreenerParams["dir"] = get("dir") === "asc" ? "asc" : "desc";

  return {
    sectors,
    minPrice: num("min"),
    maxPrice: num("max"),
    minChange: num("change_min"),
    maxChange: num("change_max"),
    minVolume: num("volume_min"),
    sort,
    dir,
  };
}

export type ScreenerRow = {
  symbol: string;
  name: string;
  sector: Sector | undefined;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  exchange: string;
};

function applyFilters(
  records: EodRecord[],
  params: ScreenerParams,
): ScreenerRow[] {
  const enriched: ScreenerRow[] = records.map((r) => ({
    symbol: r.symbol,
    name: STOCKS_BY_SYMBOL[r.symbol]?.name ?? r.name,
    sector: STOCKS_BY_SYMBOL[r.symbol]?.sector,
    close: r.close,
    open: r.open,
    high: r.high,
    low: r.low,
    volume: r.volume,
    change: changePercent(r.open, r.close),
    exchange: r.exchange_code ?? r.exchange,
  }));

  return enriched.filter((r) => {
    if (params.sectors.length > 0) {
      if (!r.sector || !params.sectors.includes(r.sector)) return false;
    }
    if (params.minPrice !== null && r.close < params.minPrice) return false;
    if (params.maxPrice !== null && r.close > params.maxPrice) return false;
    if (params.minChange !== null && r.change < params.minChange) return false;
    if (params.maxChange !== null && r.change > params.maxChange) return false;
    if (params.minVolume !== null && r.volume < params.minVolume) return false;
    return true;
  });
}

function sortRows(rows: ScreenerRow[], params: ScreenerParams): ScreenerRow[] {
  const dirMul = params.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    switch (params.sort) {
      case "price":
        return (a.close - b.close) * dirMul;
      case "volume":
        return (a.volume - b.volume) * dirMul;
      case "name":
        return a.symbol.localeCompare(b.symbol) * dirMul;
      case "change":
      default:
        return (a.change - b.change) * dirMul;
    }
  });
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = parseParams(await searchParams);
  const bits: string[] = [];
  if (params.sectors.length === 1) bits.push(params.sectors[0]);
  else if (params.sectors.length > 1)
    bits.push(`${params.sectors.length} sectors`);
  if (params.minPrice !== null && params.maxPrice !== null)
    bits.push(`$${params.minPrice}–$${params.maxPrice}`);
  else if (params.minPrice !== null) bits.push(`over $${params.minPrice}`);
  else if (params.maxPrice !== null) bits.push(`under $${params.maxPrice}`);
  if (params.minChange !== null && params.minChange > 0)
    bits.push(`up >${params.minChange}%`);
  if (params.maxChange !== null && params.maxChange < 0)
    bits.push(`down <${params.maxChange}%`);

  const title =
    bits.length > 0
      ? `${bits.join(" · ")} — Stock Screener · StockoMeter`
      : "Stock Screener — StockoMeter";

  return {
    title,
    description:
      "Filter US stocks by sector, price, volume, day change and more. Every filter combination is a shareable URL.",
  };
}

export default async function ScreenerPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const params = parseParams(raw);

  let records: EodRecord[] = [];
  let error: string | null = null;
  try {
    records = await fetchLatestEod(TRACKED_SYMBOLS);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load market data";
  }

  const filtered = applyFilters(records, params);
  const sorted = sortRows(filtered, params);

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6">
      <header className="space-y-2 border-b border-(--color-border) pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Stock Screener</h1>
            <p className="mt-1 text-sm text-(--color-text-muted) max-w-3xl">
              Find stocks that match your thesis. Filters live in the URL —
              every screen is a permalink you can share or bookmark.
            </p>
          </div>
          <LiveRefresh />
        </div>
      </header>

      {error && <ErrorBanner message={error} />}

      <ScreenerFilters
        initial={params}
        totalCount={records.length}
        matchCount={sorted.length}
      />

      {sorted.length === 0 && !error && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-10 text-center">
          <div className="text-lg font-semibold">No matches</div>
          <p className="mt-2 text-sm text-(--color-text-muted) max-w-md mx-auto">
            Loosen your filters — try removing the sector restriction or
            widening the price range.
          </p>
        </div>
      )}

      {sorted.length > 0 && <ScreenerTable rows={sorted} />}
    </div>
  );
}
