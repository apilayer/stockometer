export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      <div className="h-8 w-56 rounded-lg bg-(--color-surface)" />
      <div className="h-4 w-80 rounded bg-(--color-surface)" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 space-y-2"
          >
            <div className="h-3 w-20 rounded bg-(--color-border)" />
            <div className="h-7 w-28 rounded bg-(--color-border)" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) h-80" />
    </div>
  );
}
