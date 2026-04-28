import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function RootOGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0d1117 0%, #161b22 40%, #1a1f2e 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Glow accent */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <div
            style={{
              fontSize: "84px",
              fontWeight: 800,
              color: "#e6edf3",
              letterSpacing: "-3px",
            }}
          >
            Stocko
          </div>
          <div
            style={{
              fontSize: "84px",
              fontWeight: 800,
              color: "#3b82f6",
              letterSpacing: "-3px",
            }}
          >
            Meter
          </div>
        </div>

        <div
          style={{
            fontSize: "28px",
            color: "#8b949e",
            marginTop: "16px",
            textAlign: "center",
          }}
        >
          Live Stock Markets · Real-Time Prices · Portfolio Tracker
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "40px",
          }}
        >
          {["38+ Stocks", "Candlestick Charts", "Stock Screener", "Compare Tool"].map(
            (label) => (
              <div
                key={label}
                style={{
                  fontSize: "18px",
                  color: "#c9d1d9",
                  padding: "8px 20px",
                  border: "1px solid #30363d",
                  borderRadius: "999px",
                  background: "rgba(22, 27, 34, 0.8)",
                }}
              >
                {label}
              </div>
            ),
          )}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "18px",
            color: "#484f58",
          }}
        >
          Powered by APILayer · Marketstack API
        </div>
      </div>
    ),
    { ...size },
  );
}
