import type { SpendPoint } from './SpendVsBudget';

/**
 * Sample cumulative spend for a 30-day cycle: actuals through day 18, forecast after.
 * The forecast starts on the last actual point so the two lines join.
 */
export const sampleSpend: SpendPoint[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const actual = Math.round(day * 64 + Math.sin(day / 2) * 22);
  const lastActual = 18 * 64 + Math.round(Math.sin(9) * 22);
  return {
    label: `May ${day}`,
    spend: day <= 18 ? actual : null,
    forecast: day >= 18 ? Math.round(lastActual + (day - 18) * 46) : null,
  };
});

export const sampleBudget = 2000;
