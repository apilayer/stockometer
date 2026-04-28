export type Sector =
  | "Tech"
  | "Finance"
  | "Healthcare"
  | "Consumer"
  | "Energy"
  | "Auto"
  | "Industrial";

export type StockMeta = {
  symbol: string;
  name: string;
  sector: Sector;
  domain: string;
};

export const TRACKED_STOCKS: StockMeta[] = [
  { symbol: "AAPL", name: "Apple Inc", sector: "Tech", domain: "apple.com" },
  { symbol: "MSFT", name: "Microsoft Corp", sector: "Tech", domain: "microsoft.com" },
  { symbol: "GOOGL", name: "Alphabet Inc", sector: "Tech", domain: "abc.xyz" },
  { symbol: "AMZN", name: "Amazon.com Inc", sector: "Tech", domain: "amazon.com" },
  { symbol: "META", name: "Meta Platforms", sector: "Tech", domain: "meta.com" },
  { symbol: "NVDA", name: "NVIDIA Corp", sector: "Tech", domain: "nvidia.com" },
  { symbol: "TSLA", name: "Tesla Inc", sector: "Auto", domain: "tesla.com" },
  { symbol: "NFLX", name: "Netflix Inc", sector: "Tech", domain: "netflix.com" },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Tech", domain: "amd.com" },
  { symbol: "INTC", name: "Intel Corp", sector: "Tech", domain: "intel.com" },
  { symbol: "ORCL", name: "Oracle Corp", sector: "Tech", domain: "oracle.com" },
  { symbol: "CRM", name: "Salesforce Inc", sector: "Tech", domain: "salesforce.com" },
  { symbol: "ADBE", name: "Adobe Inc", sector: "Tech", domain: "adobe.com" },
  { symbol: "AVGO", name: "Broadcom Inc", sector: "Tech", domain: "broadcom.com" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Finance", domain: "jpmorganchase.com" },
  { symbol: "BAC", name: "Bank of America", sector: "Finance", domain: "bankofamerica.com" },
  { symbol: "WFC", name: "Wells Fargo", sector: "Finance", domain: "wellsfargo.com" },
  { symbol: "GS", name: "Goldman Sachs", sector: "Finance", domain: "goldmansachs.com" },
  { symbol: "V", name: "Visa Inc", sector: "Finance", domain: "visa.com" },
  { symbol: "MA", name: "Mastercard Inc", sector: "Finance", domain: "mastercard.com" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", domain: "jnj.com" },
  { symbol: "PFE", name: "Pfizer Inc", sector: "Healthcare", domain: "pfizer.com" },
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare", domain: "unitedhealthgroup.com" },
  { symbol: "LLY", name: "Eli Lilly and Co", sector: "Healthcare", domain: "lilly.com" },
  { symbol: "KO", name: "Coca-Cola Co", sector: "Consumer", domain: "coca-colacompany.com" },
  { symbol: "PEP", name: "PepsiCo Inc", sector: "Consumer", domain: "pepsico.com" },
  { symbol: "WMT", name: "Walmart Inc", sector: "Consumer", domain: "walmart.com" },
  { symbol: "MCD", name: "McDonald's Corp", sector: "Consumer", domain: "mcdonalds.com" },
  { symbol: "NKE", name: "Nike Inc", sector: "Consumer", domain: "nike.com" },
  { symbol: "DIS", name: "Walt Disney Co", sector: "Consumer", domain: "thewaltdisneycompany.com" },
  { symbol: "SBUX", name: "Starbucks Corp", sector: "Consumer", domain: "starbucks.com" },
  { symbol: "XOM", name: "Exxon Mobil", sector: "Energy", domain: "exxonmobil.com" },
  { symbol: "CVX", name: "Chevron Corp", sector: "Energy", domain: "chevron.com" },
  { symbol: "F", name: "Ford Motor Co", sector: "Auto", domain: "ford.com" },
  { symbol: "GM", name: "General Motors", sector: "Auto", domain: "gm.com" },
  { symbol: "CAT", name: "Caterpillar Inc", sector: "Industrial", domain: "caterpillar.com" },
  { symbol: "BA", name: "Boeing Co", sector: "Industrial", domain: "boeing.com" },
  { symbol: "GE", name: "General Electric", sector: "Industrial", domain: "ge.com" },
];

export const SECTORS: Sector[] = [
  "Tech",
  "Finance",
  "Healthcare",
  "Consumer",
  "Energy",
  "Auto",
  "Industrial",
];

export const STOCKS_BY_SYMBOL: Record<string, StockMeta> = Object.fromEntries(
  TRACKED_STOCKS.map((s) => [s.symbol, s]),
);

export const TRACKED_SYMBOLS: string[] = TRACKED_STOCKS.map((s) => s.symbol);
