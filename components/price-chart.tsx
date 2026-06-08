"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { EodRecord } from "@/lib/marketstack";
import { formatCompact, formatPercent, formatPlainPrice } from "@/lib/format";

const W = 1200;
const H = 480;
const PAD_LEFT = 16;
const PAD_RIGHT = 64;
const HEADER_HEIGHT = 44;
const VOL_HEIGHT = 80;
const VOL_GAP = 8;
const PAD_BOTTOM = 28;

const CHART_TOP = HEADER_HEIGHT;
const CHART_BOTTOM = H - PAD_BOTTOM - VOL_HEIGHT - VOL_GAP;
const VOL_TOP = H - PAD_BOTTOM - VOL_HEIGHT;
const VOL_BOTTOM = H - PAD_BOTTOM;
const CHART_HEIGHT = CHART_BOTTOM - CHART_TOP;
const INNER_W = W - PAD_LEFT - PAD_RIGHT;

const MIN_BARS = 12;

const MA_CONFIGS = [
  { period: 7, color: "#f0b90b", label: "MA(7)" },
  { period: 25, color: "#9b59f6", label: "MA(25)" },
  { period: 99, color: "#15c0e8", label: "MA(99)" },
] as const;

const UP = "#0ecb81";
const DOWN = "#f6465d";

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

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

/**
 * Interactive candlestick chart — built in-house (no third-party charting lib).
 * Wheel to zoom around the cursor, drag to pan, double-click to reset.
 * Moving averages are computed over the full series so they stay continuous
 * across whatever window is in view.
 */
