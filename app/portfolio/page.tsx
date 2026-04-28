import { fetchLatestEod, type EodRecord } from "@/lib/marketstack";
import { TRACKED_SYMBOLS } from "@/lib/stocks";
import { ErrorBanner } from "@/components/error-banner";
import { LiveRefresh } from "@/components/live-refresh";
import dynamic from "next/dynamic";

const PortfolioDashboard = dynamic(
  () => import("@/components/portfolio-dashboard").then((mod) => mod.PortfolioDashboard)
);
export const revalidate = 65;

export const metadata = {
  title: "Portfolio Tracker — StockoMeter",
  description:
    "Track your stock portfolio in real time. Login-free, stored in your browser. Add holdings, see total value, daily P&L, and allocation.",
};

export default async function PortfolioPage() {
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
          <div>
            <h1 className="text-3xl font-semibold">Portfolio Tracker</h1>
            <p className="mt-1 text-sm text-(--color-text-muted) max-w-3xl">
              Track your holdings in real time. Everything stays in your
              browser — no login required.
            </p>
          </div>
          <LiveRefresh intervalMs={65_000} />
        </div>
      </header>

      {error && <ErrorBanner message={error} />}

      {!error && <PortfolioDashboard records={records} />}
    </div>
  );
}
