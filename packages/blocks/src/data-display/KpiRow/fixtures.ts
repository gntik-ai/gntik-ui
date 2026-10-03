import type { KpiItem } from './KpiRow';

/** Four project KPIs: note latency and spend — same arrow logic, different sentiment. */
export const KPI_ITEMS: KpiItem[] = [
  {
    id: 'projects',
    label: 'Active projects',
    value: '142',
    delta: { value: '+6', direction: 'up', sentiment: 'positive', note: 'vs. 30 days ago' },
    trend: [128, 130, 131, 133, 134, 137, 139, 142],
  },
  {
    id: 'requests',
    label: 'Requests · 24h',
    value: '38,921',
    delta: { value: '+12.4%', direction: 'up', sentiment: 'positive', note: 'vs. previous 24h' },
    trend: [31, 34, 33, 38, 36, 41, 39],
  },
  {
    id: 'latency',
    label: 'Avg latency',
    value: '842 ms',
    delta: { value: '−8.1%', direction: 'down', sentiment: 'positive', note: 'vs. previous 24h' },
    trend: [910, 884, 902, 861, 852, 848, 842],
  },
  {
    id: 'spend',
    label: 'Spend · month to date',
    value: '$18,204',
    delta: { value: '+4.2%', direction: 'up', sentiment: 'negative', note: 'vs. last month' },
    trend: [12.1, 13.4, 14.2, 15.0, 16.3, 17.1, 18.2],
    trendTone: 'warning',
  },
];
