"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function LiveRefresh({
  intervalMs = 65_000,
  label = "Live",
}: {
  intervalMs?: number;
  label?: string;
}) {
  const router = useRouter();
  const [pulse, setPulse] = useState(0);
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled || document.hidden) return;
      lastTickRef.current = Date.now();
      router.refresh();
      setPulse((p) => p + 1);
    };
    const id = window.setInterval(tick, intervalMs);
    const onVisible = () => {
      if (!document.hidden && Date.now() - lastTickRef.current > intervalMs) {
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, intervalMs]);

  return (
    <span
      key={pulse}
      className="inline-flex items-center gap-1.5 text-xs text-(--color-text-muted)"
      aria-live="polite"
    >
      <span className="relative inline-flex size-2">
        {/* <span className="absolute inset-0 animate-ping rounded-full bg-(--color-up) opacity-75" /> */}
        {/* <span className="relative inline-flex size-2 rounded-full bg-(--color-up)" /> */}
      </span>
      <span>
        {/* {label} · refreshes every {Math.round(intervalMs / 1000)}s */}
      </span>
    </span>
  );
}
