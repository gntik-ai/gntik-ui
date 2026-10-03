import type { EvalMetric, EvalRow } from '@gntik-ai/blocks';

/** An evaluation suite: one agent version scored on its datasets against a baseline. */
export interface EvaluationSuite {
  id: string;
  title: string;
  baselineLabel: string;
  rows: EvalRow[];
}

export const evalMetrics: EvalMetric[] = [
  { id: 'resolution', label: 'Resolution', threshold: 0.85, format: 'percent', tolerance: 0.02 },
  { id: 'groundedness', label: 'Groundedness', threshold: 0.8, format: 'percent', tolerance: 0.02 },
  { id: 'tone', label: 'Tone match', threshold: 0.8, format: 'percent', tolerance: 0.03 },
  { id: 'latency', label: 'p95 latency', threshold: 2000, higherIsBetter: false, format: 'ms', tolerance: 150 },
];

export const evaluationSuites: EvaluationSuite[] = [
  {
    id: 'support-triage-v13',
    title: 'support-triage · v13',
    baselineLabel: 'baseline · v12',
    rows: [
      { id: 'st1', dataset: 'billing-tickets', samples: 240, passed: 223, baselinePassed: 214, scores: { resolution: 0.93, groundedness: 0.91, tone: 0.9, latency: 1380 }, baseline: { resolution: 0.9, groundedness: 0.9, tone: 0.88, latency: 1490 } },
      { id: 'st2', dataset: 'refund-requests', samples: 120, passed: 97, baselinePassed: 106, scores: { resolution: 0.83, groundedness: 0.86, tone: 0.84, latency: 1640 }, baseline: { resolution: 0.89, groundedness: 0.87, tone: 0.85, latency: 1600 } },
      { id: 'st3', dataset: 'product-how-to', samples: 310, passed: 286, baselinePassed: 281, scores: { resolution: 0.92, groundedness: 0.89, tone: 0.91, latency: 1720 }, baseline: { resolution: 0.91, groundedness: 0.88, tone: 0.9, latency: 1700 } },
      { id: 'st4', dataset: 'angry-customers', samples: 80, passed: 59, baselinePassed: 55, scores: { resolution: 0.77, groundedness: 0.82, tone: 0.86, latency: 2190 }, baseline: { resolution: 0.73, groundedness: 0.8, tone: 0.81, latency: 2260 } },
      { id: 'st5', dataset: 'multilingual-es-pt', samples: 150, passed: 133, baselinePassed: 131, scores: { resolution: 0.88, groundedness: 0.85, tone: 0.87, latency: 1530 }, baseline: { resolution: 0.88, groundedness: 0.86, tone: 0.85, latency: 1530 } },
    ],
  },
  {
    id: 'code-reviewer-v21',
    title: 'code-reviewer · v21',
    baselineLabel: 'baseline · v20',
    rows: [
      { id: 'cr1', dataset: 'seeded-bugs', samples: 200, passed: 181, baselinePassed: 172, scores: { resolution: 0.91, groundedness: 0.94, tone: 0.88, latency: 1910 }, baseline: { resolution: 0.86, groundedness: 0.93, tone: 0.87, latency: 1880 } },
      { id: 'cr2', dataset: 'style-drift', samples: 140, passed: 126, baselinePassed: 125, scores: { resolution: 0.9, groundedness: 0.92, tone: 0.84, latency: 1650 }, baseline: { resolution: 0.89, groundedness: 0.91, tone: 0.85, latency: 1700 } },
      { id: 'cr3', dataset: 'missing-tests', samples: 90, passed: 74, baselinePassed: 70, scores: { resolution: 0.82, groundedness: 0.88, tone: 0.86, latency: 2120 }, baseline: { resolution: 0.78, groundedness: 0.87, tone: 0.86, latency: 2050 } },
    ],
  },
];
