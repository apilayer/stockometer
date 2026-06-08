import { type EodRecord } from "@/lib/marketstack";
import { STOCKS_BY_SYMBOL, SECTORS } from "@/lib/stocks";
import { formatCompact } from "@/lib/format";

const UP = "#37c625";
const DOWN = "#f6465d";
const FLAT = "#8b949e";

const SECTOR_COLORS = [
  "#2480fc",
  "#0052cc",
  "#37c625",
  "#f6465d",
  "#9b59f6",
  "#ff8a3d",
  "#15c0e8",
];

type Slice = { label: string; value: number; color: string };
type Bar = { label: string; value: number; color: string };

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3 shadow-sm">
      <h3 className="mb-1 text-xs font-semibold tracking-wider text-(--color-text-dim) uppercase">
        {title}
      </h3>
      <div className="h-[220px] w-full">{children}</div>
    </div>
  );
}

/* ---------- Market Breadth: donut ---------- */

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}

function DonutChart({ slices }: { slices: Slice[] }) {
  const total = slices.reduce((s, d) => s + d.value, 0) || 1;
  const cx = 100;
  const cy = 100;
  const rOuter = 78;
  const rInner = 52;

  let angle = 0;
  const segments = slices.map((s) => {
    const start = angle;
    const sweep = (s.value / total) * 360;
    angle += sweep;
    return { ...s, start, end: angle, pct: (s.value / total) * 100 };
  });

  const single = segments.length === 1;

  return (
    <svg
      viewBox="0 0 600 200"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
    >
      {single ? (
        <>
          <circle cx={cx} cy={cy} r={rOuter} fill={segments[0].color} />
          <circle cx={cx} cy={cy} r={rInner} fill="var(--color-surface)" />
        </>
      ) : (
        segments.map((seg) => {
          const [x1, y1] = polar(cx, cy, rOuter, seg.end);
          const [x2, y2] = polar(cx, cy, rOuter, seg.start);
          const [x3, y3] = polar(cx, cy, rInner, seg.start);
          const [x4, y4] = polar(cx, cy, rInner, seg.end);
          const large = seg.end - seg.start > 180 ? 1 : 0;
          const d = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${large} 0 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${large} 1 ${x4} ${y4} Z`;
          return (
            <path key={seg.label} d={d} fill={seg.color}>
              <title>{`${seg.label}: ${seg.value} (${seg.pct.toFixed(0)}%)`}</title>
            </path>
          );
        })
      )}

      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize="22"
        fontWeight="700"
        fill="var(--color-text)"
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fontSize="11"
        fill="var(--color-text-dim)"
      >
        tickers
      </text>

      {/* Legend */}
      {segments.map((seg, i) => {
        const y = 64 + i * 30;
        return (
          <g key={seg.label}>
            <rect x={236} y={y - 10} width={12} height={12} rx={3} fill={seg.color} />
            <text x={256} y={y} fontSize="13" fill="var(--color-text)">
              {seg.label}
            </text>
            <text
              x={560}
              y={y}
              textAnchor="end"
              fontSize="13"
              fontWeight="600"
              fill="var(--color-text-muted)"
            >
              {seg.value}
              <tspan dx="6" fill="var(--color-text-dim)">
                {seg.pct.toFixed(0)}%
              </tspan>
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Top Movers: vertical columns around a zero line ---------- */

function ColumnChart({ bars }: { bars: Bar[] }) {
  const W = 600;
  const padX = 20;
  const zeroY = 100;
  const maxBarPx = 70;
  const innerW = W - padX * 2;
  const maxAbs = Math.max(1, ...bars.map((b) => Math.abs(b.value)));
  const scale = maxBarPx / maxAbs;
  const slot = innerW / Math.max(1, bars.length);
  const barW = Math.min(30, slot * 0.62);

  return (
    <svg
      viewBox="0 0 600 220"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
    >
      <line
        x1={padX}
        x2={W - padX}
        y1={zeroY}
        y2={zeroY}
        stroke="var(--color-border)"
        strokeOpacity="0.7"
      />
      {bars.map((b, i) => {
        const cx = padX + slot * i + slot / 2;
        const h = Math.abs(b.value) * scale;
        const up = b.value >= 0;
        const y = up ? zeroY - h : zeroY;
        return (
          <g key={`${b.label}-${i}`}>
            <rect
              x={cx - barW / 2}
              y={y}
              width={barW}
              height={Math.max(1, h)}
              rx={3}
              fill={b.color}
            >
              <title>{`${b.label}: ${b.value > 0 ? "+" : ""}${b.value}%`}</title>
            </rect>
            <text
              x={cx}
              y={up ? y - 5 : y + h + 13}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill={b.color}
            >
              {b.value > 0 ? "+" : ""}
              {b.value}%
            </text>
            <text
              x={cx}
              y={212}
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-text-muted)"
            >
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Volume by Sector: horizontal bars ---------- */

function HBarChart({ bars }: { bars: Bar[] }) {
  const labelX = 8;
  const barX0 = 122;
  const barXMax = 470;
  const top = 14;
  const bottom = 188;
  const rows = bars.length || 1;
  const rowH = (bottom - top) / rows;
  const max = Math.max(1, ...bars.map((b) => b.value));

  return (
    <svg
      viewBox="0 0 600 200"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
    >
      {bars.map((b, i) => {
        const cy = top + rowH * i + rowH / 2;
        const w = (b.value / max) * (barXMax - barX0);
        const barH = Math.min(18, rowH * 0.6);
        return (
          <g key={b.label}>
            <text
              x={labelX}
              y={cy + 4}
              fontSize="12"
              fill="var(--color-text-muted)"
            >
              {b.label.length > 14 ? `${b.label.slice(0, 13)}…` : b.label}
            </text>
            <rect
              x={barX0}
              y={cy - barH / 2}
              width={Math.max(2, w)}
              height={barH}
              rx={3}
              fill={b.color}
            >
              <title>{`${b.label}: ${formatCompact(b.value)}`}</title>
            </rect>
            <text
              x={barX0 + Math.max(2, w) + 8}
              y={cy + 4}
              fontSize="11"
              fontWeight="600"
              fill="var(--color-text)"
            >
              {formatCompact(b.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Sector Performance: diverging horizontal bars ---------- */

function DivergingBarChart({ bars }: { bars: Bar[] }) {
  const labelX = 8;
  const center = 300;
  const halfW = 175;
  const top = 14;
  const bottom = 188;
  const rows = bars.length || 1;
  const rowH = (bottom - top) / rows;
  const maxAbs = Math.max(1, ...bars.map((b) => Math.abs(b.value)));
  const scale = halfW / maxAbs;

  return (
    <svg
      viewBox="0 0 600 200"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
    >
      <line
        x1={center}
        x2={center}
        y1={top}
        y2={bottom}
        stroke="var(--color-border)"
        strokeOpacity="0.7"
      />
      {bars.map((b, i) => {
        const cy = top + rowH * i + rowH / 2;
        const w = Math.abs(b.value) * scale;
        const up = b.value >= 0;
        const x = up ? center : center - w;
        const barH = Math.min(16, rowH * 0.55);
        return (
          <g key={b.label}>
            <text
              x={labelX}
              y={cy + 4}
              fontSize="12"
              fill="var(--color-text-muted)"
            >
              {b.label.length > 14 ? `${b.label.slice(0, 13)}…` : b.label}
            </text>
            <rect
              x={x}
              y={cy - barH / 2}
              width={Math.max(1, w)}
              height={barH}
              rx={3}
              fill={b.color}
            >
              <title>{`${b.label}: ${b.value > 0 ? "+" : ""}${b.value}%`}</title>
            </rect>
            <text
              x={up ? center + w + 6 : center - w - 6}
              y={cy + 4}
              textAnchor={up ? "start" : "end"}
              fontSize="11"
              fontWeight="600"
              fill={b.color}
            >
              {b.value > 0 ? "+" : ""}
              {b.value}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Container: computes data, renders the four charts ---------- */

export function MarketCharts({ records }: { records: EodRecord[] }) {
  if (records.length === 0) return null;

  const withChange = records.map((r) => ({
    ...r,
    changePct: ((r.close - r.open) / r.open) * 100,
  }));

  // 1. Breadth
  let advancers = 0;
  let decliners = 0;
  let flat = 0;
  withChange.forEach((r) => {
    if (r.changePct > 0) advancers++;
    else if (r.changePct < 0) decliners++;
    else flat++;
  });
  const breadthData: Slice[] = [
    { label: "Advancing", value: advancers, color: UP },
    { label: "Declining", value: decliners, color: DOWN },
    { label: "Unchanged", value: flat, color: FLAT },
  ].filter((d) => d.value > 0);

  // 2. Top Movers
  const sortedByChange = [...withChange].sort(
    (a, b) => b.changePct - a.changePct,
  );
  const topGainers = sortedByChange.slice(0, 5);
  const topLosers = sortedByChange.slice(-5).reverse();
  const topMoversData: Bar[] = [
    ...topGainers.map((r) => ({
      label: r.symbol,
      value: Number(r.changePct.toFixed(2)),
      color: UP,
    })),
    ...topLosers.map((r) => ({
      label: r.symbol,
      value: Number(r.changePct.toFixed(2)),
      color: DOWN,
    })),
  ];

  // 3 & 4. Sector volume + performance
  const sectorStats: Record<
    string,
    { volume: number; sumChange: number; count: number }
  > = {};
  SECTORS.forEach((s) => {
    sectorStats[s] = { volume: 0, sumChange: 0, count: 0 };
  });
  withChange.forEach((r) => {
    const sector = STOCKS_BY_SYMBOL[r.symbol]?.sector;
    if (sector && sectorStats[sector]) {
      sectorStats[sector].volume += r.volume;
      sectorStats[sector].sumChange += r.changePct;
      sectorStats[sector].count += 1;
    }
  });

  const volumeBySectorData: Bar[] = SECTORS.map((s, i) => ({
    label: s,
    value: sectorStats[s].volume,
    color: SECTOR_COLORS[i % SECTOR_COLORS.length],
  }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const sectorPerformanceData: Bar[] = SECTORS.map((s) => {
    const stats = sectorStats[s];
    const avg = stats.count > 0 ? stats.sumChange / stats.count : 0;
    return {
      label: s,
      value: Number(avg.toFixed(2)),
      color: avg >= 0 ? UP : DOWN,
    };
  })
    .filter((d) => sectorStats[d.label].count > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
      <ChartCard title="Market Breadth">
        <DonutChart slices={breadthData} />
      </ChartCard>
      <ChartCard title="Volume by Sector">
        <HBarChart bars={volumeBySectorData} />
      </ChartCard>
      <ChartCard title="Top Movers (%)">
        <ColumnChart bars={topMoversData} />
      </ChartCard>
      <ChartCard title="Sector Performance (%)">
        <DivergingBarChart bars={sectorPerformanceData} />
      </ChartCard>
    </div>
  );
}
