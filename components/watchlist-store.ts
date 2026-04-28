"use client";

const KEY = "stockometer:watchlist";

export function readWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function writeWatchlist(symbols: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(symbols));
  window.dispatchEvent(new CustomEvent("watchlist:changed"));
}

export function toggleWatchlist(symbol: string): boolean {
  const list = readWatchlist();
  const idx = list.indexOf(symbol);
  if (idx === -1) {
    list.push(symbol);
    writeWatchlist(list);
    return true;
  }
  list.splice(idx, 1);
  writeWatchlist(list);
  return false;
}
