export interface TokenUsagePeriod {
  /** Stable id, e.g. "7d". */
  id: string;
  /** Toggle label, e.g. "7 days". */
  label: string;
  inputTokens: number;
  outputTokens: number;
  /** Spend in the period, in `currency`. */
  cost: number;
  /** Budget for the period, in `currency`. */
  budget: number;
}

export const tokenUsagePeriods: TokenUsagePeriod[] = [
  { id: '24h', label: '24h', inputTokens: 1_284_000, outputTokens: 212_400, cost: 14.82, budget: 40 },
  { id: '7d', label: '7d', inputTokens: 8_930_500, outputTokens: 1_402_900, cost: 102.4, budget: 250 },
  { id: '30d', label: '30d', inputTokens: 36_120_000, outputTokens: 6_015_300, cost: 431.75, budget: 500 },
];
