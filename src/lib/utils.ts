import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date | number): string {
  const now = new Date();
  const d = typeof date === "number" ? new Date(date) : date;
  const diff = now.getTime() - d.getTime();
  const absDiff = Math.abs(diff);
  const isFuture = diff < 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) {
    return d.toLocaleDateString();
  }
  if (days > 0) {
    return isFuture ? `in ${days}d` : `${days}d ago`;
  }
  if (hours > 0) {
    return isFuture ? `in ${hours}h` : `${hours}h ago`;
  }
  if (minutes > 0) {
    return isFuture ? `in ${minutes}m` : `${minutes}m ago`;
  }
  return isFuture ? "in <1m" : "Just now";
}

export function intervalToMs(interval: string): number {
  const map: Record<string, number> = {
    "5min": 5 * 60 * 1000,
    "15min": 15 * 60 * 1000,
    "30min": 30 * 60 * 1000,
    hourly: 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
  };
  return map[interval] ?? 24 * 60 * 60 * 1000;
}

export function intervalLabel(interval: string): string {
  const map: Record<string, string> = {
    "5min": "Every 5 minutes",
    "15min": "Every 15 minutes",
    "30min": "Every 30 minutes",
    hourly: "Every hour",
    daily: "Every day",
    weekly: "Every week",
  };
  return map[interval] ?? interval;
}
