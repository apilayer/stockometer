import type { EodRecord } from "@/lib/marketstack";
import { changePercent } from "@/lib/format";
import { STOCKS_BY_SYMBOL, type Sector } from "@/lib/stocks";

export type SectorAggregate = {
  sector: Sector;
  count: number;
  avgChange: number;
  totalVolume: number;
  advancers: number;
  decliners: number;
  topPerformer: { symbol: string; change: number } | null;
  bottomPerformer: { symbol: string; change: number } | null;
  records: EodRecord[];
};

export function aggregateBySector(records: EodRecord[]): SectorAggregate[] {
  const groups = new Map<Sector, EodRecord[]>();
  for (const r of records) {
    const meta = STOCKS_BY_SYMBOL[r.symbol];
    if (!meta) continue;
    const list = groups.get(meta.sector) ?? [];
    list.push(r);
    groups.set(meta.sector, list);
  }

  const result: SectorAggregate[] = [];
  for (const [sector, list] of groups) {
    const changes = list.map((r) => ({
      symbol: r.symbol,
      change: changePercent(r.open, r.close),
    }));
    const avgChange =
      changes.reduce((s, c) => s + c.change, 0) / changes.length;
    const totalVolume = list.reduce((s, r) => s + r.volume, 0);
    const advancers = changes.filter((c) => c.change > 0).length;
    const sortedDesc = [...changes].sort((a, b) => b.change - a.change);
    result.push({
      sector,
      count: list.length,
      avgChange,
      totalVolume,
      advancers,
      decliners: list.length - advancers,
      topPerformer: sortedDesc[0] ?? null,
      bottomPerformer: sortedDesc[sortedDesc.length - 1] ?? null,
      records: list,
    });
  }

  return result.sort((a, b) => b.avgChange - a.avgChange);
}
