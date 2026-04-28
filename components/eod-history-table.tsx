"use client";

import type { EodRecord } from "@/lib/marketstack";
import {
  changePercent,
  formatCompact,
  formatDate,
  formatPercent,
  formatPlainPrice,
} from "@/lib/format";
import { Pagination, usePagination } from "@/components/pagination";

export function EodHistoryTable({ history }: { history: EodRecord[] }) {
  const pagination = usePagination(history, 25);

  return (
    <div className="overflow-x-auto rounded-xl border border-(--color-border) bg-(--color-surface) scrollbar-thin">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wider text-(--color-text-muted)">
          <tr className="border-b border-(--color-border)">
            <th className="px-4 py-3 text-left font-normal">Date</th>
            <th className="px-4 py-3 text-right font-normal">Open</th>
            <th className="px-4 py-3 text-right font-normal">High</th>
            <th className="px-4 py-3 text-right font-normal">Low</th>
            <th className="px-4 py-3 text-right font-normal">Close</th>
            <th className="px-4 py-3 text-right font-normal">Change</th>
            <th className="px-4 py-3 text-right font-normal">Volume</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-(--color-border)/60">
          {pagination.visible.map((r) => {
            const c = changePercent(r.open, r.close);
            return (
              <tr key={r.date} className="hover:bg-(--color-surface-2)">
                <td className="px-4 py-2 text-(--color-text-muted) tabular">
                  {formatDate(r.date)}
                </td>
                <td className="px-4 py-2 text-right tabular">
                  ${formatPlainPrice(r.open)}
                </td>
                <td className="px-4 py-2 text-right tabular">
                  ${formatPlainPrice(r.high)}
                </td>
                <td className="px-4 py-2 text-right tabular">
                  ${formatPlainPrice(r.low)}
                </td>
                <td className="px-4 py-2 text-right tabular font-medium">
                  ${formatPlainPrice(r.close)}
                </td>
                <td
                  className={`px-4 py-2 text-right tabular ${
                    c >= 0 ? "text-(--color-up)" : "text-(--color-down)"
                  }`}
                >
                  {formatPercent(c)}
                </td>
                <td className="px-4 py-2 text-right text-(--color-text-muted) tabular">
                  {formatCompact(r.volume)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination {...pagination} />
    </div>
  );
}
