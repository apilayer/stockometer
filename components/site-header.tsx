"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TickerSearch } from "@/components/ticker-search";

const NAV: { label: string; href: string; matches: (p: string) => boolean }[] = [
  {
    label: "Markets",
    href: "/",
    matches: (p) => p === "/" || p.startsWith("/markets") || p.startsWith("/stock/"),
  },
  { label: "Stocks", href: "/stocks", matches: (p) => p.startsWith("/stocks") },
  {
    label: "Screener",
    href: "/screener",
    matches: (p) => p.startsWith("/screener"),
  },
  {
    label: "Compare",
    href: "/compare",
    matches: (p) => p.startsWith("/compare"),
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    matches: (p) => p.startsWith("/portfolio"),
  },
  {
    label: "Watchlist",
    href: "/watchlist",
    matches: (p) => p.startsWith("/watchlist"),
  },
];

const MORE_NAV: { label: string; href: string; desc: string; matches: (p: string) => boolean }[] = [
  {
    label: "Dividends",
    href: "/dividends",
    desc: "Yield & ex-dates",
    matches: (p) => p.startsWith("/dividends"),
  },
  {
    label: "Earnings",
    href: "/earnings",
    desc: "Report calendar",
    matches: (p) => p.startsWith("/earnings"),
  },
  {
    label: "Price Alerts",
    href: "/alerts",
    desc: "Target notifications",
    matches: (p) => p.startsWith("/alerts"),
  },
  {
    label: "Indices",
    href: "/indices",
    desc: "Index performance",
    matches: (p) => p.startsWith("/indices"),
  },
  {
    label: "Sectors",
    href: "/sectors",
    desc: "Sector breakdown",
    matches: (p) => p.startsWith("/sectors"),
  },
  {
    label: "Widgets",
    href: "/widgets",
    desc: "Embeddable cards",
    matches: (p) => p.startsWith("/widgets"),
  },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const moreActive = MORE_NAV.some((item) => item.matches(pathname));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-(--color-border) bg-(--color-bg)/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex flex-col leading-none">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight"
            >
              Stocko<span className="text-(--color-brand)">Meter</span>
            </Link>
            <a
              href="https://apilayer.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit APILayer"
              className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-(--color-text-muted) transition-opacity hover:opacity-80"
            >
              <span>by</span>
              <Image
                src="/apilayer-logo.png"
                alt="APILayer"
                width={72}
                height={14}
                priority
                style={{ width: "auto" }}
                className="h-3.5"
              />
            </a>
          </div>
        </div>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {NAV.map((item) => {
            const active = item.matches(pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-md px-3 py-1.5 transition-colors ${
                  active
                    ? "text-(--color-brand)"
                    : "text-(--color-text) hover:text-(--color-brand)"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[15px] h-0.5 rounded-full bg-(--color-brand)" />
                )}
              </Link>
            );
          })}

          {/* More dropdown */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={`relative flex items-center gap-1 rounded-md px-3 py-1.5 transition-colors ${
                moreActive
                  ? "text-(--color-brand)"
                  : "text-(--color-text) hover:text-(--color-brand)"
              }`}
            >
              More
              <svg
                viewBox="0 0 12 12"
                className={`size-3 transition-transform ${moreOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 5l3 3 3-3" />
              </svg>
              {moreActive && (
                <span className="absolute inset-x-3 -bottom-[15px] h-0.5 rounded-full bg-(--color-brand)" />
              )}
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-(--color-border) bg-(--color-surface) py-1.5 shadow-xl animate-fade-in">
                {MORE_NAV.map((item) => {
                  const active = item.matches(pathname);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex flex-col gap-0.5 px-4 py-2.5 transition-colors hover:bg-(--color-surface-2) ${
                        active ? "text-(--color-brand)" : ""
                      }`}
                    >
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-[11px] text-(--color-text-dim)">
                        {item.desc}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <TickerSearch />
          <a
            href="https://apilayer.com/marketplace/marketstack-api"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md border border-(--color-border) px-3 py-1.5 text-sm text-(--color-text) transition-colors hover:border-(--color-brand) hover:text-(--color-brand) sm:inline-block"
          >
            Get API Key
          </a>
        </div>
      </div>
    </header>
  );
}
