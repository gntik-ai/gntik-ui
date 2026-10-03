/* ============================================================================
   @gntik-ai/evals · cost.ts — estimated spend from the usage tally
   ----------------------------------------------------------------------------
   USD per million tokens. Cache writes are priced at 1.25× input (5-minute
   TTL). Estimates only: the invoice is the source of truth (a server-side
   fallback turn bills at the fallback model's rates, which this ignores).
   ============================================================================ */
import type { UsageTally } from './agent.js';

export interface Pricing {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

export const PRICING: Record<string, Pricing> = {
  'claude-opus-5-5': { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
  'claude-sonnet-5-5': { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 },
};

export const DEFAULT_PRICING_MODEL = 'claude-opus-5-5';

export function pricingFor(model: string): { pricing: Pricing; known: boolean } {
  const p = PRICING[model];
  return p ? { pricing: p, known: true } : { pricing: PRICING[DEFAULT_PRICING_MODEL] as Pricing, known: false };
}

export function estimateCost(u: UsageTally, model: string): number {
  const { pricing: p } = pricingFor(model);
  return (u.inputTokens * p.input + u.outputTokens * p.output + u.cacheReadTokens * p.cacheRead + u.cacheWriteTokens * p.cacheWrite) / 1_000_000;
}

export const usd = (n: number) => `$${n.toFixed(n < 1 ? 4 : 2)}`;
