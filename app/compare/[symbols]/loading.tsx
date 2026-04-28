export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      <div className="h-8 w-52 rounded-lg bg-(--color-surface)" />
      <div className="h-4 w-96 rounded bg-(--color-surface)" />

      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) h-[500px]" />
    </div>
  );
}
