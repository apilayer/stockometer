"use client";

import { useMemo, useRef, useState } from "react";
import type { EodRecord } from "@/lib/marketstack";
import { formatPlainPrice } from "@/lib/format";

const COLORS = [
  "#2480fc",
  "#0ecb81",
  "#f6465d",
  "#9b59f6",
  "#ff8a3d",
  "#15c0e8",
  "#ff5fa3",
  "#f0b90b",
];

export type CompareSeries = {
  symbol: string;
  history: EodRecord[];
};

const W = 1200;
const H = 420;
const PAD_LEFT = 16;
const PAD_RIGHT = 60;
const PAD_TOP = 56;
const PAD_BOTTOM = 28;

export function CompareChart({ series }: { series: CompareSeries[] }) {
  const valid = series.filter((s) => s.history.length >= 2);

  const normalized = useMemo(() => {
    return valid.map((s, i) => {
      const ordered = [...s.history].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      const base = ordered[0].close || 1;
      const points = ordered.map((r) => ({
        date: r.date,
        close: r.close,
        value: (r.close / base) * 100,
      }));
      return { symbol: s.symbol, color: COLORS[i % COLORS.length], points };
    });
  }, [valid]);

  const maxLen = Math.max(0, ...normalized.map((s) => s.points.length));
  const allValues = normalized.flatMap((s) => s.points.map((p) => p.value));
  const min = allValues.length ? Math.min(...allValues, 100) : 90;
  const max = allValues.length ? Math.max(...allValues, 100) : 110;
  const span = max - min || 1;

  const innerW = W - PAD_LEFT - PAD_RIGHT;
  const innerH = H - PAD_TOP - PAD_BOTTOM;

  const xAt = (i: number) =>
    PAD_LEFT + (maxLen <= 1 ? innerW / 2 : (i / (maxLen - 1)) * innerW);
  const yAt = (v: number) => PAD_TOP + ((max - v) / span) * innerH;

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (normalized.length === 0) {
    return (
      <div className="grid h-80 place-items-center rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-text-muted)">
        Not enough data to render comparison chart.
      </div>
    );
  }

  const focusedIdx = hoverIdx ?? maxLen - 1;
  const baselineY = yAt(100);

  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = max - (span / gridSteps) * i;
    return { v, y: yAt(v) };
  });

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const localX = px - PAD_LEFT;
    if (localX < 0 || localX > innerW || maxLen <= 1) {
      setHoverIdx(null);
      return;
    }
    const idx = Math.round((localX / innerW) * (maxLen - 1));
    setHoverIdx(Math.max(0, Math.min(maxLen - 1, idx)));
  };

  const focusedDate = (() => {
    const series = normalized.find((s) => focusedIdx < s.points.length);
    return series?.points[Math.min(focusedIdx, series.points.length - 1)].date;
  })();

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
        {/* Header legend */}
        <text
          x={PAD_LEFT}
          y={20}
          fontSize="11"
          fill="var(--color-text-muted)"
        >
          {focusedDate && (
            <>
              <tspan>
                {new Date(focusedDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </tspan>
              <tspan dx="14" fill="var(--color-text-dim)">
                indexed to 100
              </tspan>
            </>
          )}
        </text>
        <text x={PAD_LEFT} y={42} fontSize="11">
          {normalized.map((s, i) => {
            const point = s.points[Math.min(focusedIdx, s.points.length - 1)];
            const change = point ? point.value - 100 : 0;
            return (
              <tspan key={s.symbol} dx={i === 0 ? 0 : 14}>
                <tspan fill={s.color} fontWeight="700">●</tspan>
                <tspan dx="4" fill="var(--color-text)" fontWeight="600">
                  {s.symbol}
                </tspan>
                <tspan
                  dx="6"
                  fill={change >= 0 ? "#0ecb81" : "#f6465d"}
                  fontWeight="600"
                >
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(2)}%
                </tspan>
                {point && (
                  <tspan dx="6" fill="var(--color-text-muted)">
                    ${formatPlainPrice(point.close)}
                  </tspan>
                )}
              </tspan>
            );
          })}
        </text>

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
            >
              {g.v.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Baseline at 100 */}
        <line
          x1={PAD_LEFT}
          x2={W - PAD_RIGHT}
          y1={baselineY}
          y2={baselineY}
          stroke="var(--color-text-muted)"
          strokeOpacity="0.5"
        />

        {/* Series lines */}
        {normalized.map((s) => {
          const path = s.points
            .map((p, i) => {
              const x = xAt(i);
              const y = yAt(p.value);
              return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
            })
            .join(" ");
          return (
            <path
              key={s.symbol}
              d={path}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}

        {/* X labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const idx = Math.round(t * (maxLen - 1));
          const series = normalized.find((s) => idx < s.points.length);
          const r = series?.points[idx];
          if (!r) return null;
          return (
            <text
              key={`x-${idx}`}
              x={xAt(idx)}
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

        {/* Crosshair + per-series dots */}
        {hoverIdx !== null && (
          <g pointerEvents="none">
            <line
              x1={xAt(hoverIdx)}
              x2={xAt(hoverIdx)}
              y1={PAD_TOP}
              y2={H - PAD_BOTTOM}
              stroke="var(--color-text-muted)"
              strokeOpacity="0.5"
              strokeDasharray="3 4"
            />
            {normalized.map((s) => {
              const p = s.points[Math.min(hoverIdx, s.points.length - 1)];
              if (!p) return null;
              return (
                <circle
                  key={`d-${s.symbol}`}
                  cx={xAt(hoverIdx)}
                  cy={yAt(p.value)}
                  r={4}
                  fill={s.color}
                  stroke="var(--color-bg)"
                  strokeWidth="2"
                />
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}
