"use client";

import { useMemo, useState } from "react";

const DEFAULT_PAGE_SIZE = 25;

export function usePagination<T>(
  items: T[],
  initialPageSize: number = DEFAULT_PAGE_SIZE,
) {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);

  const visible = useMemo(() => {
    const start = safePage * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const start = items.length === 0 ? 0 : safePage * pageSize + 1;
  const end = Math.min((safePage + 1) * pageSize, items.length);

  return {
    visible,
    page: safePage,
    totalPages,
    pageSize,
    start,
    end,
    total: items.length,
    setPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(0);
    },
    reset: () => setPage(0),
  };
}

export function Pagination({
  page,
  totalPages,
  pageSize,
  start,
  end,
  total,
  setPage,
  setPageSize,
  pageSizeOptions = [10, 25, 50, 100],
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  start: number;
  end: number;
  total: number;
  setPage: (n: number) => void;
  setPageSize: (n: number) => void;
  pageSizeOptions?: number[];
}) {
  if (total === 0) return null;

  const pages = pageRange(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--color-border) px-4 py-3 text-xs text-(--color-text-muted)">
      <div className="flex items-center gap-2">
        <span>
          Showing <span className="text-(--color-text) tabular">{start}</span>–
          <span className="text-(--color-text) tabular">{end}</span> of{" "}
          <span className="text-(--color-text) tabular">{total}</span>
        </span>
        <span className="text-(--color-text-dim)">·</span>
        <label className="flex items-center gap-1.5">
          <span>Rows</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded border border-(--color-border) bg-(--color-surface) px-1.5 py-0.5 text-(--color-text) outline-none transition-colors focus:border-(--color-brand)"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-1">
        <PageButton
          onClick={() => setPage(0)}
          disabled={page === 0}
          aria-label="First page"
        >
          «
        </PageButton>
        <PageButton
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          aria-label="Previous page"
        >
          ‹
        </PageButton>
        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`gap-${i}`}
              className="px-2 text-(--color-text-dim)"
            >
              …
            </span>
          ) : (
            <PageButton
              key={p}
              onClick={() => setPage(p)}
              active={p === page}
            >
              {p + 1}
            </PageButton>
          ),
        )}
        <PageButton
          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          aria-label="Next page"
        >
          ›
        </PageButton>
        <PageButton
          onClick={() => setPage(totalPages - 1)}
          disabled={page >= totalPages - 1}
          aria-label="Last page"
        >
          »
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
  ...rest
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-7 rounded px-2 py-1 text-center transition-colors ${
        active
          ? "bg-(--color-brand) text-white font-semibold"
          : disabled
            ? "text-(--color-text-dim) cursor-not-allowed"
            : "text-(--color-text) hover:bg-(--color-surface-2)"
      }`}
      {...rest}
    >
      {children}
    </button>
  );
}

function pageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const out: (number | "…")[] = [0];
  const left = Math.max(1, current - 1);
  const right = Math.min(total - 2, current + 1);
  if (left > 1) out.push("…");
  for (let i = left; i <= right; i++) out.push(i);
  if (right < total - 2) out.push("…");
  out.push(total - 1);
  return out;
}
