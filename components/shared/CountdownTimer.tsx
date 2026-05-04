"use client";

import { useEffect, useState } from "react";
import { timeUntil } from "@/lib/utils";

export function CountdownTimer({
  endAt,
  compact = false,
}: {
  endAt: string;
  compact?: boolean;
}) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const tick = () => setNow((n) => n + 1);
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const t = timeUntil(endAt);
  // depend on `now` so re-renders happen each second
  void now;

  if (t.expired) {
    return (
      <span className="font-mono text-xs uppercase tracking-wide text-ink-400">
        Closed
      </span>
    );
  }

  if (compact) {
    return (
      <span className="font-mono text-xs tabular-nums text-ink-600">
        {t.days}d {String(t.hours).padStart(2, "0")}h{" "}
        {String(t.minutes).padStart(2, "0")}m
      </span>
    );
  }

  return (
    <span className="font-mono text-sm tabular-nums text-ink-700">
      {t.days}d {String(t.hours).padStart(2, "0")}h{" "}
      {String(t.minutes).padStart(2, "0")}m {String(t.seconds).padStart(2, "0")}
      s
    </span>
  );
}
