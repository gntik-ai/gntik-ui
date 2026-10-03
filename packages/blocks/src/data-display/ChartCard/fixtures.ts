import type { ChartCardRange } from './ChartCard';

export interface CostPoint {
  day: string;
  Compute: number;
  Storage: number;
  Network: number;
}

const series = (labels: string[], base: [number, number, number], step: [number, number, number]): CostPoint[] =>
  labels.map((day, i) => ({
    day,
    Compute: Math.round(base[0] + step[0] * i + ((i * 37) % 11) * 4),
    Storage: Math.round(base[1] + step[1] * i + ((i * 13) % 7) * 2),
    Network: Math.round(base[2] + step[2] * i + ((i * 29) % 5) * 3),
  }));

const DAYS7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS30 = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
const WEEKS13 = Array.from({ length: 13 }, (_, i) => `Week ${i + 1}`);

/** Infrastructure cost by resource, per range. */
export const COST_BY_RANGE: Record<string, CostPoint[]> = {
  '7d': series(DAYS7, [180, 42, 120], [6, 1, 2]),
  '30d': series(DAYS30, [160, 40, 110], [2, 0.4, 1]),
  '90d': series(WEEKS13, [1100, 280, 760], [40, 6, 18]),
};

export const COST_RANGES: ChartCardRange[] = [
  { value: '7d', label: '7d', summary: { value: '$2,412', delta: { value: '+9.7%', direction: 'up', sentiment: 'negative' } } },
  { value: '30d', label: '30d', summary: { value: '$9,880', delta: { value: '+4.1%', direction: 'up', sentiment: 'negative' } } },
  { value: '90d', label: '90d', summary: { value: '$27,306', delta: { value: '−2.3%', direction: 'down', sentiment: 'positive' } } },
];

export interface TrafficRow {
  day: string;
  '00h': number;
  '03h': number;
  '06h': number;
  '09h': number;
  '12h': number;
  '15h': number;
  '18h': number;
  '21h': number;
}

/** Three-hour buckets of TRAFFIC_BY_RANGE, in display order. */
export const TRAFFIC_BUCKETS = ['00h', '03h', '06h', '09h', '12h', '15h', '18h', '21h'] as const;

const SHAPE = [0.18, 0.12, 0.3, 0.82, 1, 0.94, 0.7, 0.4];

/** Requests (thousands) per weekday and three-hour bucket: a heatmap for a ChartCard. */
export const TRAFFIC_BY_RANGE: Record<string, TrafficRow[]> = {
  '7d': DAYS7.map((day, d) => {
    const weekend = d >= 5 ? 0.45 : 1;
    const row = { day } as TrafficRow;
    TRAFFIC_BUCKETS.forEach((bucket, b) => {
      row[bucket] = Math.round((SHAPE[b] ?? 0) * weekend * (42 + ((d * 7 + b * 3) % 9)));
    });
    return row;
  }),
};

export const TRAFFIC_RANGES: ChartCardRange[] = [
  { value: '7d', label: 'Last 7 days', summary: { value: '4.8M requests', delta: { value: '+6.2%', direction: 'up', sentiment: 'positive' } } },
];
