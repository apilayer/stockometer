import "server-only";

const BASE = "https://api.marketstack.com/v2";

const LIST_REVALIDATE = Number(
  process.env.STOCKOMETER_LIST_REVALIDATE ?? 65,
);
const HISTORY_REVALIDATE = Number(
  process.env.STOCKOMETER_HISTORY_REVALIDATE ?? 3600,
);

export const REVALIDATE = {
  list: LIST_REVALIDATE,
  history: HISTORY_REVALIDATE,
};

export type EodRecord = {
  symbol: string;
  name: string;
  exchange: string;
  exchange_code: string;
  asset_type: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  adj_close: number;
  adj_high: number;
  adj_low: number;
  adj_open: number;
  adj_volume: number;
  dividend: number;
  split_factor: number;
  date: string;
  price_currency: string;
};

type ApiResponse<T> = {
  data?: T[];
  body?: { data?: T[] };
};

function getKey(): string {
  const key = process.env.MARKETSTACK_API_KEY;
  if (!key) {
    throw new Error(
      "MARKETSTACK_API_KEY is not set. Add it to .env.local",
    );
  }
  return key;
}

async function callMarketstack<T>(
  path: string,
  params: Record<string, string>,
  revalidate: number,
): Promise<T[]> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("access_key", getKey());
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url, {
    next: { revalidate, tags: ["marketstack"] },
  });

  if (!res.ok) {
    throw new Error(
      `Marketstack ${path} failed: ${res.status} ${res.statusText}`,
    );
  }

  const json = (await res.json()) as ApiResponse<T>;
  return json.data ?? json.body?.data ?? [];
}

export type TickerInfo = {
  symbol: string;
  name: string;
  exchange: string; // operating MIC, e.g. XNAS
  exchangeCode: string; // acronym, e.g. NASDAQ
};

type TickerListItem = {
  name: string;
  ticker: string;
  has_eod: boolean;
  has_intraday: boolean;
  stock_exchange: { name: string; acronym: string; mic: string } | null;
};

/**
 * The Marketstack universe (~677k tickers) via /tickerslist, ordered by
 * market relevance. We keep only tickers that actually expose EOD data.
 */
export async function fetchTickers(
  limit = 100,
  offset = 0,
): Promise<TickerInfo[]> {
  const items = await callMarketstack<TickerListItem>(
    "/tickerslist",
    { limit: String(Math.min(limit, 1000)), offset: String(offset) },
    REVALIDATE.list,
  );
  return items
    .filter((t) => t.has_eod && t.ticker)
    .map((t) => ({
      symbol: t.ticker,
      name: t.name,
      exchange: t.stock_exchange?.mic ?? "",
      exchangeCode: t.stock_exchange?.acronym ?? "",
    }));
}

// /eod/latest takes a comma-separated symbols list; chunk to keep URLs sane.
const EOD_BATCH = 100;

export async function fetchLatestEod(symbols: string[]): Promise<EodRecord[]> {
  if (symbols.length === 0) return [];
  if (symbols.length <= EOD_BATCH) {
    return callMarketstack<EodRecord>(
      "/eod/latest",
      { symbols: symbols.join(","), limit: "1000" },
      REVALIDATE.list,
    );
  }
  const batches: string[][] = [];
  for (let i = 0; i < symbols.length; i += EOD_BATCH) {
    batches.push(symbols.slice(i, i + EOD_BATCH));
  }
  const results = await Promise.all(
    batches.map((b) =>
      callMarketstack<EodRecord>(
        "/eod/latest",
        { symbols: b.join(","), limit: "1000" },
        REVALIDATE.list,
      ),
    ),
  );
  return results.flat();
}

/**
 * Top `limit` stocks by market relevance: resolve the universe from
 * /tickerslist, fetch their latest EOD, and preserve the relevance ordering.
 */
export async function fetchTopStocks(limit = 100): Promise<EodRecord[]> {
  const tickers = await fetchTickers(limit);
  if (tickers.length === 0) return [];
  const records = await fetchLatestEod(tickers.map((t) => t.symbol));
  const order = new Map(tickers.map((t, i) => [t.symbol, i]));
  return records.sort(
    (a, b) =>
      (order.get(a.symbol) ?? Number.MAX_SAFE_INTEGER) -
      (order.get(b.symbol) ?? Number.MAX_SAFE_INTEGER),
  );
}

export async function fetchEodHistory(
  symbol: string,
  limit = 90,
): Promise<EodRecord[]> {
  return callMarketstack<EodRecord>(
    "/eod",
    { symbols: symbol, limit: String(limit), sort: "DESC" },
    REVALIDATE.history,
  );
}
