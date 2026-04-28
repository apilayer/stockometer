"use client";

import { useEffect, useState } from "react";
import { readWatchlist, toggleWatchlist } from "@/components/watchlist-store";

export function WatchlistToggle({ symbol }: { symbol: string }) {
  const [inList, setInList] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setInList(readWatchlist().includes(symbol));
    const handler = () => setInList(readWatchlist().includes(symbol));
    window.addEventListener("watchlist:changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("watchlist:changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, [symbol]);

  if (!mounted) {
    return (
      <button
        className="rounded-md border border-(--color-border) px-3 py-1.5 text-sm text-(--color-text-muted)"
        disabled
      >
        ☆ Watchlist
      </button>
    );
  }

  const handleClick = () => {
    const next = toggleWatchlist(symbol);
    setInList(next);
  };

  return (
    <button
      onClick={handleClick}
      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
        inList
          ? "border-(--color-brand) bg-(--color-brand)/10 text-(--color-brand)"
          : "border-(--color-border) text-(--color-text) hover:border-(--color-brand) hover:text-(--color-brand)"
      }`}
    >
      {inList ? "★ Watching" : "☆ Add to Watchlist"}
    </button>
  );
}
