import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchLatestEod, type EodRecord } from "@/lib/marketstack";
import { STOCKS_BY_SYMBOL, TRACKED_SYMBOLS } from "@/lib/stocks";
import {
  changePercent,
  formatCompact,
  formatPercent,
  formatPlainPrice,
} from "@/lib/format";
import { TickerIcon } from "@/components/ticker-icon";
import { ErrorBanner } from "@/components/error-banner";
import { LiveRefresh } from "@/components/live-refresh";

export const revalidate = 65;

type Category = "hot" | "active" | "gainers" | "volume";

const CONFIG: Record<
  Category,
  { title: string; description: string; subtitle: string }
> = {
  hot: {
    title: "Hot Stocks",
    description:
      "The most-watched names on StockoMeter — high-cap, high-attention tickers with deep liquidity.",
    subtitle: "Popular tickers ranked by today's volume",
  },
  active: {
    title: "Active Stocks",
    description:
      "Active mid-cap and high-cap names trading meaningful volume today — beyond the usual mega-caps.",
    subtitle: "Movers ranked by 24h volume (excluding the top 3)",
  },
  gainers: {
    title: "Top Gainers & Losers",
    description:
      "Today's biggest movers — winners up top, losers below.",
    subtitle: "Sorted by today's change (close vs open)",
  },
  volume: {
    title: "Top Volume",
    description:
      "Where the money flowed today. Volume tells you which names the street is paying attention to.",
    subtitle: "Sorted by 24h share volume",
  },
};

const POPULAR = [
  "AAPL",
  "NVDA",
  "TSLA",
  "MSFT",
  "GOOGL",
  "META",
  "AMZN",
  "AMD",
];

const VALID: Category[] = ["hot", "active", "gainers", "volume"];

function isCategory(value: string): value is Category {
  return (VALID as string[]).includes(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCategory(category)) return { title: "Movers — StockoMeter" };
  const cfg = CONFIG[category];
  return {
    title: `${cfg.title} — StockoMeter`,
    description: cfg.description,
  };
}

export default async function MoversPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCategory(category)) notFound();
  const cfg = CONFIG[category];

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
    sector: STOCKS_BY_SYMBOL[r.symbol]?.sector,
  }));

  type Row = (typeof enriched)[number];

  let primary: Row[] = [];
  let secondary: Row[] = [];
  let secondaryTitle: string | null = null;

  switch (category) {
    case "hot": {
      const popularSet = new Set(POPULAR);
      primary = enriched
        .filter((r) => popularSet.has(r.symbol))
        .sort((a, b) => b.volume - a.volume);
      break;
    }
    case "active": {
      const sorted = [...enriched].sort((a, b) => b.volume - a.volume);
      primary = sorted.slice(3);
      break;
    }
    case "gainers": {
      const sorted = [...enriched].sort((a, b) => b.change - a.change);
      primary = sorted.filter((r) => r.change > 0);
      secondary = [...sorted].filter((r) => r.change < 0).reverse();
      secondaryTitle = "Top Losers";
      break;
    }
    case "volume": {
      primary = [...enriched].sort((a, b) => b.volume - a.volume);
      break;
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6">
      <nav className="text-sm text-(--color-text-muted)">
        <Link href="/" className="transition-colors hover:text-(--color-brand)">
          Markets
        </Link>{" "}
        <span className="text-(--color-text-dim)">/</span>{" "}
        <span className="text-(--color-text)">{cfg.title}</span>
      </nav>

      <header className="space-y-2 border-b border-(--color-border) pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">{cfg.title}</h1>
            <p className="mt-1 text-sm text-(--color-text-muted) max-w-3xl">
              {cfg.description}
            </p>
          </div>
          <LiveRefresh />
        </div>
        <p className="text-xs text-(--color-text-dim)">{cfg.subtitle}</p>
      </header>

      {error && <ErrorBanner message={error} />}

      <CategoryNav active={category} />

      {!error && primary.length > 0 && (
        <MoversTable
          title={category === "gainers" ? "Top Gainers" : null}
          rows={primary}
          tone={category === "gainers" ? "up" : null}
        />
      )}

      {!error && secondary.length > 0 && secondaryTitle && (
        <MoversTable
          title={secondaryTitle}
          rows={secondary}
          tone="down"
        />
      )}

      {!error && primary.length === 0 && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-10 text-center text-(--color-text-muted)">
          Nothing in this bucket today.
        </div>
      )}
    </div>
  );
}

function CategoryNav({ active }: { active: Category }) {
  const items: { key: Category; label: string }[] = [
    { key: "hot", label: "Hot" },
    { key: "active", label: "Active" },
    { key: "gainers", label: "Gainers & Losers" },
    { key: "volume", label: "Top Volume" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            href={`/movers/${item.key}`}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              isActive
                ? "bg-(--color-brand) text-white"
                : "bg-(--color-surface) text-(--color-text-muted) hover:text-(--color-text)"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

type MoversRow = EodRecord & {
  change: number;
  sector: string | undefined;
};

function MoversTable({
  title,
  rows,
  tone,
}: {
  title: string | null;
  rows: MoversRow[];
  tone: "up" | "down" | null;
}) {
  return (
    <section className="space-y-3">
      {title && (
        <h2
          className={`text-lg font-semibold ${
            tone === "up"
              ? "text-(--color-up)"
              : tone === "down"
                ? "text-(--color-down)"
                : ""
          }`}
        >
          {title}
        </h2>
      )}
      <div className="overflow-x-auto rounded-xl border border-(--color-border) bg-(--color-surface) scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-(--color-text-muted)">
            <tr className="border-b border-(--color-border)">
              <th className="px-4 py-3 text-left font-normal">#</th>
              <th className="px-4 py-3 text-left font-normal">Ticker</th>
              <th className="px-4 py-3 text-left font-normal">Sector</th>
              <th className="px-4 py-3 text-right font-normal">Price</th>
              <th className="px-4 py-3 text-right font-normal">Change</th>
              <th className="px-4 py-3 text-right font-normal">Day Range</th>
              <th className="px-4 py-3 text-right font-normal">Volume</th>
              <th className="px-4 py-3 text-right font-normal"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border)/60">
            {rows.map((r, i) => {
              const positive = r.change >= 0;
              const meta = STOCKS_BY_SYMBOL[r.symbol];
              return (
                <tr
                  key={r.symbol}
                  className="transition-colors hover:bg-(--color-surface-2)"
                >
                  <td className="px-4 py-3 text-(--color-text-dim) tabular text-xs">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/stock/${r.symbol}`}
                      className="flex items-center gap-3"
                    >
                      <TickerIcon
                        symbol={r.symbol}
                        domain={meta?.domain}
                        size={28}
                      />
                      <div>
                        <div className="font-semibold">{r.symbol}</div>
                        <div className="text-xs text-(--color-text-muted)">
                          {meta?.name ?? r.name}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-(--color-text-muted)">
                    {r.sector ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular">
                    ${formatPlainPrice(r.close)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular font-medium ${
                      positive ? "text-(--color-up)" : "text-(--color-down)"
                    }`}
                  >
                    {formatPercent(r.change)}
                  </td>
                  <td className="px-4 py-3 text-right tabular text-(--color-text-muted)">
                    ${formatPlainPrice(r.low)} – ${formatPlainPrice(r.high)}
                  </td>
                  <td className="px-4 py-3 text-right tabular text-(--color-text-muted)">
                    {formatCompact(r.volume)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/stock/${r.symbol}`}
                      className="text-xs text-(--color-brand) hover:underline"
                    >
                      Details →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
