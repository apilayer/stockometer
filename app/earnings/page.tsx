import Link from "next/link";
import { STOCKS_BY_SYMBOL } from "@/lib/stocks";
import { getUpcomingEarnings, getEarningsForMonth, type EarningsDate } from "@/lib/earnings";
import { TickerIcon } from "@/components/ticker-icon";

export const metadata = {
  title: "Earnings Calendar — StockoMeter",
  description:
    "Estimated earnings dates for major US stocks. See which companies report this month and plan your trading around earnings season.",
};

export default function EarningsPage() {
  const now = new Date();
  const upcoming = getUpcomingEarnings(60);
  const thisMonth = getEarningsForMonth(now.getFullYear(), now.getMonth());
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonth = getEarningsForMonth(nextMonthDate.getFullYear(), nextMonthDate.getMonth());

  const monthLabel = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6">
      <header className="space-y-2 border-b border-(--color-border) pb-4">
        <h1 className="text-3xl font-semibold">Earnings Calendar</h1>
        <p className="text-sm text-(--color-text-muted) max-w-3xl">
          Estimated earnings report dates for tracked stocks. Plan around
          earnings season to manage volatility.
        </p>
      </header>

      {/* Upcoming section */}
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Upcoming ({upcoming.length} reports in the next 60 days)
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {upcoming.map((e) => (
              <EarningsCard key={`${e.symbol}-${e.date}`} entry={e} />
            ))}
          </div>
        </section>
      )}

      {/* This month */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{monthLabel(now)}</h2>
        {thisMonth.length > 0 ? (
          <MonthGrid entries={thisMonth} year={now.getFullYear()} month={now.getMonth()} />
        ) : (
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-8 text-center text-(--color-text-muted)">
            No earnings reports estimated for {monthLabel(now)}.
          </div>
        )}
      </section>

      {/* Next month */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{monthLabel(nextMonthDate)}</h2>
        {nextMonth.length > 0 ? (
          <MonthGrid
            entries={nextMonth}
            year={nextMonthDate.getFullYear()}
            month={nextMonthDate.getMonth()}
          />
        ) : (
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-8 text-center text-(--color-text-muted)">
            No earnings reports estimated for {monthLabel(nextMonthDate)}.
          </div>
        )}
      </section>

      <p className="text-xs text-(--color-text-dim) text-center">
        ⚠️ All dates are estimates based on historical reporting patterns.
        Actual dates may differ by ±1 week. Not financial advice.
      </p>
    </div>
  );
}

function EarningsCard({ entry }: { entry: EarningsDate }) {
  const meta = STOCKS_BY_SYMBOL[entry.symbol];
  const d = new Date(entry.date);
  const dateStr = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const isToday =
    d.toDateString() === new Date().toDateString();
  const isPast = d < new Date();

  return (
    <Link
      href={`/stock/${entry.symbol}`}
      className={`flex items-center gap-3 rounded-xl border bg-(--color-surface) p-3 transition-colors hover:border-(--color-brand)/60 hover:bg-(--color-surface-2) ${
        isToday
          ? "border-(--color-brand)"
          : isPast
            ? "border-(--color-border) opacity-60"
            : "border-(--color-border)"
      }`}
    >
      <TickerIcon symbol={entry.symbol} size={32} domain={meta?.domain} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{entry.symbol}</span>
          <span className="rounded-full bg-(--color-surface-2) px-1.5 py-0.5 text-[10px] text-(--color-text-muted)">
            {entry.quarter}
          </span>
          {isToday && (
            <span className="rounded-full bg-(--color-brand)/15 px-1.5 py-0.5 text-[10px] font-medium text-(--color-brand)">
              Today
            </span>
          )}
        </div>
        <div className="text-xs text-(--color-text-muted) truncate">
          {meta?.name}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium tabular">{dateStr}</div>
        <div className="text-[10px] text-(--color-text-dim)">Est.</div>
      </div>
    </Link>
  );
}

function MonthGrid({
  entries,
  year,
  month,
}: {
  entries: EarningsDate[];
  year: number;
  month: number;
}) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0=Sun
  const totalDays = lastDay.getDate();

  // Group entries by day
  const byDay: Record<number, EarningsDate[]> = {};
  for (const e of entries) {
    const d = new Date(e.date).getDate();
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(e);
  }

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const cells: (number | null)[] = [];
  // Leading blanks for start-of-week offset
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 text-center text-[11px] uppercase tracking-wider text-(--color-text-muted) border-b border-(--color-border) py-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null)
            return <div key={`blank-${i}`} className="border-b border-r border-(--color-border)/30 p-2 min-h-[70px]" />;

          const dayEntries = byDay[day] ?? [];
          const isWeekend = new Date(year, month, day).getDay() % 6 === 0;
          const isTodayCell = isCurrentMonth && day === todayDate;

          return (
            <div
              key={day}
              className={`border-b border-r border-(--color-border)/30 p-1.5 min-h-[70px] ${
                isWeekend ? "bg-(--color-bg)/50" : ""
              } ${isTodayCell ? "bg-(--color-brand)/5" : ""}`}
            >
              <div
                className={`text-xs tabular mb-1 ${
                  isTodayCell
                    ? "font-bold text-(--color-brand)"
                    : "text-(--color-text-muted)"
                }`}
              >
                {day}
              </div>
              <div className="flex flex-wrap gap-0.5">
                {dayEntries.map((e) => (
                  <Link
                    key={e.symbol}
                    href={`/stock/${e.symbol}`}
                    className="flex items-center gap-1 rounded bg-(--color-surface-2) px-1 py-0.5 text-[10px] font-medium transition-colors hover:bg-(--color-brand)/20 hover:text-(--color-brand)"
                    title={`${e.symbol} ${e.quarter} earnings (est.)`}
                  >
                    <TickerIcon symbol={e.symbol} size={12} />
                    {e.symbol}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
