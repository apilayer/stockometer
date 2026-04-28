import Link from "next/link";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-(--color-down)/40 bg-(--color-down)/10 p-4">
      <div className="font-semibold text-(--color-down)">
        Couldn&apos;t load market data
      </div>
      <div className="mt-1 text-sm text-(--color-text-muted)">{message}</div>
      <div className="mt-2 text-xs text-(--color-text-dim)">
        Check that <code>MARKETSTACK_API_KEY</code> is set in{" "}
        <code>.env.local</code> and that you haven&apos;t exhausted your quota.{" "}
        <Link href="/" className="text-(--color-brand) hover:underline">
          Reload
        </Link>
        .
      </div>
    </div>
  );
}
