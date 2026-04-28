"use client";

const KEY = "stockometer:portfolio";

export type Holding = {
  symbol: string;
  shares: number;
  avgCost: number;
};

export function readPortfolio(): Holding[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writePortfolio(holdings: Holding[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(holdings));
  window.dispatchEvent(new CustomEvent("portfolio:changed"));
}

export function addHolding(holding: Holding): void {
  const list = readPortfolio();
  const existing = list.findIndex(
    (h) => h.symbol === holding.symbol.toUpperCase(),
  );
  if (existing !== -1) {
    // Merge: weighted average cost
    const old = list[existing];
    const totalShares = old.shares + holding.shares;
    const totalCost = old.shares * old.avgCost + holding.shares * holding.avgCost;
    list[existing] = {
      symbol: old.symbol,
      shares: totalShares,
      avgCost: totalCost / totalShares,
    };
  } else {
    list.push({
      ...holding,
      symbol: holding.symbol.toUpperCase(),
    });
  }
  writePortfolio(list);
}

export function removeHolding(symbol: string): void {
  const list = readPortfolio().filter(
    (h) => h.symbol !== symbol.toUpperCase(),
  );
  writePortfolio(list);
}

export function updateHolding(
  symbol: string,
  patch: Partial<Pick<Holding, "shares" | "avgCost">>,
): void {
  const list = readPortfolio();
  const idx = list.findIndex((h) => h.symbol === symbol.toUpperCase());
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...patch };
  writePortfolio(list);
}
