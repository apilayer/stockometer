"use client";

const KEY = "stockometer:alerts";

export type PriceAlert = {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: "above" | "below";
  createdAt: string;
  triggered: boolean;
};

export function readAlerts(): PriceAlert[] {
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

export function writeAlerts(alerts: PriceAlert[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(alerts));
  window.dispatchEvent(new CustomEvent("alerts:changed"));
}

export function addAlert(
  symbol: string,
  targetPrice: number,
  direction: "above" | "below",
): PriceAlert {
  const alert: PriceAlert = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    symbol: symbol.toUpperCase(),
    targetPrice,
    direction,
    createdAt: new Date().toISOString(),
    triggered: false,
  };
  const list = readAlerts();
  list.push(alert);
  writeAlerts(list);
  return alert;
}

export function removeAlert(id: string): void {
  const list = readAlerts().filter((a) => a.id !== id);
  writeAlerts(list);
}

export function markTriggered(id: string): void {
  const list = readAlerts();
  const idx = list.findIndex((a) => a.id === id);
  if (idx !== -1) {
    list[idx].triggered = true;
    writeAlerts(list);
  }
}

export function clearTriggered(): void {
  const list = readAlerts().filter((a) => !a.triggered);
  writeAlerts(list);
}
