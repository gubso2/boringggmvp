"use client";

import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
}: {
  /** 0..1 */
  value: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-ink-100",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-ink-950 transition-[width] duration-500 ease-out"
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}
