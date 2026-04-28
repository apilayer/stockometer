import { NextRequest, NextResponse } from "next/server";
import { fetchLatestEod } from "@/lib/marketstack";
import { STOCKS_BY_SYMBOL } from "@/lib/stocks";
import { changePercent } from "@/lib/format";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol: raw } = await params;
  const symbol = raw.toUpperCase().replace(/[^A-Z.]/g, "").slice(0, 10);
  const theme = req.nextUrl.searchParams.get("theme") === "light" ? "light" : "dark";
  const meta = STOCKS_BY_SYMBOL[symbol];

  if (!meta) {
    return new NextResponse("Unknown symbol", { status: 404 });
  }

  let price = 0;
  let change = 0;
  let volume = 0;
  let name = meta?.name ?? symbol;

  try {
    const records = await fetchLatestEod([symbol]);
    const rec = records[0];
    if (rec) {
      price = rec.close;
      change = changePercent(rec.open, rec.close);
      volume = rec.volume;
      name = meta?.name ?? rec.name ?? symbol;
    }
  } catch {
    // Fallback
  }

  const positive = change >= 0;

  // Theme tokens
  const t =
    theme === "dark"
      ? {
          bg: "#0d1117",
          border: "#30363d",
          text: "#e6edf3",
          muted: "#8b949e",
          dim: "#484f58",
          up: "#0ecb81",
          down: "#f6465d",
          brand: "#3b82f6",
        }
      : {
          bg: "#ffffff",
          border: "#d0d7de",
          text: "#1f2328",
          muted: "#656d76",
          dim: "#8b949e",
          up: "#16a34a",
          down: "#dc2626",
          brand: "#3b82f6",
        };

  const changeColor = positive ? t.up : t.down;
  const changeText = `${positive ? "+" : ""}${change.toFixed(2)}%`;
  const domain = meta?.domain ?? `${symbol.toLowerCase()}.com`;
  const logoUrl = `https://logo.clearbit.com/${domain}`;
  const volStr = volume >= 1e6 ? `${(volume / 1e6).toFixed(1)}M` : volume.toLocaleString();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; width: 100%; overflow: hidden; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: ${t.bg};
      color: ${t.text};
      -webkit-font-smoothing: antialiased;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      padding: 16px 20px;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .top { display: flex; align-items: center; gap: 12px; }
    .logo {
      width: 36px; height: 36px; border-radius: 8px;
      object-fit: contain; background: ${theme === "dark" ? "#161b22" : "#f6f8fa"};
      border: 1px solid ${t.border};
    }
    .sym { font-size: 18px; font-weight: 700; }
    .name { font-size: 12px; color: ${t.muted}; }
    .price-row { display: flex; align-items: baseline; gap: 10px; margin-top: 4px; }
    .price { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .change { font-size: 14px; font-weight: 600; color: ${changeColor}; }
    .bottom {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 10px; padding-top: 8px;
      border-top: 1px solid ${t.border};
    }
    .vol { font-size: 10px; color: ${t.muted}; }
    .link { font-size: 10px; font-weight: 600; color: ${t.brand}; text-decoration: none; }
    .link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="top">
      <img class="logo" src="${logoUrl}" alt="${symbol}" onerror="this.style.display='none'" />
      <div>
        <div style="display:flex;align-items:baseline;gap:8px;">
          <span class="sym">${symbol}</span>
          <span class="name">${escapeHtml(name)}</span>
        </div>
        <div class="price-row">
          <span class="price">$${price.toFixed(2)}</span>
          <span class="change">${changeText}</span>
        </div>
      </div>
    </div>
    <div class="bottom">
      <span class="vol">Vol: ${volStr}</span>
      <a class="link" href="/stock/${symbol}" target="_blank" rel="noopener noreferrer">
        StockoMeter →
      </a>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=65, stale-while-revalidate=300",
      "X-Frame-Options": "ALLOWALL",
    },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
