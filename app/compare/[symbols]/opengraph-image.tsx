import { ImageResponse } from "next/og";
import { fetchEodHistory } from "@/lib/marketstack";
import { STOCKS_BY_SYMBOL } from "@/lib/stocks";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function CompareOGImage({
  params,
}: {
  params: Promise<{ symbols: string }>;
}) {
  const { symbols: raw } = await params;
  const symbols = Array.from(
    new Set(
      raw
        .split("-")
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s && s !== "VS"),
    ),
  ).slice(0, 6);

  const stocks = await Promise.all(
    symbols.map(async (sym) => {
      const meta = STOCKS_BY_SYMBOL[sym];
      try {
        const history = await fetchEodHistory(sym, 1);
        const rec = history[0];
        const change =
          rec && rec.open > 0
            ? ((rec.close - rec.open) / rec.open) * 100
            : 0;
        return {
          symbol: sym,
          name: meta?.name ?? rec?.name ?? sym,
          price: rec?.close ?? 0,
          change,
        };
      } catch {
        return { symbol: sym, name: meta?.name ?? sym, price: 0, change: 0 };
      }
    }),
  );

  const headline =
    symbols.length === 2
      ? `${symbols[0]} vs ${symbols[1]}`
      : symbols.join(" vs ");

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
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#e6edf3" }}>
            Stocko
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#3b82f6" }}>
            Meter
          </div>
          <div
            style={{
              fontSize: "18px",
              color: "#484f58",
              marginLeft: "16px",
            }}
          >
            Stock Comparison
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "#e6edf3",
            letterSpacing: "-2px",
            lineHeight: 1.1,
          }}
        >
          {headline}
        </div>

        {/* Stock cards */}
        <div style={{ display: "flex", gap: "24px" }}>
          {stocks.map((s) => {
            const positive = s.change >= 0;
            const color = positive ? "#0ecb81" : "#f6465d";
            return (
              <div
                key={s.symbol}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "20px 28px",
                  border: "1px solid #30363d",
                  borderRadius: "16px",
                  background: "rgba(22, 27, 34, 0.8)",
                  minWidth: "180px",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "#e6edf3",
                  }}
                >
                  {s.symbol}
                </div>
                <div style={{ fontSize: "16px", color: "#8b949e", marginTop: "4px" }}>
                  {s.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "12px",
                    marginTop: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "#e6edf3",
                    }}
                  >
                    ${s.price.toFixed(2)}
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 600, color }}>
                    {positive ? "+" : ""}
                    {s.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    { ...size },
  );
}
