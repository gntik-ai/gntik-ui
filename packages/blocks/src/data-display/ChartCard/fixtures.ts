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
