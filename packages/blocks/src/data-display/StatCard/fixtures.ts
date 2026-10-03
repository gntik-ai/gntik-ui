import type { StatCardRange } from './StatCard';

/** Requests per range: the value and delta recalculate when the range changes. */
export const STAT_RANGES: StatCardRange[] = [
  {
    value: '7d',
    label: '7d',
    stat: '38,921',
    delta: { value: '+12.4%', direction: 'up', sentiment: 'positive', note: 'vs. previous 7 days' },
    series: [31, 34, 33, 38, 36, 41, 39],
  },
  {
    value: '30d',
    label: '30d',
    stat: '1.09M',
    delta: { value: '+9.6%', direction: 'up', sentiment: 'positive', note: 'vs. previous 30 days' },
    series: [28, 30, 29, 33, 31, 30, 34, 32, 36, 35, 38, 37],
  },
  {
    value: '90d',
    label: '90d',
    stat: '3.02M',
    delta: { value: '+22.8%', direction: 'up', sentiment: 'positive', note: 'vs. previous 90 days' },
    series: [22, 24, 23, 26, 25, 28, 27, 30, 29, 33, 32, 36],
  },
];
