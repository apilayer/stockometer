export type EarningsDate = {
  symbol: string;
  /** ISO date string YYYY-MM-DD */
  date: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  isEstimate: true;
};

/**
 * Estimated quarterly earnings dates for FY2026 based on historical reporting cadence.
 * All dates are approximate (±1 week). Clearly labeled as estimates.
 */
export const EARNINGS_DATES: EarningsDate[] = [
  // Tech
  { symbol: "AAPL", date: "2026-01-30", quarter: "Q1", isEstimate: true },
  { symbol: "AAPL", date: "2026-05-01", quarter: "Q2", isEstimate: true },
  { symbol: "AAPL", date: "2026-07-31", quarter: "Q3", isEstimate: true },
  { symbol: "AAPL", date: "2026-10-29", quarter: "Q4", isEstimate: true },

  { symbol: "MSFT", date: "2026-01-28", quarter: "Q1", isEstimate: true },
  { symbol: "MSFT", date: "2026-04-22", quarter: "Q2", isEstimate: true },
  { symbol: "MSFT", date: "2026-07-22", quarter: "Q3", isEstimate: true },
  { symbol: "MSFT", date: "2026-10-27", quarter: "Q4", isEstimate: true },

  { symbol: "GOOGL", date: "2026-02-04", quarter: "Q1", isEstimate: true },
  { symbol: "GOOGL", date: "2026-04-29", quarter: "Q2", isEstimate: true },
  { symbol: "GOOGL", date: "2026-07-28", quarter: "Q3", isEstimate: true },
  { symbol: "GOOGL", date: "2026-10-27", quarter: "Q4", isEstimate: true },

  { symbol: "AMZN", date: "2026-02-05", quarter: "Q1", isEstimate: true },
  { symbol: "AMZN", date: "2026-04-30", quarter: "Q2", isEstimate: true },
  { symbol: "AMZN", date: "2026-08-04", quarter: "Q3", isEstimate: true },
  { symbol: "AMZN", date: "2026-10-29", quarter: "Q4", isEstimate: true },

  { symbol: "META", date: "2026-01-29", quarter: "Q1", isEstimate: true },
  { symbol: "META", date: "2026-04-23", quarter: "Q2", isEstimate: true },
  { symbol: "META", date: "2026-07-30", quarter: "Q3", isEstimate: true },
  { symbol: "META", date: "2026-10-28", quarter: "Q4", isEstimate: true },

  { symbol: "NVDA", date: "2026-02-26", quarter: "Q1", isEstimate: true },
  { symbol: "NVDA", date: "2026-05-28", quarter: "Q2", isEstimate: true },
  { symbol: "NVDA", date: "2026-08-27", quarter: "Q3", isEstimate: true },
  { symbol: "NVDA", date: "2026-11-19", quarter: "Q4", isEstimate: true },

  { symbol: "TSLA", date: "2026-01-29", quarter: "Q1", isEstimate: true },
  { symbol: "TSLA", date: "2026-04-22", quarter: "Q2", isEstimate: true },
  { symbol: "TSLA", date: "2026-07-23", quarter: "Q3", isEstimate: true },
  { symbol: "TSLA", date: "2026-10-21", quarter: "Q4", isEstimate: true },

  { symbol: "NFLX", date: "2026-01-21", quarter: "Q1", isEstimate: true },
  { symbol: "NFLX", date: "2026-04-15", quarter: "Q2", isEstimate: true },
  { symbol: "NFLX", date: "2026-07-16", quarter: "Q3", isEstimate: true },
  { symbol: "NFLX", date: "2026-10-15", quarter: "Q4", isEstimate: true },

  { symbol: "AMD", date: "2026-01-28", quarter: "Q1", isEstimate: true },
  { symbol: "AMD", date: "2026-04-29", quarter: "Q2", isEstimate: true },
  { symbol: "AMD", date: "2026-07-29", quarter: "Q3", isEstimate: true },
  { symbol: "AMD", date: "2026-10-28", quarter: "Q4", isEstimate: true },

  { symbol: "INTC", date: "2026-01-23", quarter: "Q1", isEstimate: true },
  { symbol: "INTC", date: "2026-04-24", quarter: "Q2", isEstimate: true },
  { symbol: "INTC", date: "2026-07-24", quarter: "Q3", isEstimate: true },
  { symbol: "INTC", date: "2026-10-23", quarter: "Q4", isEstimate: true },

  // Finance
  { symbol: "JPM", date: "2026-01-14", quarter: "Q1", isEstimate: true },
  { symbol: "JPM", date: "2026-04-15", quarter: "Q2", isEstimate: true },
  { symbol: "JPM", date: "2026-07-15", quarter: "Q3", isEstimate: true },
  { symbol: "JPM", date: "2026-10-14", quarter: "Q4", isEstimate: true },

  { symbol: "BAC", date: "2026-01-15", quarter: "Q1", isEstimate: true },
  { symbol: "BAC", date: "2026-04-16", quarter: "Q2", isEstimate: true },
  { symbol: "BAC", date: "2026-07-16", quarter: "Q3", isEstimate: true },
  { symbol: "BAC", date: "2026-10-15", quarter: "Q4", isEstimate: true },

  { symbol: "GS", date: "2026-01-15", quarter: "Q1", isEstimate: true },
  { symbol: "GS", date: "2026-04-14", quarter: "Q2", isEstimate: true },
  { symbol: "GS", date: "2026-07-15", quarter: "Q3", isEstimate: true },
  { symbol: "GS", date: "2026-10-14", quarter: "Q4", isEstimate: true },

  // Consumer
  { symbol: "KO", date: "2026-02-10", quarter: "Q1", isEstimate: true },
  { symbol: "KO", date: "2026-04-28", quarter: "Q2", isEstimate: true },
  { symbol: "KO", date: "2026-07-22", quarter: "Q3", isEstimate: true },
  { symbol: "KO", date: "2026-10-21", quarter: "Q4", isEstimate: true },

  { symbol: "MCD", date: "2026-01-27", quarter: "Q1", isEstimate: true },
  { symbol: "MCD", date: "2026-04-28", quarter: "Q2", isEstimate: true },
  { symbol: "MCD", date: "2026-07-28", quarter: "Q3", isEstimate: true },
  { symbol: "MCD", date: "2026-10-27", quarter: "Q4", isEstimate: true },

  // Healthcare
  { symbol: "JNJ", date: "2026-01-21", quarter: "Q1", isEstimate: true },
  { symbol: "JNJ", date: "2026-04-15", quarter: "Q2", isEstimate: true },
  { symbol: "JNJ", date: "2026-07-15", quarter: "Q3", isEstimate: true },
  { symbol: "JNJ", date: "2026-10-14", quarter: "Q4", isEstimate: true },

  { symbol: "UNH", date: "2026-01-15", quarter: "Q1", isEstimate: true },
  { symbol: "UNH", date: "2026-04-14", quarter: "Q2", isEstimate: true },
  { symbol: "UNH", date: "2026-07-16", quarter: "Q3", isEstimate: true },
  { symbol: "UNH", date: "2026-10-14", quarter: "Q4", isEstimate: true },

  // Energy
  { symbol: "XOM", date: "2026-01-31", quarter: "Q1", isEstimate: true },
  { symbol: "XOM", date: "2026-05-01", quarter: "Q2", isEstimate: true },
  { symbol: "XOM", date: "2026-07-31", quarter: "Q3", isEstimate: true },
  { symbol: "XOM", date: "2026-10-30", quarter: "Q4", isEstimate: true },

  { symbol: "CVX", date: "2026-01-30", quarter: "Q1", isEstimate: true },
  { symbol: "CVX", date: "2026-05-01", quarter: "Q2", isEstimate: true },
  { symbol: "CVX", date: "2026-07-31", quarter: "Q3", isEstimate: true },
  { symbol: "CVX", date: "2026-10-30", quarter: "Q4", isEstimate: true },
];

/** Get upcoming earnings (next N days from today) */
export function getUpcomingEarnings(daysAhead = 30): EarningsDate[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + daysAhead);

  return EARNINGS_DATES.filter((e) => {
    const d = new Date(e.date);
    return d >= now && d <= cutoff;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/** Get earnings for a specific month */
export function getEarningsForMonth(year: number, month: number): EarningsDate[] {
  return EARNINGS_DATES.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
