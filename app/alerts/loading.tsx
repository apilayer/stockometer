export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded-lg bg-(--color-surface)" />
      <div className="h-4 w-80 rounded bg-(--color-surface)" />

      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-(--color-border)" />
              <div className="space-y-1.5">
                <div className="h-4 w-16 rounded bg-(--color-border)" />
                <div className="h-3 w-24 rounded bg-(--color-border)" />
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-(--color-border)" />
          </div>
        ))}
      </div>
    </div>
  );
}
