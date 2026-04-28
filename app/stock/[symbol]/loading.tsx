export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 rounded bg-(--color-surface)" />
          <div className="h-3 w-64 rounded bg-(--color-surface)" />
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0 space-y-6">
          {/* Price card skeleton */}
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-xl bg-(--color-border)" />
              <div className="space-y-2">
                <div className="h-6 w-24 rounded bg-(--color-border)" />
                <div className="h-4 w-40 rounded bg-(--color-border)" />
              </div>
            </div>
            <div className="h-10 w-36 rounded bg-(--color-border)" />
          </div>

          {/* Chart skeleton */}
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) h-80" />

          {/* Table skeleton */}
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) h-64" />
        </div>

        <div className="hidden lg:block w-[300px] rounded-xl border border-(--color-border) bg-(--color-surface) h-96" />
      </div>
    </div>
  );
}
