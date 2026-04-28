"use client";

import { useEffect, useRef } from "react";
import ReactFC from "react-fusioncharts";
import FusionCharts from "fusioncharts";
import Charts from "fusioncharts/fusioncharts.charts";
import Treemap from "fusioncharts/fusioncharts.treemap";
import FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";

ReactFC.fcRoot(FusionCharts, Charts, Treemap, FusionTheme);

// Override the credit renderer at the FusionCharts core level
if (typeof FusionCharts !== "undefined") {
  FusionCharts.options.creditLabel = false;
}

export default function Wrapper(props: any) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // MutationObserver to catch dynamically injected watermark elements
    const observer = new MutationObserver(() => {
      const container = containerRef.current;
      if (!container) return;

      // Hide any anchor linking to fusioncharts.com
      container.querySelectorAll('a[href*="fusioncharts"]').forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });

      // Hide SVG credit groups
      container.querySelectorAll('[class*="creditgroup"], [id*="creditgroup"]').forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      {/* @ts-expect-error react-fusioncharts types are outdated */}
      <ReactFC {...props} />
    </div>
  );
}