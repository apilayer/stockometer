import { fetchLatestEod, type EodRecord } from "@/lib/marketstack";
import { TRACKED_SYMBOLS } from "@/lib/stocks";
import { LiveRefresh } from "@/components/live-refresh";
import { ErrorBanner } from "@/components/error-banner";
import dynamic from "next/dynamic";

const AlertsDashboard = dynamic(
  () => import("@/components/alerts-dashboard").then((mod) => mod.AlertsDashboard)
);
export const revalidate = 65;

export const metadata = {
  title: "Price Alerts — StockoMeter",
  description:
    "Set price alerts for any tracked stock. Get browser notifications when your target price is hit. No sign-up required.",
};

export default async function AlertsPage() {
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
            <h1 className="text-3xl font-semibold">Price Alerts</h1>
            <p className="mt-1 text-sm text-(--color-text-muted) max-w-3xl">
              Set target prices and get notified when they&apos;re hit. Alerts
              are stored in your browser — no sign-up needed.
            </p>
          </div>
          <LiveRefresh intervalMs={65_000} />
        </div>
      </header>

      {error && <ErrorBanner message={error} />}

      {!error && <AlertsDashboard records={records} />}
    </div>
  );
}
