import type { EodRecord } from "@/lib/marketstack";
import { changePercent, formatCompact } from "@/lib/format";

export function MarketStatsBar({ records }: { records: EodRecord[] }) {
  if (records.length === 0) return null;

  const totalVolume = records.reduce((sum, r) => sum + r.volume, 0);
  const advancers = records.filter(
    (r) => changePercent(r.open, r.close) > 0,
  ).length;
  const decliners = records.length - advancers;
  const latestDate = records[0]?.date;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-(--color-text-muted)">
      <span>
        Tracking{" "}
        <span className="text-(--color-text) font-medium">{records.length}</span>{" "}
        tickers
      </span>
      <span>
        <span className="text-(--color-up) font-medium">▲ {advancers}</span>{" "}
        advancing
      </span>
      <span>
        <span className="text-(--color-down) font-medium">▼ {decliners}</span>{" "}
        declining
      </span>
      <span>
        Total volume{" "}
        <span className="text-(--color-text) font-medium tabular">
          {formatCompact(totalVolume)}
        </span>
      </span>
      {latestDate && (
        <span>
          As of{" "}
          <span className="text-(--color-text) tabular">
            {new Date(latestDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </span>
      )}
    </div>
  );
}
