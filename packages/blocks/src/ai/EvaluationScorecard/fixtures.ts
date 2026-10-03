export interface EvalMetric {
  id: string;
  label: string;
  /** Minimum (or maximum, when lower is better) value that passes. */
  threshold: number;
  /** Defaults to true; false for costs and latencies. */
  higherIsBetter?: boolean;
  /** How values are shown: ratio as a percentage, or milliseconds. */
  format?: 'percent' | 'ms' | 'number';
  /** Change vs baseline that counts as a regression (same unit as the values). */
  tolerance?: number;
}

export interface EvalRow {
  id: string;
  dataset: string;
  samples: number;
  /** Samples that passed every check in this run. */
  passed: number;
  /** Samples that passed in the baseline run. */
  baselinePassed: number;
  scores: Record<string, number>;
  baseline: Record<string, number>;
}

export const evalMetrics: EvalMetric[] = [
  { id: 'accuracy', label: 'Accuracy', threshold: 0.85, format: 'percent', tolerance: 0.02 },
  { id: 'faithfulness', label: 'Faithfulness', threshold: 0.8, format: 'percent', tolerance: 0.02 },
  { id: 'relevance', label: 'Relevance', threshold: 0.8, format: 'percent', tolerance: 0.02 },
  { id: 'latency', label: 'p95 latency', threshold: 2000, higherIsBetter: false, format: 'ms', tolerance: 150 },
];

export const evalRows: EvalRow[] = [
  { id: 'r1', dataset: 'support-faq', samples: 240, passed: 221, baselinePassed: 214, scores: { accuracy: 0.93, faithfulness: 0.91, relevance: 0.89, latency: 1420 }, baseline: { accuracy: 0.9, faithfulness: 0.9, relevance: 0.88, latency: 1510 } },
  { id: 'r2', dataset: 'billing-questions', samples: 120, passed: 97, baselinePassed: 106, scores: { accuracy: 0.84, faithfulness: 0.86, relevance: 0.82, latency: 1650 }, baseline: { accuracy: 0.89, faithfulness: 0.87, relevance: 0.83, latency: 1600 } },
  { id: 'r3', dataset: 'product-docs', samples: 310, passed: 284, baselinePassed: 281, scores: { accuracy: 0.92, faithfulness: 0.88, relevance: 0.9, latency: 1880 }, baseline: { accuracy: 0.91, faithfulness: 0.88, relevance: 0.9, latency: 1700 } },
  { id: 'r4', dataset: 'edge-cases', samples: 80, passed: 58, baselinePassed: 55, scores: { accuracy: 0.76, faithfulness: 0.79, relevance: 0.81, latency: 2210 }, baseline: { accuracy: 0.73, faithfulness: 0.78, relevance: 0.8, latency: 2250 } },
  { id: 'r5', dataset: 'multilingual', samples: 150, passed: 132, baselinePassed: 131, scores: { accuracy: 0.88, faithfulness: 0.85, relevance: 0.86, latency: 1540 }, baseline: { accuracy: 0.88, faithfulness: 0.86, relevance: 0.85, latency: 1530 } },
];
