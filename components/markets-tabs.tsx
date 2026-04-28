"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Overview", href: "/" },
  { label: "Trading Data", href: "/markets/trading-data" },
  { label: "Sectors", href: "/markets/sectors" },
];

export function MarketsTabs() {
  const pathname = usePathname() ?? "/";
  return (
    <div className="flex flex-wrap items-end gap-x-8 gap-y-3 border-b border-(--color-border)">
      {TABS.map((t) => {
        const active = t.href === "/" ? pathname === "/" : pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`relative pb-2 text-2xl font-semibold transition-colors ${
              active
                ? "text-(--color-text)"
                : "text-(--color-text-muted) hover:text-(--color-text)"
            }`}
          >
            {t.label}
            {active && (
              <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded bg-(--color-brand)" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
