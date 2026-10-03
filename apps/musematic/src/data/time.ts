/** Relative timestamps for the fixtures, so the demo always reads "recent". */
export const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);
export const hoursAgo = (h: number) => minutesAgo(h * 60);
export const daysAgo = (d: number) => hoursAgo(d * 24);
export const isoDaysAgo = (d: number) => daysAgo(d).toISOString();
export const isoDaysFromNow = (d: number) => daysAgo(-d).toISOString();
