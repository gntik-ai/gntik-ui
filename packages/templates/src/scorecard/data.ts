import type { CommentAuthor, KpiDelta, KpiItem, ThreadComment } from '@gntik-ai/blocks';
import type { BreadcrumbItem } from '@gntik-ai/ui';

export interface ScorecardMetric {
  id: string;
  label: string;
  /** One value per period, aligned with `periods`. */
  series: number[];
  target: number;
  /** Lower is better (latency, churn): flips the delta sentiment and the attainment. */
  lowerIsBetter?: boolean;
  format: (value: number) => string;
}

export interface RadarPoint {
  dimension: string;
  [period: string]: number | string;
}

const pct = (v: number) => `${v.toFixed(1)}%`;
const ms = (v: number) => `${Math.round(v)} ms`;
const money = (v: number) => `$${(v / 1000).toFixed(0)}k`;
const int = (v: number) => v.toLocaleString('en-US');

export const scorecardPeriods = ['Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'];

export const scorecardMetrics: ScorecardMetric[] = [
  { id: 'revenue', label: 'Recurring revenue', series: [412_000, 438_000, 471_000, 503_000], target: 520_000, format: money },
  { id: 'active', label: 'Active workspaces', series: [1_840, 1_910, 2_064, 2_190], target: 2_100, format: int },
  { id: 'uptime', label: 'Uptime', series: [99.92, 99.95, 99.87, 99.97], target: 99.95, format: (v) => `${v.toFixed(2)}%` },
  { id: 'latency', label: 'p95 latency', series: [212, 198, 205, 176], target: 180, lowerIsBetter: true, format: ms },
  { id: 'churn', label: 'Logo churn', series: [2.4, 2.1, 2.6, 1.9], target: 2.0, lowerIsBetter: true, format: pct },
  { id: 'nps', label: 'Satisfaction (NPS)', series: [38, 41, 40, 46], target: 45, format: int },
];

/** Dimension scores (0–100) per period. */
export const scorecardRadar: RadarPoint[] = [
  { dimension: 'Growth', 'Q4 2025': 62, 'Q1 2026': 66, 'Q2 2026': 71, 'Q3 2026': 78 },
  { dimension: 'Reliability', 'Q4 2025': 80, 'Q1 2026': 84, 'Q2 2026': 76, 'Q3 2026': 88 },
  { dimension: 'Performance', 'Q4 2025': 70, 'Q1 2026': 74, 'Q2 2026': 72, 'Q3 2026': 83 },
  { dimension: 'Retention', 'Q4 2025': 68, 'Q1 2026': 72, 'Q2 2026': 65, 'Q3 2026': 76 },
  { dimension: 'Satisfaction', 'Q4 2025': 60, 'Q1 2026': 64, 'Q2 2026': 63, 'Q3 2026': 71 },
];

export const scorecardBreadcrumbs: BreadcrumbItem[] = [{ label: 'Acme Industries', href: '/overview' }, { label: 'Scorecard' }];

export const scorecardAuthor: CommentAuthor = { name: 'Jordan Lee' };

const DAY = 86_400_000;
export const scorecardComments: ThreadComment[] = [
  { id: 'c1', author: { name: 'Priya Natarajan' }, body: 'Latency is finally under target after the cache rollout in August. Keep an eye on the EU region.', at: Date.now() - 3 * DAY },
  { id: 'c2', author: { name: 'Marcus Chen' }, body: 'Revenue is 3% short of target; two enterprise renewals slipped into October.', at: Date.now() - 2 * DAY },
  { id: 'c3', author: { name: 'Ana Souza' }, body: 'Churn improved with the new onboarding checklist. Proposing we raise the NPS target to 50 for Q4.', at: Date.now() - DAY / 2 },
];

/** Change between two values, with sentiment following `lowerIsBetter`. */
export function periodDelta(m: ScorecardMetric, current: number, previous: number | undefined): KpiDelta | undefined {
  if (previous === undefined || previous === 0) return undefined;
  const change = ((current - previous) / previous) * 100;
  const direction = Math.abs(change) < 0.05 ? 'flat' : change > 0 ? 'up' : 'down';
  const good = m.lowerIsBetter ? change < 0 : change > 0;
  return {
    value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
    direction,
    sentiment: direction === 'flat' ? 'neutral' : good ? 'positive' : 'negative',
  };
}

/** Attainment of the target in percent (capped at 100 for the meter). */
export function attainment(m: ScorecardMetric, value: number): number {
  const ratio = m.lowerIsBetter ? m.target / value : value / m.target;
  return Math.round(ratio * 1000) / 10;
}

/** KpiRow items for a period, compared with the one before it. */
export function periodKpis(metrics: readonly ScorecardMetric[], periods: readonly string[], index: number): KpiItem[] {
  const prevLabel = periods[index - 1];
  return metrics.slice(0, 4).map((m) => {
    const current = m.series[index] ?? 0;
    const delta = periodDelta(m, current, m.series[index - 1]);
    return {
      id: m.id,
      label: m.label,
      value: m.format(current),
      delta: delta && prevLabel ? { ...delta, note: `vs. ${prevLabel}` } : undefined,
    };
  });
}
