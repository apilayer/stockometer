"use client";

import { useMemo, useRef, useState } from "react";
import type { EodRecord } from "@/lib/marketstack";
import { formatCompact, formatPercent, formatPlainPrice } from "@/lib/format";

const W = 1200;
const H = 480;
const PAD_LEFT = 16;
const PAD_RIGHT = 60;
const HEADER_HEIGHT = 48;
const VOL_HEIGHT = 90;
const VOL_GAP = 8;
const PAD_BOTTOM = 28;

const CHART_TOP = HEADER_HEIGHT;
const CHART_BOTTOM = H - PAD_BOTTOM - VOL_HEIGHT - VOL_GAP;
const VOL_TOP = H - PAD_BOTTOM - VOL_HEIGHT;
const VOL_BOTTOM = H - PAD_BOTTOM;
const CHART_HEIGHT = CHART_BOTTOM - CHART_TOP;

const MA_CONFIGS = [
  { period: 7, color: "#f0b90b", label: "MA(7)" },
  { period: 25, color: "#9b59f6", label: "MA(25)" },
  { period: 99, color: "#15c0e8", label: "MA(99)" },
] as const;

const UP = "#0ecb81";
const DOWN = "#f6465d";

function calcMA(closes: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < closes.length; i++) {
    sum += closes[i];
    if (i >= period) sum -= closes[i - period];
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}

