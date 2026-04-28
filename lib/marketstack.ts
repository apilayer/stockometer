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

export async function fetchLatestEod(symbols: string[]): Promise<EodRecord[]> {
  if (symbols.length === 0) return [];
  return callMarketstack<EodRecord>(
    "/eod/latest",
    { symbols: symbols.join(","), limit: "1000" },
    REVALIDATE.list,
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
