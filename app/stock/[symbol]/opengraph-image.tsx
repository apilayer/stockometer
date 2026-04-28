import { ImageResponse } from "next/og";
import { fetchEodHistory } from "@/lib/marketstack";
import { STOCKS_BY_SYMBOL } from "@/lib/stocks";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function StockOGImage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: raw } = await params;
  const symbol = raw.toUpperCase();
  const meta = STOCKS_BY_SYMBOL[symbol];

  let price = 0;
  let change = 0;
  let name = meta?.name ?? symbol;
  let points: number[] = [];

  try {
    const history = await fetchEodHistory(symbol, 30);
    if (history.length > 0) {
      price = history[0].close;
      change =
        history[0].open > 0
          ? ((history[0].close - history[0].open) / history[0].open) * 100
          : 0;
      name = meta?.name ?? history[0].name ?? symbol;
      points = [...history].reverse().map((r) => r.close);
    }
  } catch {
    // Fallback to static
  }

  const positive = change >= 0;
  const changeColor = positive ? "#0ecb81" : "#f6465d";
  const changeText = `${positive ? "+" : ""}${change.toFixed(2)}%`;

  // Build sparkline path
  let sparklinePath = "";
  if (points.length > 1) {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const w = 400;
    const h = 120;
    const step = w / (points.length - 1);
    sparklinePath = points
      .map((p, i) => {
        const x = i * step;
        const y = h - ((p - min) / range) * h;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top: Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#e6edf3",
              letterSpacing: "-0.5px",
            }}
          >
            Stocko
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#3b82f6",
              letterSpacing: "-0.5px",
            }}
          >
            Meter
          </div>
        </div>

        {/* Center: Stock info */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "72px",
                  fontWeight: 800,
                  color: "#e6edf3",
                  letterSpacing: "-2px",
                }}
              >
                {symbol}
              </div>
            </div>
            <div
              style={{
                fontSize: "28px",
                color: "#8b949e",
                marginTop: "4px",
              }}
            >
              {name}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "20px",
                marginTop: "24px",
              }}
            >
              <div
                style={{
                  fontSize: "56px",
                  fontWeight: 700,
                  color: "#e6edf3",
                  letterSpacing: "-1px",
                }}
              >
                ${price.toFixed(2)}
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 600,
                  color: changeColor,
                }}
              >
                {changeText}
              </div>
            </div>
          </div>

          {/* Sparkline */}
          {sparklinePath && (
            <svg width="400" height="120" viewBox="0 0 400 120">
              <path
                d={sparklinePath}
                fill="none"
                stroke={changeColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Bottom: Sector tag */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {meta?.sector && (
            <div
              style={{
                fontSize: "18px",
                color: "#8b949e",
                padding: "6px 16px",
                border: "1px solid #30363d",
                borderRadius: "999px",
              }}
            >
              {meta.sector}
            </div>
          )}
          <div style={{ fontSize: "18px", color: "#484f58" }}>
            StockoMeter · {symbol}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
