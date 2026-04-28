"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { SECTORS, type Sector } from "@/lib/stocks";

export type ScreenerParams = {
  sectors: Sector[];
  minPrice: number | null;
  maxPrice: number | null;
  minChange: number | null;
  maxChange: number | null;
  minVolume: number | null;
  sort: "change" | "price" | "volume" | "name";
  dir: "asc" | "desc";
};

export function ScreenerFilters({
  initial,
  totalCount,
  matchCount,
}: {
  initial: ScreenerParams;
  totalCount: number;
  matchCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = (patch: Partial<ScreenerParams>) => {
    const merged = { ...initial, ...patch };
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (merged.sectors.length > 0)
      params.set("sectors", merged.sectors.join(","));
    else params.delete("sectors");

    setOrDelete(params, "min", merged.minPrice);
    setOrDelete(params, "max", merged.maxPrice);
    setOrDelete(params, "change_min", merged.minChange);
    setOrDelete(params, "change_max", merged.maxChange);
    setOrDelete(params, "volume_min", merged.minVolume);

    if (merged.sort !== "change") params.set("sort", merged.sort);
    else params.delete("sort");

    if (merged.dir !== "desc") params.set("dir", merged.dir);
    else params.delete("dir");

    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/screener?${qs}` : "/screener", { scroll: false });
    });
  };

  const toggleSector = (s: Sector) => {
    const has = initial.sectors.includes(s);
    update({
      sectors: has
        ? initial.sectors.filter((x) => x !== s)
        : [...initial.sectors, s],
    });
  };

  const reset = () =>
    startTransition(() => {
      router.replace("/screener", { scroll: false });
    });

  const activeFilters =
    initial.sectors.length +
    [
      initial.minPrice,
      initial.maxPrice,
      initial.minChange,
      initial.maxChange,
      initial.minVolume,
    ].filter((v) => v !== null).length;

  return (
    <div
      className={`rounded-xl border border-(--color-border) bg-(--color-surface) ${
        pending ? "opacity-80" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--color-border) px-4 py-3">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tabular">{matchCount}</span>
          <span className="text-sm text-(--color-text-muted)">
            of {totalCount} match
          </span>
          {activeFilters > 0 && (
            <span className="rounded-full bg-(--color-brand)/15 px-2 py-0.5 text-[11px] font-medium text-(--color-brand)">
              {activeFilters} filter{activeFilters === 1 ? "" : "s"}
            </span>
          )}
        </div>
        {activeFilters > 0 && (
          <button
            onClick={reset}
            className="text-xs text-(--color-text-muted) underline-offset-2 hover:text-(--color-down) hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <Field label="Sectors">
          <div className="flex flex-wrap gap-1.5">
            {SECTORS.map((s) => {
              const active = initial.sectors.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSector(s)}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    active
                      ? "bg-(--color-brand) text-white"
                      : "bg-(--color-bg) text-(--color-text-muted) hover:text-(--color-text)"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Price (USD)">
          <RangeInputs
            min={initial.minPrice}
            max={initial.maxPrice}
            onMin={(v) => update({ minPrice: v })}
            onMax={(v) => update({ maxPrice: v })}
          />
        </Field>

        <Field label="Day change (%)">
          <RangeInputs
            min={initial.minChange}
            max={initial.maxChange}
            onMin={(v) => update({ minChange: v })}
            onMax={(v) => update({ maxChange: v })}
            step={0.1}
          />
        </Field>

        <Field label="Min volume">
          <input
            type="number"
            inputMode="numeric"
            placeholder="e.g. 1000000"
            defaultValue={initial.minVolume ?? ""}
            onBlur={(e) =>
              update({
                minVolume: e.target.value ? Number(e.target.value) : null,
              })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="w-full rounded-md border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-sm tabular outline-none transition-colors focus:border-(--color-brand)"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--color-border) px-4 py-3 text-xs text-(--color-text-muted)">
        <div className="flex items-center gap-2">
          <span>Sort by</span>
          <select
            value={initial.sort}
            onChange={(e) =>
              update({ sort: e.target.value as ScreenerParams["sort"] })
            }
            className="rounded border border-(--color-border) bg-(--color-bg) px-2 py-1 text-(--color-text) outline-none focus:border-(--color-brand)"
          >
            <option value="change">Day Change</option>
            <option value="price">Price</option>
            <option value="volume">Volume</option>
            <option value="name">Symbol</option>
          </select>
          <select
            value={initial.dir}
            onChange={(e) =>
              update({ dir: e.target.value as ScreenerParams["dir"] })
            }
            className="rounded border border-(--color-border) bg-(--color-bg) px-2 py-1 text-(--color-text) outline-none focus:border-(--color-brand)"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        <span className="text-(--color-text-dim)">
          Filters update the URL — share or bookmark this screen.
        </span>
      </div>
    </div>
  );
}

function setOrDelete(
  params: URLSearchParams,
  key: string,
  value: number | null,
) {
  if (value === null || Number.isNaN(value)) params.delete(key);
  else params.set(key, String(value));
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-[11px] uppercase tracking-wider text-(--color-text-muted)">
        {label}
      </div>
      {children}
    </div>
  );
}

function RangeInputs({
  min,
  max,
  onMin,
  onMax,
  step = 1,
}: {
  min: number | null;
  max: number | null;
  onMin: (v: number | null) => void;
  onMax: (v: number | null) => void;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        inputMode="decimal"
        step={step}
        placeholder="min"
        defaultValue={min ?? ""}
        onBlur={(e) => onMin(e.target.value ? Number(e.target.value) : null)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="w-full rounded-md border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-sm tabular outline-none transition-colors focus:border-(--color-brand)"
      />
      <span className="text-(--color-text-dim)">–</span>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        placeholder="max"
        defaultValue={max ?? ""}
        onBlur={(e) => onMax(e.target.value ? Number(e.target.value) : null)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="w-full rounded-md border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-sm tabular outline-none transition-colors focus:border-(--color-brand)"
      />
    </div>
  );
}
