import { ComparePicker } from "@/components/compare-picker";

export const metadata = {
  title: "Compare Stocks — StockoMeter",
  description:
    "Compare any two or more stocks side by side: price, change, volume, 90-day performance.",
};

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6">
      <header className="space-y-2 border-b border-(--color-border) pb-4">
        <h1 className="text-3xl font-semibold">Compare Stocks</h1>
        <p className="text-sm text-(--color-text-muted) max-w-3xl">
          Pick two or more tickers — we&apos;ll line them up: latest price, day
          change, 90-day return, an indexed performance chart, and a side-by-side
          stat grid. Every comparison gets its own permalink.
        </p>
      </header>

      <ComparePicker current={[]} />

      <section className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
        <h2 className="text-base font-semibold">Quick comparisons</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          {QUICK_PAIRS.map((p) => (
            <li key={p.href}>
              <a
                href={p.href}
                className="flex items-center justify-between rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2 transition-colors hover:border-(--color-brand) hover:text-(--color-brand)"
              >
                <span className="font-medium">{p.label}</span>
                <span className="text-(--color-text-muted)">→</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const QUICK_PAIRS = [
  { label: "AAPL vs MSFT", href: "/compare/AAPL-vs-MSFT" },
  { label: "NVDA vs AMD", href: "/compare/NVDA-vs-AMD" },
  { label: "GOOGL vs META", href: "/compare/GOOGL-vs-META" },
  { label: "TSLA vs F vs GM", href: "/compare/TSLA-F-GM" },
  { label: "JPM vs BAC vs GS", href: "/compare/JPM-BAC-GS" },
  { label: "KO vs PEP", href: "/compare/KO-vs-PEP" },
  { label: "V vs MA", href: "/compare/V-vs-MA" },
  { label: "XOM vs CVX", href: "/compare/XOM-vs-CVX" },
  { label: "AMZN vs WMT vs DIS", href: "/compare/AMZN-WMT-DIS" },
];
