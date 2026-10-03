/** Daily p95 latency (ms) and requests over four weeks: fixture for the chart examples. */
export interface LatencyPoint {
  day: string;
  p95: number;
  requests: number;
}

export const LATENCY_DAYS: LatencyPoint[] = Array.from({ length: 28 }, (_, i) => ({
  day: `Sep ${i + 1}`,
  p95: Math.round(210 + 60 * Math.sin(i / 3) + (i === 17 ? 190 : 0) + (i % 5) * 7),
  requests: 9_000 + ((i * 1373) % 4_200),
}));
