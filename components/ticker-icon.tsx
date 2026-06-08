"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { STOCKS_BY_SYMBOL } from "@/lib/stocks";

const PALETTE = [
  ["#2480fc", "#fff"],
  ["#0052cc", "#fff"],
  ["#37c625", "#0b0e11"],
  ["#f6465d", "#fff"],
  ["#9b59f6", "#fff"],
  ["#ff8a3d", "#0b0e11"],
  ["#15c0e8", "#0b0e11"],
  ["#ff5fa3", "#0b0e11"],
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function buildSources(symbol: string, domain?: string): string[] {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  const sources: string[] = [];
  if (domain) {
    if (token) {
      sources.push(
        `https://img.logo.dev/${domain}?token=${token}&size=200&format=png&retina=true`,
      );
    }
    sources.push(
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    );
  } else if (token) {
    // No curated domain (dynamic universe): let logo.dev resolve by ticker.
    sources.push(
      `https://img.logo.dev/ticker/${symbol}?token=${token}&size=200&format=png&retina=true`,
    );
  }
  return sources;
}

export function TickerIcon({
  symbol,
  size = 32,
  domain,
}: {
  symbol: string;
  size?: number;
  domain?: string;
}) {
  const resolvedDomain = domain ?? STOCKS_BY_SYMBOL[symbol]?.domain;
  const [sourceIdx, setSourceIdx] = useState(0);

  useEffect(() => {
    setSourceIdx(0);
  }, [resolvedDomain]);

  const sources = buildSources(symbol, resolvedDomain);
  if (sourceIdx < sources.length) {
    return (
      <div
        className="grid shrink-0 place-items-center overflow-hidden rounded-full bg-white"
        style={{ width: size, height: size }}
      >
        <Image
          src={sources[sourceIdx]}
          alt={`${symbol} logo`}
          width={size}
          height={size}
          onError={() => setSourceIdx((i) => i + 1)}
          className="h-full w-full rounded-full object-contain"
        />
      </div>
    );
  }

  const [bg, fg] = PALETTE[hash(symbol) % PALETTE.length];
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-bold"
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: size * 0.4,
      }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}