export function CandlestickChart({ history }: { history: EodRecord[] }) {
  const data = useMemo(
    () =>
      [...history].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [history],
  );

  const closes = useMemo(() => data.map((d) => d.close), [data]);
  const mas = useMemo(
    () => MA_CONFIGS.map((cfg) => ({ ...cfg, values: calcMA(closes, cfg.period) })),
    [closes],
  );

  const priceVals = data.flatMap((d) => [d.high, d.low]);
  const allMaVals = mas
    .flatMap((m) => m.values)
    .filter((v): v is number => v !== null);
  const min = Math.min(...priceVals, ...allMaVals);
  const max = Math.max(...priceVals, ...allMaVals);
  const span = max - min || 1;
  const innerW = W - PAD_LEFT - PAD_RIGHT;

  const slotWidth = data.length > 0 ? innerW / data.length : 0;
  const candleWidth = Math.max(2, slotWidth * 0.72);

  const xAt = (i: number) => PAD_LEFT + (i + 0.5) * slotWidth;
  const yPrice = (v: number) => CHART_TOP + ((max - v) / span) * CHART_HEIGHT;

  const maxVol = Math.max(1, ...data.map((d) => d.volume));
  const yVol = (v: number) =>
    VOL_BOTTOM - (v / maxVol) * (VOL_BOTTOM - VOL_TOP);

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (data.length < 2) {
    return (
      <div className="grid h-96 place-items-center rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text-muted)">
        Not enough data to render chart.
      </div>
    );
  }

  const focusedIdx = hoverIdx ?? data.length - 1;
  const focused = data[focusedIdx];
  const focusedChange = focused.open
    ? ((focused.close - focused.open) / focused.open) * 100
    : 0;
  const focusedDate = new Date(focused.date);
  const dateLabel = focusedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const localX = px - PAD_LEFT;
    if (localX < 0 || localX > innerW) {
      setHoverIdx(null);
      return;
    }
    const idx = Math.min(
      data.length - 1,
      Math.max(0, Math.floor(localX / slotWidth)),
    );
    setHoverIdx(idx);
  };

  const gridSteps = 5;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = max - (span / gridSteps) * i;
    return { v, y: yPrice(v) };
  });

  const xTicks = (() => {
    const count = Math.min(6, data.length);
    return Array.from({ length: count }, (_, i) =>
      Math.round((i / (count - 1)) * (data.length - 1)),
    );
  })();

  const focusedColor = focused.close >= focused.open ? UP : DOWN;

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface)">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: "auto" }}
        preserveAspectRatio="none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Header: OHLC + MA values */}
        <g>
          <text
            x={PAD_LEFT}
            y={18}
            fontSize="11"
            fill="var(--color-text-muted)"
          >
            <tspan>{dateLabel}</tspan>
            <tspan dx="14" fill="var(--color-text-muted)">Open</tspan>
            <tspan dx="6" fill={focusedColor} fontWeight="600">
              {formatPlainPrice(focused.open)}
            </tspan>
            <tspan dx="14" fill="var(--color-text-muted)">High</tspan>
            <tspan dx="6" fill={focusedColor} fontWeight="600">
              {formatPlainPrice(focused.high)}
            </tspan>
            <tspan dx="14" fill="var(--color-text-muted)">Low</tspan>
            <tspan dx="6" fill={focusedColor} fontWeight="600">
              {formatPlainPrice(focused.low)}
            </tspan>
            <tspan dx="14" fill="var(--color-text-muted)">Close</tspan>
            <tspan dx="6" fill={focusedColor} fontWeight="600">
              {formatPlainPrice(focused.close)}
            </tspan>
            <tspan dx="14" fill="var(--color-text-muted)">CHANGE</tspan>
            <tspan dx="6" fill={focusedColor} fontWeight="600">
              {formatPercent(focusedChange)}
            </tspan>
          </text>
          <text
            x={PAD_LEFT}
            y={38}
            fontSize="11"
            fill="var(--color-text-muted)"
          >
            {mas.map((m, i) => {
              const v = m.values[focusedIdx];
              return (
                <tspan key={m.label} dx={i === 0 ? 0 : 14}>
                  <tspan fill={m.color}>{m.label}</tspan>
                  <tspan dx="6" fill="var(--color-text)" fontWeight="500">
                    {v === null ? "—" : formatPlainPrice(v)}
                  </tspan>
                </tspan>
              );
            })}
          </text>
        </g>

        {/* Grid */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={PAD_LEFT}
              x2={W - PAD_RIGHT}
              y1={g.y}
              y2={g.y}
              stroke="var(--color-border)"
              strokeOpacity="0.4"
              strokeDasharray="2 4"
            />
            <text
              x={W - PAD_RIGHT + 6}
              y={g.y + 3}
              fontSize="10"
              fill="var(--color-text-dim)"
              textAnchor="start"
            >
              {formatPlainPrice(g.v)}
            </text>
          </g>
        ))}

        {/* Volume baseline */}
        <line
          x1={PAD_LEFT}
          x2={W - PAD_RIGHT}
          y1={VOL_BOTTOM}
          y2={VOL_BOTTOM}
          stroke="var(--color-border)"
          strokeOpacity="0.5"
        />

        {/* Volume bars */}
        {data.map((d, i) => {
          const up = d.close >= d.open;
          const x = xAt(i) - candleWidth / 2;
          const y = yVol(d.volume);
          const h = VOL_BOTTOM - y;
          return (
            <rect
              key={`v-${i}`}
              x={x}
              y={y}
              width={candleWidth}
              height={Math.max(1, h)}
              fill={up ? UP : DOWN}
              fillOpacity="0.45"
            />
          );
        })}

        {/* Volume label */}
        <text
          x={PAD_LEFT}
          y={VOL_TOP + 12}
          fontSize="10"
          fill="var(--color-text-muted)"
        >
          <tspan>Vol</tspan>
          <tspan dx="6" fill={focusedColor} fontWeight="500">
            {formatCompact(focused.volume)}
          </tspan>
        </text>

        {/* Candles: wicks then bodies */}
        {data.map((d, i) => {
          const up = d.close >= d.open;
          const color = up ? UP : DOWN;
          const x = xAt(i);
          const yHigh = yPrice(d.high);
          const yLow = yPrice(d.low);
          const yOpen = yPrice(d.open);
          const yClose = yPrice(d.close);
          const bodyTop = Math.min(yOpen, yClose);
          const bodyHeight = Math.max(1, Math.abs(yOpen - yClose));
          return (
            <g key={`c-${i}`}>
              <line
                x1={x}
                x2={x}
                y1={yHigh}
                y2={yLow}
                stroke={color}
                strokeWidth="1"
              />
              <rect
                x={x - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={color}
              />
            </g>
          );
        })}

        {/* MA lines */}
        {mas.map((m) => {
          let path = "";
          let started = false;
          for (let i = 0; i < m.values.length; i++) {
            const v = m.values[i];
            if (v === null) continue;
            const cmd = started ? "L" : "M";
            path += `${cmd} ${xAt(i).toFixed(2)} ${yPrice(v).toFixed(2)} `;
            started = true;
          }
          return (
            <path
              key={m.label}
              d={path.trim()}
              fill="none"
              stroke={m.color}
              strokeWidth="1.4"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.95"
            />
          );
        })}

        {/* X-axis date labels */}
        {xTicks.map((i) => {
          const r = data[i];
          if (!r) return null;
          const d = new Date(r.date);
          const label = d.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
          });
          return (
            <text
              key={`x-${i}`}
              x={xAt(i)}
              y={H - 8}
              fontSize="10"
              fill="var(--color-text-dim)"
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}

        {/* Crosshair */}
        {hoverIdx !== null && (
          <g pointerEvents="none">
            <line
              x1={xAt(hoverIdx)}
              x2={xAt(hoverIdx)}
              y1={CHART_TOP}
              y2={VOL_BOTTOM}
              stroke="var(--color-text-muted)"
              strokeOpacity="0.5"
              strokeDasharray="3 4"
            />
            <line
              x1={PAD_LEFT}
              x2={W - PAD_RIGHT}
              y1={yPrice(focused.close)}
              y2={yPrice(focused.close)}
              stroke="var(--color-text-muted)"
              strokeOpacity="0.5"
              strokeDasharray="3 4"
            />
            <rect
              x={W - PAD_RIGHT + 2}
              y={yPrice(focused.close) - 9}
              width={PAD_RIGHT - 4}
              height={18}
              rx={2}
              fill={focusedColor}
            />
            <text
              x={W - PAD_RIGHT + 6}
              y={yPrice(focused.close) + 4}
              fontSize="10"
              fill="#fff"
              fontWeight="600"
            >
              {formatPlainPrice(focused.close)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
