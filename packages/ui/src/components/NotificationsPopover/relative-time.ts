/** Accepts a Date, epoch milliseconds or an ISO string. */
export type TimeInput = Date | number | string;

export function toDate(value: TimeInput): Date {
  return value instanceof Date ? value : new Date(value);
}

/**
 * Tiny short relative-time formatter ("just now", "5m ago", "3h ago", "2d ago", then a short date).
 * Local to this component; apps that need locale-aware output pass `formatTime`.
 */
export function formatRelativeShort(value: TimeInput, now: Date = new Date()): string {
  const date = toDate(value);
  const diff = Math.round((now.getTime() - date.getTime()) / 1000);
  if (Number.isNaN(diff)) return '';
  const abs = Math.abs(diff);
  const suffix = (n: number, unit: string) => (diff >= 0 ? `${n}${unit} ago` : `in ${n}${unit}`);
  if (abs < 45) return 'just now';
  if (abs < 3600) return suffix(Math.max(1, Math.round(abs / 60)), 'm');
  if (abs < 86400) return suffix(Math.round(abs / 3600), 'h');
  if (abs < 7 * 86400) return suffix(Math.round(abs / 86400), 'd');
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric', ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }) });
}
