"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { type EodRecord } from "@/lib/marketstack";
import { STOCKS_BY_SYMBOL, SECTORS } from "@/lib/stocks";

const ReactFC = dynamic(() => import("./fusioncharts-wrapper"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-(--color-border)/20" />,
});

export function MarketCharts({ records }: { records: EodRecord[] }) {
  const {
    breadthData,
    topMoversData,
    volumeBySectorData,
    sectorPerformanceData,
  } = useMemo(() => {
    // 1. Breadth
    let advancers = 0;
    let decliners = 0;
    let flat = 0;

    const withChange = records.map((r) => {
      const changePct = ((r.close - r.open) / r.open) * 100;
      return { ...r, changePct };
    });

    withChange.forEach((r) => {
      if (r.changePct > 0) advancers++;
      else if (r.changePct < 0) decliners++;
      else flat++;
    });

    const breadthData = [
      { label: "Advancing", value: advancers, color: "#37c625" },
      { label: "Declining", value: decliners, color: "#f6465d" },
      { label: "Unchanged", value: flat, color: "#8b949e" },
    ].filter((d) => d.value > 0);

    // 2. Top Movers
    const sortedByChange = [...withChange].sort(
      (a, b) => b.changePct - a.changePct
    );
    const topGainers = sortedByChange.slice(0, 5);
    const topLosers = sortedByChange.slice(-5).reverse();
    const topMoversData = [
      ...topGainers.map((r) => ({
        label: r.symbol,
        value: Number(r.changePct.toFixed(2)),
        color: "#37c625",
      })),
      ...topLosers.map((r) => ({
        label: r.symbol,
        value: Number(r.changePct.toFixed(2)),
        color: "#f6465d",
      })),
    ];

    // 3. Volume & 4. Performance by Sector
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

    const sectorColors = [
      "#2480fc",
      "#0052cc",
      "#37c625",
      "#f6465d",
      "#9b59f6",
      "#ff8a3d",
      "#15c0e8",
    ];

    const volumeBySectorData = SECTORS.map((s, i) => ({
      label: s,
      value: sectorStats[s].volume,
      fillcolor: sectorColors[i % sectorColors.length],
    })).filter((d) => d.value > 0);

    const sectorPerformanceData = SECTORS.map((s) => {
      const stats = sectorStats[s];
      const avgChange = stats.count > 0 ? stats.sumChange / stats.count : 0;
      return {
        label: s,
        value: Number(avgChange.toFixed(2)),
        color: avgChange >= 0 ? "#37c625" : "#f6465d",
      };
    }).filter((d) => sectorStats[d.label].count > 0);

    return {
      breadthData,
      topMoversData,
      volumeBySectorData,
      sectorPerformanceData,
    };
  }, [records]);

  if (records.length === 0) return null;

  const chartTheme = {
    theme: "fusion",
    bgColor: "#000000",
    bgAlpha: "0",
    canvasBgColor: "#000000",
    canvasBgAlpha: "0",
    showBorder: "0",
    showCanvasBorder: "0",
    baseFontColor: "#8b949e",
    baseFontSize: "11",
    showShadow: "0",
    numberPrefix: "",
    showValues: "0",
    plotSpacePercent: "40",
    divLineAlpha: "10",
    showAlternateHGridColor: "0",
    toolTipBgColor: "#161b22",
    toolTipBorderColor: "#30363d",
    toolTipColor: "#c9d1d9",
    toolTipBorderThickness: "0",
    toolTipBgAlpha: "95",
    toolTipBorderRadius: "4",
    toolTipPadding: "6",
    use3DLighting: "0",
    chartTopMargin: "0",
    chartBottomMargin: "0",
    chartLeftMargin: "0",
    chartRightMargin: "0",
    canvasTopMargin: "5",
    canvasBottomMargin: "5",
    canvasLeftMargin: "5",
    canvasRightMargin: "5",
    legendBorderAlpha: "0",
    legendShadow: "0",
    legendBgAlpha: "0",
    legendItemFontColor: "#8b949e",
    legendItemFontSize: "10",
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3 shadow-sm">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-(--color-text-dim)">
          Market Breadth
        </h3>
        <ReactFC
          type="doughnut2d"
          width="100%"
          height="220"
          dataFormat="json"
          dataSource={{
            chart: {
              ...chartTheme,
              pieRadius: "70",
              doughnutRadius: "50",
              enableSmartLabels: "1",
              showPercentValues: "1",
              showLabels: "1",
              labelFontColor: "#8b949e",
              labelFontSize: "10",
              showLegend: "0",
              centerLabel: "$label: $value",
              centerLabelColor: "#c9d1d9",
              centerLabelFontSize: "11",
              startingAngle: "310",
              decimals: "0",
            },
            data: breadthData,
          }}
        />
      </div>

      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3 shadow-sm">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-(--color-text-dim)">
          Volume by Sector
        </h3>
        <ReactFC
          type="treemap"
          width="100%"
          height="220"
          dataFormat="json"
          dataSource={{
            chart: {
              ...chartTheme,
              algorithm: "squarified",
              hideTitle: "1",
              plotToolText: "$label: $dataValue",
              showNavigator: "0",
              labelFontColor: "#ffffff",
              labelFontSize: "11",
              labelFontBold: "1",
            },
            data: [{ label: "All Sectors", color: "#161b22", data: volumeBySectorData }],
          }}
        />
      </div>

      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3 shadow-sm">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-(--color-text-dim)">
          Top Movers (%)
        </h3>
        <ReactFC
          type="column2d"
          width="100%"
          height="220"
          dataFormat="json"
          dataSource={{
            chart: {
              ...chartTheme,
              numberSuffix: "%",
              showYAxisValues: "1",
              yAxisValueFontColor: "#8b949e",
              yAxisValueFontSize: "9",
              labelFontColor: "#8b949e",
              labelFontSize: "9",
              plotSpacePercent: "30",
              maxColWidth: "28",
              plotBorderThickness: "0",
              usePlotGradientColor: "0",
              paletteColors: "#37c625,#37c625,#37c625,#37c625,#37c625,#f6465d,#f6465d,#f6465d,#f6465d,#f6465d",
            },
            data: topMoversData,
          }}
        />
      </div>

      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3 shadow-sm">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-(--color-text-dim)">
          Sector Performance (%)
        </h3>
        <ReactFC
          type="bar2d"
          width="100%"
          height="220"
          dataFormat="json"
          dataSource={{
            chart: {
              ...chartTheme,
              numberSuffix: "%",
              showYAxisValues: "1",
              yAxisValueFontColor: "#8b949e",
              yAxisValueFontSize: "9",
              labelFontColor: "#8b949e",
              labelFontSize: "10",
              plotSpacePercent: "30",
              maxBarHeight: "20",
              plotBorderThickness: "0",
              usePlotGradientColor: "0",
            },
            data: sectorPerformanceData,
          }}
        />
      </div>
    </div>
  );
}
