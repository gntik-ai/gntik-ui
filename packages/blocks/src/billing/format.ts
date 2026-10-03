/** Shared formatting for the billing blocks (en-US, Intl). */

/** A calendar date: a `Date` or an ISO `YYYY-MM-DD` string (read as a local date, no UTC shift). */
export type DateInput = Date | string;

export function toDate(value: DateInput): Date {
  if (value instanceof Date) return value;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(value);
}

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const shortDateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** "June 1, 2026". */
export function formatDate(value: DateInput): string {
  return dateFmt.format(toDate(value));
}

/** "Jun 1, 2026". */
export function formatShortDate(value: DateInput): string {
  return shortDateFmt.format(toDate(value));
}

/** Money with the currency symbol: "$1,620.00" (or no decimals with `whole`). */
export function formatMoney(amount: number, currency = 'USD', whole = false): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(amount);
}

/** Grouped number, compact above a million: "412,800", "78.4M". */
export function formatQuantity(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
}
