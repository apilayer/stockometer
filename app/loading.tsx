export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-8 animate-pulse">
      {/* Tabs + stats row */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-7 w-24 rounded-md bg-(--color-surface)" />
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-28 rounded bg-(--color-surface)" />
            ))}
          </div>
          <div className="h-7 w-32 rounded bg-(--color-surface)" />
        </div>
      </div>

      {/* Hero cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 space-y-3"
          >
            <div className="h-3 w-20 rounded bg-(--color-border)" />
            <div className="h-7 w-28 rounded bg-(--color-border)" />
            <div className="h-3 w-16 rounded bg-(--color-border)" />
          </div>
        ))}
      </div>

      {/* Banner */}
      <div className="h-28 rounded-xl border border-(--color-border) bg-(--color-surface)" />

      {/* Market overview charts */}
      <div className="space-y-3">
        <div className="h-6 w-40 rounded bg-(--color-surface)" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-(--color-border) bg-(--color-surface) h-[248px]"
            />
          ))}
        </div>
      </div>

      {/* Stocks table */}
      <div className="space-y-3">
        <div className="h-6 w-56 rounded bg-(--color-surface)" />
        <div className="h-4 w-full max-w-2xl rounded bg-(--color-surface)" />
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface)">
          <div className="border-b border-(--color-border) px-4 py-3">
            <div className="h-4 w-full rounded bg-(--color-border)" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-(--color-border)/60 px-4 py-3"
            >
              <div className="size-8 shrink-0 rounded-full bg-(--color-border)" />
              <div className="h-4 flex-1 rounded bg-(--color-border)" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