export function PriceChart({
  history,
  height = 460,
  visibleBars = 90,
}: {
  history: EodRecord[];
  height?: number;
  visibleBars?: number;
}) {
  const data = useMemo(
    () =>
      [...history].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [history],
  );

  const masFull = useMemo(() => {
    const closes = data.map((d) => d.close);
    return MA_CONFIGS.map((cfg) => ({
      ...cfg,
      values: calcMA(closes, cfg.period),
    }));
  }, [data]);

  const defaultCount = Math.min(visibleBars, data.length || visibleBars);

  // View window into `data`, expressed as [start, start+count).
  const [range, setRange] = useState({
    start: Math.max(0, data.length - defaultCount),
    count: defaultCount,
  });

  // Reset the window whenever the underlying series changes.
  useEffect(() => {
    const count = Math.min(visibleBars, data.length || visibleBars);
    setRange({ start: Math.max(0, data.length - count), count });
  }, [data.length, visibleBars]);

  // Never let the window exceed how much data we actually have.
  const count = clamp(range.count, Math.min(MIN_BARS, data.length), data.length);
  const start = clamp(range.start, 0, Math.max(0, data.length - count));

  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const dragRef = useRef<{ clientX: number; start: number } | null>(null);

  // Keep the latest view in a ref so the (non-passive) wheel handler — attached
  // once — always reads current values without re-binding on every change.
  const viewRef = useRef({ start, count, len: data.length });
  viewRef.current = { start, count, len: data.length };

  const slotWidth = count > 0 ? INNER_W / count : 0;

  const pxToLocalX = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return ((clientX - rect.left) / rect.width) * W - PAD_LEFT;
  };

  const localXToIdx = (localX: number) =>
    clamp(Math.floor(localX / slotWidth), 0, count - 1);

  // Wheel-to-zoom: anchored on the bar under the cursor.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { start: s, count: c, len } = viewRef.current;
      if (len === 0) return;
      const rect = svg.getBoundingClientRect();
      const localX = ((e.clientX - rect.left) / rect.width) * W - PAD_LEFT;
      const slot = INNER_W / c;
      const idx = clamp(Math.floor(localX / slot), 0, c - 1);
      const anchorAbs = s + idx;
      const factor = e.deltaY > 0 ? 1.2 : 1 / 1.2;
      const newCount = clamp(Math.round(c * factor), Math.min(MIN_BARS, len), len);
      const rel = c > 0 ? idx / c : 0;
      const newStart = clamp(
        Math.round(anchorAbs - rel * newCount),
        0,
        Math.max(0, len - newCount),
      );
      setRange({ start: newStart, count: newCount });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  if (data.length < 2) {
    return (
      <div
        className="grid place-items-center rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text-muted)"
        style={{ height }}
      >
        Not enough data to render chart.
      </div>
    );
  }

  const visible = data.slice(start, start + count);
  const visMas = masFull.map((m) => ({
    ...m,
    values: m.values.slice(start, start + count),
  }));

  const priceVals = visible.flatMap((d) => [d.high, d.low]);
  const maVals = visMas
    .flatMap((m) => m.values)
    .filter((v): v is number => v !== null);
  const min = Math.min(...priceVals, ...maVals);
  const max = Math.max(...priceVals, ...maVals);
  const span = max - min || 1;

  const candleWidth = Math.max(1, slotWidth * 0.7);
  const xAt = (i: number) => PAD_LEFT + (i + 0.5) * slotWidth;
  const yPrice = (v: number) => CHART_TOP + ((max - v) / span) * CHART_HEIGHT;
  const maxVol = Math.max(1, ...visible.map((d) => d.volume));
  const yVol = (v: number) => VOL_BOTTOM - (v / maxVol) * (VOL_BOTTOM - VOL_TOP);

  // Clamp in case a stale hover index survived a zoom that shrank the window.
  const focusedIdx = clamp(hoverIdx ?? count - 1, 0, visible.length - 1);
  const focused = visible[focusedIdx];
  const focusedColor = focused.close >= focused.open ? UP : DOWN;
  const focusedChange = focused.open
    ? ((focused.close - focused.open) / focused.open) * 100
    : 0;
  const dateLabel = new Date(focused.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    dragRef.current = { clientX: e.clientX, start };
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (drag) {
      const rect = svgRef.current!.getBoundingClientRect();
      const dxPx = ((e.clientX - drag.clientX) / rect.width) * W;
      const dxSlots = Math.round(dxPx / slotWidth);
      const newStart = clamp(drag.start - dxSlots, 0, data.length - count);
      if (newStart !== start) setRange({ start: newStart, count });
      setHoverIdx(null);
      return;
    }
    const localX = pxToLocalX(e.clientX);
    if (localX === null || localX < 0 || localX > INNER_W) {
      setHoverIdx(null);
      return;
    }
    setHoverIdx(localXToIdx(localX));
  };

  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragRef.current) {
      svgRef.current?.releasePointerCapture(e.pointerId);
      dragRef.current = null;
    }
  };

  const resetView = () => {
    const c = Math.min(visibleBars, data.length);
    setRange({ start: Math.max(0, data.length - c), count: c });
  };

  const gridSteps = 5;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = max - (span / gridSteps) * i;
    return { v, y: yPrice(v) };
  });

  const xTickCount = Math.min(6, count);
  const xTicks = Array.from({ length: xTickCount }, (_, i) =>
    Math.round((i / Math.max(1, xTickCount - 1)) * (count - 1)),
  );

  return (
    <div className="relative overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        style={{ height, cursor: dragRef.current ? "grabbing" : "crosshair" }}
        preserveAspectRatio="none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={(e) => {
          endDrag(e);
          setHoverIdx(null);
        }}
        onDoubleClick={resetView}
      >
        {/* Header: OHLC + MA readout */}
        <text x={PAD_LEFT} y={17} fontSize="11" fill="var(--color-text-muted)">
          <tspan>{dateLabel}</tspan>
          <tspan dx="12" fill="var(--color-text-muted)">O</tspan>
          <tspan dx="5" fill={focusedColor} fontWeight="600">
            {formatPlainPrice(focused.open)}
          </tspan>
          <tspan dx="10" fill="var(--color-text-muted)">H</tspan>
          <tspan dx="5" fill={focusedColor} fontWeight="600">
            {formatPlainPrice(focused.high)}
          </tspan>
          <tspan dx="10" fill="var(--color-text-muted)">L</tspan>
          <tspan dx="5" fill={focusedColor} fontWeight="600">
            {formatPlainPrice(focused.low)}
          </tspan>
          <tspan dx="10" fill="var(--color-text-muted)">C</tspan>
          <tspan dx="5" fill={focusedColor} fontWeight="600">
            {formatPlainPrice(focused.close)}
          </tspan>
          <tspan dx="10" fill={focusedColor} fontWeight="600">
            {formatPercent(focusedChange)}
          </tspan>
          <tspan dx="10" fill="var(--color-text-muted)">Vol</tspan>
          <tspan dx="5" fill={focusedColor} fontWeight="600">
            {formatCompact(focused.volume)}
          </tspan>
        </text>
        <text x={PAD_LEFT} y={35} fontSize="11">
          {visMas.map((m, i) => {
            const v = m.values[focusedIdx];
            return (
              <tspan key={m.label} dx={i === 0 ? 0 : 12}>
                <tspan fill={m.color}>{m.label}</tspan>
                <tspan dx="5" fill="var(--color-text)" fontWeight="500">
                  {v === null ? "—" : formatPlainPrice(v)}
                </tspan>
              </tspan>
            );
          })}
        </text>

        {/* Price grid */}
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
            >
              {formatPlainPrice(g.v)}
            </text>
          </g>
        ))}

        {/* Volume baseline + bars */}
        <line
          x1={PAD_LEFT}
          x2={W - PAD_RIGHT}
          y1={VOL_BOTTOM}
          y2={VOL_BOTTOM}
          stroke="var(--color-border)"
          strokeOpacity="0.5"
        />
        {visible.map((d, i) => {
          const up = d.close >= d.open;
          const y = yVol(d.volume);
          return (
            <rect
              key={`v-${start + i}`}
              x={xAt(i) - candleWidth / 2}
              y={y}
              width={candleWidth}
              height={Math.max(1, VOL_BOTTOM - y)}
              fill={up ? UP : DOWN}
              fillOpacity="0.4"
            />
          );
        })}

        {/* Candles */}
        {visible.map((d, i) => {
          const up = d.close >= d.open;
          const color = up ? UP : DOWN;
          const x = xAt(i);
          const yOpen = yPrice(d.open);
          const yClose = yPrice(d.close);
          const bodyTop = Math.min(yOpen, yClose);
          const bodyHeight = Math.max(1, Math.abs(yOpen - yClose));
          return (
            <g key={`c-${start + i}`}>
              <line
                x1={x}
                x2={x}
                y1={yPrice(d.high)}
                y2={yPrice(d.low)}
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
        {visMas.map((m) => {
          let path = "";
          let started = false;
          for (let i = 0; i < m.values.length; i++) {
            const v = m.values[i];
            if (v === null) continue;
            path += `${started ? "L" : "M"} ${xAt(i).toFixed(2)} ${yPrice(v).toFixed(2)} `;
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

        {/* X-axis dates */}
        {xTicks.map((i) => {
          const r = visible[i];
          if (!r) return null;
          return (
            <text
              key={`x-${start + i}`}
              x={xAt(i)}
              y={H - 8}
              fontSize="10"
              fill="var(--color-text-dim)"
              textAnchor="middle"
            >
              {new Date(r.date).toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
              })}
            </text>
          );
        })}

        {/* Crosshair */}
        {hoverIdx !== null && !dragRef.current && (
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

      <span className="pointer-events-none absolute right-3 bottom-2 text-[10px] text-(--color-text-dim)">
        scroll to zoom · drag to pan · double-click to reset
      </span>
    </div>
  );
}
