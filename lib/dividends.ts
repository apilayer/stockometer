export type DividendInfo = {
  symbol: string;
  annualDividend: number;
  frequency: "Quarterly" | "Semi-Annual" | "Annual" | "None";
  /** Estimated ex-dividend months (1-indexed) for quarterly payers */
  exMonths: number[];
};

/**
 * Estimated annual dividend data for tracked stocks.
 * Sources: Public financial records / SEC filings as of Q1 2026.
 * These are approximations — actual amounts may vary.
 */
export const DIVIDEND_DATA: DividendInfo[] = [
  // Tech — most pay nothing
  { symbol: "AAPL", annualDividend: 1.00, frequency: "Quarterly", exMonths: [2, 5, 8, 11] },
  { symbol: "MSFT", annualDividend: 3.32, frequency: "Quarterly", exMonths: [2, 5, 8, 11] },
  { symbol: "GOOGL", annualDividend: 0.80, frequency: "Quarterly", exMonths: [3, 6, 9, 12] },
  { symbol: "AMZN", annualDividend: 0, frequency: "None", exMonths: [] },
  { symbol: "META", annualDividend: 2.00, frequency: "Quarterly", exMonths: [2, 5, 8, 11] },
  { symbol: "NVDA", annualDividend: 0.04, frequency: "Quarterly", exMonths: [3, 6, 9, 12] },
  { symbol: "TSLA", annualDividend: 0, frequency: "None", exMonths: [] },
  { symbol: "NFLX", annualDividend: 0, frequency: "None", exMonths: [] },
  { symbol: "AMD", annualDividend: 0, frequency: "None", exMonths: [] },
  { symbol: "INTC", annualDividend: 0.50, frequency: "Quarterly", exMonths: [2, 5, 8, 11] },
  { symbol: "ORCL", annualDividend: 1.60, frequency: "Quarterly", exMonths: [1, 4, 7, 10] },
  { symbol: "CRM", annualDividend: 0, frequency: "None", exMonths: [] },
  { symbol: "ADBE", annualDividend: 0, frequency: "None", exMonths: [] },
  { symbol: "AVGO", annualDividend: 21.00, frequency: "Quarterly", exMonths: [3, 6, 9, 12] },

  // Finance — strong dividend payers
  { symbol: "JPM", annualDividend: 5.00, frequency: "Quarterly", exMonths: [1, 4, 7, 10] },
  { symbol: "BAC", annualDividend: 1.04, frequency: "Quarterly", exMonths: [3, 6, 9, 12] },
  { symbol: "WFC", annualDividend: 1.60, frequency: "Quarterly", exMonths: [2, 5, 8, 11] },
  { symbol: "GS", annualDividend: 12.00, frequency: "Quarterly", exMonths: [3, 6, 9, 12] },
  { symbol: "V", annualDividend: 2.36, frequency: "Quarterly", exMonths: [2, 5, 8, 11] },
  { symbol: "MA", annualDividend: 2.64, frequency: "Quarterly", exMonths: [1, 4, 7, 10] },

  // Healthcare
  { symbol: "JNJ", annualDividend: 4.96, frequency: "Quarterly", exMonths: [2, 5, 8, 11] },
  { symbol: "PFE", annualDividend: 1.68, frequency: "Quarterly", exMonths: [1, 4, 7, 10] },
  { symbol: "UNH", annualDividend: 8.40, frequency: "Quarterly", exMonths: [3, 6, 9, 12] },
  { symbol: "LLY", annualDividend: 5.68, frequency: "Quarterly", exMonths: [2, 5, 8, 11] },

  // Consumer
  { symbol: "KO", annualDividend: 1.94, frequency: "Quarterly", exMonths: [3, 6, 9, 12] },
  { symbol: "PEP", annualDividend: 5.42, frequency: "Quarterly", exMonths: [3, 6, 9, 12] },
  { symbol: "WMT", annualDividend: 0.83, frequency: "Quarterly", exMonths: [3, 6, 9, 12] },
  { symbol: "MCD", annualDividend: 6.68, frequency: "Quarterly", exMonths: [3, 6, 9, 12] },
  { symbol: "NKE", annualDividend: 1.48, frequency: "Quarterly", exMonths: [3, 6, 9, 12] },
  { symbol: "DIS", annualDividend: 1.00, frequency: "Semi-Annual", exMonths: [6, 12] },
  { symbol: "SBUX", annualDividend: 2.36, frequency: "Quarterly", exMonths: [2, 5, 8, 11] },

  // Energy
  { symbol: "XOM", annualDividend: 3.96, frequency: "Quarterly", exMonths: [2, 5, 8, 11] },
  { symbol: "CVX", annualDividend: 6.52, frequency: "Quarterly", exMonths: [2, 5, 8, 11] },

  // Auto
  { symbol: "F", annualDividend: 0.60, frequency: "Quarterly", exMonths: [2, 5, 8, 11] },
  { symbol: "GM", annualDividend: 0.48, frequency: "Quarterly", exMonths: [3, 6, 9, 12] },

  // Industrial
  { symbol: "CAT", annualDividend: 5.60, frequency: "Quarterly", exMonths: [1, 4, 7, 10] },
  { symbol: "BA", annualDividend: 0, frequency: "None", exMonths: [] },
  { symbol: "GE", annualDividend: 0.36, frequency: "Quarterly", exMonths: [3, 6, 9, 12] },
];

export const DIVIDEND_BY_SYMBOL: Record<string, DividendInfo> = Object.fromEntries(
  DIVIDEND_DATA.map((d) => [d.symbol, d]),
);

export function dividendYield(annualDiv: number, price: number): number {
  if (price <= 0 || annualDiv <= 0) return 0;
  return (annualDiv / price) * 100;
}

export function nextExDate(info: DividendInfo): Date | null {
  if (info.exMonths.length === 0) return null;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  for (const m of info.exMonths) {
    if (m > month || (m === month && now.getDate() <= 15)) {
      return new Date(year, m - 1, 15);
    }
  }
  // Wrap to next year
  return new Date(year + 1, info.exMonths[0] - 1, 15);
}
