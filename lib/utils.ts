import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function formatPriceCompact(cents: number) {
  const dollars = cents / 100;
  if (Number.isInteger(dollars)) {
    return `$${dollars}`;
  }
  return `$${dollars.toFixed(2)}`;
}

/**
 * Returns components of the time remaining until `endAt`.
 * Negative when expired.
 */
export function timeUntil(endAt: string | Date) {
  const end = typeof endAt === "string" ? new Date(endAt) : endAt;
  const ms = end.getTime() - Date.now();
  const expired = ms <= 0;
  const total = Math.max(0, ms);
  const days = Math.floor(total / 86_400_000);
  const hours = Math.floor((total % 86_400_000) / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  return { expired, ms, days, hours, minutes, seconds };
}

/**
 * Estimated shipping ETA (days) — a UI-only number that decreases as the
 * batch fills. Demo math: 30 days when empty, 8 days when full.
 */
export function estimateShippingDays(unitsReserved: number, moq: number) {
  const filled = Math.max(0, Math.min(1, unitsReserved / moq));
  return Math.round(30 - 22 * filled);
}
