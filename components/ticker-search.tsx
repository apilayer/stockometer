"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { TRACKED_STOCKS } from "@/lib/stocks";
import { TickerIcon } from "@/components/ticker-icon";

const MAX_RESULTS = 10;

export function TickerSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toUpperCase();

  const matches = useMemo(() => {
    if (!q) return TRACKED_STOCKS.slice(0, 8);
    const startsSym = TRACKED_STOCKS.filter((s) => s.symbol.startsWith(q));
    const containsSym = TRACKED_STOCKS.filter(
      (s) => !s.symbol.startsWith(q) && s.symbol.includes(q),
    );
    const nameMatch = TRACKED_STOCKS.filter(
      (s) => !s.symbol.includes(q) && s.name.toUpperCase().includes(q),
    );
    return [...startsSym, ...containsSym, ...nameMatch].slice(0, MAX_RESULTS);
  }, [q]);

  const exactInTracked = matches.some((m) => m.symbol === q);
  const showOpenAny = q.length >= 1 && !exactInTracked;
  const totalItems = matches.length + (showOpenAny ? 1 : 0);

  useEffect(() => setHighlighted(0), [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/") {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 10);
      document.body.style.overflow = "hidden";
      return () => {
        window.clearTimeout(id);
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const navigate = (symbol: string) => {
    if (!symbol) return;
    setOpen(false);
    setQuery("");
    router.push(`/stock/${symbol.toUpperCase()}`);
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, Math.max(0, totalItems - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted < matches.length) {
        navigate(matches[highlighted].symbol);
      } else if (showOpenAny) {
        navigate(q);
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search tickers"
        className="hidden items-center gap-2 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm text-(--color-text-muted) transition-colors hover:border-(--color-brand) hover:text-(--color-text) sm:flex sm:w-72"
      >
        <SearchIcon />
        <span className="flex-1 text-left">Search ticker (e.g. AAPL)</span>
        <span className="rounded border border-(--color-border-strong) px-1.5 text-[11px] text-(--color-text-dim)">
          /
        </span>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search tickers"
        className="grid size-9 place-items-center rounded-md border border-(--color-border) bg-(--color-surface) text-(--color-text-muted) transition-colors hover:text-(--color-text) sm:hidden"
      >
        <SearchIcon />
      </button>

      {open && (
        <SearchModalPortal>
          <SearchModal
            query={query}
            setQuery={setQuery}
            matches={matches}
            highlighted={highlighted}
            setHighlighted={setHighlighted}
            showOpenAny={showOpenAny}
            rawQuery={q}
            inputRef={inputRef}
            onInputKey={onInputKey}
            navigate={navigate}
            close={() => setOpen(false)}
          />
        </SearchModalPortal>
      )}
    </>
  );
}

function SearchModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

type ModalProps = {
  query: string;
  setQuery: (s: string) => void;
  matches: typeof TRACKED_STOCKS;
  highlighted: number;
  setHighlighted: (n: number) => void;
  showOpenAny: boolean;
  rawQuery: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInputKey: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  navigate: (symbol: string) => void;
  close: () => void;
};

function SearchModal({
  query,
  setQuery,
  matches,
  highlighted,
  setHighlighted,
  showOpenAny,
  rawQuery,
  inputRef,
  onInputKey,
  navigate,
  close,
}: ModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search tickers"
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
    >
      <button
        type="button"
        aria-label="Close search"
        onClick={close}
        className="animate-fade-in absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />
      <div className="animate-pop-in relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) shadow-2xl">
        <div className="flex items-center gap-3 border-b border-(--color-border) px-4 py-3">
          <SearchIcon />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search any ticker (e.g. AAPL, NVDA, BA)…"
            aria-label="Search ticker"
            className="flex-1 bg-transparent text-base text-(--color-text) placeholder:text-(--color-text-muted) outline-none"
          />
          <kbd className="rounded border border-(--color-border-strong) bg-(--color-bg) px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-(--color-text-dim)">
            esc
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
          {matches.length === 0 && !showOpenAny && (
            <div className="px-4 py-6 text-sm text-(--color-text-muted)">
              No matches in tracked universe.
            </div>
          )}
          {!query && matches.length > 0 && (
            <div className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-(--color-text-dim)">
              Popular
            </div>
          )}
          {matches.map((m, i) => (
            <button
              key={m.symbol}
              onMouseEnter={() => setHighlighted(i)}
              onClick={() => navigate(m.symbol)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                i === highlighted ? "bg-(--color-surface-2)" : ""
              }`}
            >
              <TickerIcon symbol={m.symbol} domain={m.domain} size={32} />
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{m.symbol}</div>
                <div className="truncate text-xs text-(--color-text-muted)">
                  {m.name}
                </div>
              </div>
              <span className="shrink-0 rounded bg-(--color-bg) px-2 py-0.5 text-[10px] uppercase tracking-wider text-(--color-text-muted)">
                {m.sector}
              </span>
            </button>
          ))}
          {showOpenAny && (
            <button
              onMouseEnter={() => setHighlighted(matches.length)}
              onClick={() => navigate(rawQuery)}
              className={`flex w-full items-center gap-2 border-t border-(--color-border) px-4 py-3 text-left text-sm transition-colors ${
                highlighted === matches.length
                  ? "bg-(--color-brand)/10 text-(--color-brand)"
                  : "text-(--color-brand)"
              }`}
            >
              <span className="font-semibold">↗</span>
              Open <code className="font-mono">/stock/{rawQuery}</code>{" "}
              <span className="text-(--color-text-muted)">
                — fetch any Marketstack ticker
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-(--color-border) bg-(--color-bg) px-4 py-2 text-[11px] text-(--color-text-dim)">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>Press / anywhere to search</span>
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-(--color-text-muted)"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
