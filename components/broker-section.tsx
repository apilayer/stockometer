"use client";

import Image from "next/image";
import { useState } from "react";
import { BROKERS, type Broker } from "@/lib/brokers";

function BrokerLogo({ broker, size = 36 }: { broker: Broker; size?: number }) {
  const [errored, setErrored] = useState(false);
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;

  if (!errored) {
    const src = token
      ? `https://img.logo.dev/${broker.domain}?token=${token}&size=200&format=png&retina=true`
      : `https://icons.duckduckgo.com/ip3/${broker.domain}.ico`;
    return (
      <div
        className="grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white"
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt={`${broker.name} logo`}
          width={size}
          height={size}
          onError={() => setErrored(true)}
          className="h-full w-full rounded-xl object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className="grid shrink-0 place-items-center rounded-xl font-bold text-white"
      style={{
        width: size,
        height: size,
        background: broker.color,
        fontSize: size * 0.35,
      }}
    >
      {broker.name.slice(0, 2)}
    </div>
  );
}

function BrokerCard({
  broker,
  symbol,
}: {
  broker: Broker;
  symbol: string;
}) {
  const url = `${broker.affiliateUrl}&ticker=${symbol}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group flex gap-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4 transition-all duration-200 hover:border-(--color-border-strong) hover:bg-(--color-surface-2) hover:shadow-lg"
    >
      <BrokerLogo broker={broker} size={44} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-(--color-text) group-hover:text-(--color-brand) transition-colors">
            {broker.name}
          </h4>
          <svg
            className="h-3.5 w-3.5 text-(--color-text-dim) opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </div>

        <p className="mt-0.5 text-xs text-(--color-text-muted) leading-relaxed line-clamp-2">
          {broker.description}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-(--color-text-dim)">
              Commission
            </span>
            <span className="text-xs font-semibold text-(--color-up)">
              {broker.commission}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-(--color-text-dim)">
              Min deposit
            </span>
            <span className="text-xs font-medium text-(--color-text)">
              {broker.minDeposit}
            </span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {broker.features.map((f) => (
            <span
              key={f}
              className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset"
              style={{
                color: broker.color,
                background: `${broker.color}10`,
                boxShadow: `inset 0 0 0 1px ${broker.color}25`,
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="hidden sm:flex shrink-0 self-center">
        <span
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-transform group-hover:scale-105"
          style={{ background: broker.color }}
        >
          Trade {symbol}
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>
        </span>
      </div>
    </a>
  );
}

export function BrokerSection({ symbol }: { symbol: string }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Where to buy {symbol}</h2>
        <p className="text-xs text-(--color-text-muted) mt-0.5">
          Compare brokers and start trading. Affiliate links — we may earn a
          commission at no extra cost to you.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {BROKERS.map((broker) => (
          <BrokerCard key={broker.slug} broker={broker} symbol={symbol} />
        ))}
      </div>
    </section>
  );
}
