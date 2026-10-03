import { useId, useState } from 'react';
import { ArrowDown, ArrowUp, Minus } from '@gntik-ai/icons';
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Toggle,
  ToggleGroup,
  cn,
} from '@gntik-ai/ui';
import { evalMetrics, evalRows, type EvalMetric, type EvalRow } from './fixtures';

export type { EvalMetric, EvalRow } from './fixtures';

export interface EvaluationScorecardProps {
  metrics?: EvalMetric[];
  rows?: EvalRow[];
  title?: string;
  /** Label of the run compared against, e.g. "baseline · v12". */
  baselineLabel?: string;
  /** Pass-rate drop (ratio) that counts as a regression. */
  passRateTolerance?: number;
  /** Heading level of the title, to fit the page outline (default h3). */
  titleAs?: 'h2' | 'h3' | 'h4';
  className?: string;
}

type Trend = 'better' | 'worse' | 'flat';

function formatValue(value: number, format: EvalMetric['format'] = 'percent') {
  if (format === 'percent') return `${(value * 100).toFixed(1)}%`;
  if (format === 'ms') return `${Math.round(value)}ms`;
  return value.toFixed(2);
}

function formatDelta(delta: number, format: EvalMetric['format'] = 'percent') {
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : '±';
  const abs = Math.abs(delta);
  if (format === 'percent') return `${sign}${(abs * 100).toFixed(1)} pt`;
  if (format === 'ms') return `${sign}${Math.round(abs)}ms`;
  return `${sign}${abs.toFixed(2)}`;
}

function trendOf(delta: number, higherIsBetter: boolean, tolerance: number): Trend {
  const signed = higherIsBetter ? delta : -delta;
  if (signed < -tolerance) return 'worse';
  if (signed > tolerance) return 'better';
  return 'flat';
}

const TREND: Record<Trend, { className: string; sr: string }> = {
  better: { className: 'text-success-text', sr: 'improved' },
  worse: { className: 'text-destructive-text', sr: 'regression' },
  flat: { className: 'text-muted-foreground', sr: 'unchanged' },
};

function Delta({ delta, trend, format, increase }: { delta: number; trend: Trend; format: EvalMetric['format']; increase: boolean }) {
  const t = TREND[trend];
  const TrendIcon = trend === 'flat' ? Minus : increase ? ArrowUp : ArrowDown;
  return (
    <span className={cn('inline-flex items-center gap-0.5 font-mono text-[10.5px]', t.className)}>
      <TrendIcon size={11} aria-hidden />
      {formatDelta(delta, format)}
      <span className="sr-only"> ({t.sr})</span>
    </span>
  );
}

function analyse(row: EvalRow, metrics: EvalMetric[], passRateTolerance: number) {
  const passRate = row.samples > 0 ? row.passed / row.samples : 0;
  const basePassRate = row.samples > 0 ? row.baselinePassed / row.samples : 0;
  const passTrend = trendOf(passRate - basePassRate, true, passRateTolerance);
  const cells = metrics.map((m) => {
    const value = row.scores[m.id];
    const base = row.baseline[m.id];
    const higher = m.higherIsBetter ?? true;
    const delta = value !== undefined && base !== undefined ? value - base : 0;
    const trend = value !== undefined && base !== undefined ? trendOf(delta, higher, m.tolerance ?? 0) : 'flat';
    const passes = value === undefined ? undefined : higher ? value >= m.threshold : value <= m.threshold;
    return { metric: m, value, delta, trend, passes };
  });
  const regressions = cells.filter((c) => c.trend === 'worse').length + (passTrend === 'worse' ? 1 : 0);
  return { passRate, basePassRate, passTrend, cells, regressions };
}

/** Evaluation results by dataset and metric, compared with a baseline run. */
export function EvaluationScorecard({
  metrics = evalMetrics,
  rows = evalRows,
  title = 'Evaluation results',
  baselineLabel = 'baseline',
  passRateTolerance = 0.02,
  titleAs: TitleTag = 'h3',
  className,
}: EvaluationScorecardProps) {
  const titleId = useId();
  const [filter, setFilter] = useState<'all' | 'regressions'>('all');
  const analysed = rows.map((row) => ({ row, ...analyse(row, metrics, passRateTolerance) }));
  const regressed = analysed.filter((a) => a.regressions > 0);
  const shown = filter === 'regressions' ? regressed : analysed;
  const samples = rows.reduce((s, r) => s + r.samples, 0);
  const overall = samples > 0 ? rows.reduce((s, r) => s + r.passed, 0) / samples : 0;
  const overallBase = samples > 0 ? rows.reduce((s, r) => s + r.baselinePassed, 0) / samples : 0;
  const overallTrend = trendOf(overall - overallBase, true, passRateTolerance / 2);

  return (
    <section aria-labelledby={titleId} className={cn('overflow-hidden rounded-lg border border-border bg-card shadow-sm', className)}>
      <header className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <TitleTag id={titleId} className="text-[13.5px] font-semibold text-foreground">
            {title}
          </TitleTag>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-muted-foreground">
            <span>
              Pass rate <span className="font-mono font-semibold text-foreground">{formatValue(overall)}</span>
            </span>
            <Delta delta={overall - overallBase} trend={overallTrend} format="percent" increase={overall >= overallBase} />
            <span>
              vs {baselineLabel} · {samples.toLocaleString('en-US')} samples
            </span>
          </p>
        </div>
        <ToggleGroup
          aria-label="Show datasets"
          size="sm"
          value={[filter]}
          onValueChange={(v) => v[0] && setFilter(v[0] as 'all' | 'regressions')}
        >
          <Toggle value="all">
            All <span className="font-mono text-[10.5px] opacity-70">{rows.length}</span>
          </Toggle>
          <Toggle value="regressions">
            Regressions <span className="font-mono text-[10.5px] opacity-70">{regressed.length}</span>
          </Toggle>
        </ToggleGroup>
      </header>
      <Table density="compact" containerLabel={title}>
        <TableHeader>
          <TableRow>
            <TableHead>Dataset</TableHead>
            <TableHead align="right">Pass rate</TableHead>
            {metrics.map((m) => (
              <TableHead key={m.id} align="right">
                {m.label}
                <span className="block font-mono text-[10px] font-normal text-muted-foreground">
                  {(m.higherIsBetter ?? true) ? '≥' : '≤'} {formatValue(m.threshold, m.format)}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {shown.length === 0 ? (
            <TableRow>
              <TableCell colSpan={metrics.length + 2} className="py-6 text-center text-muted-foreground">
                No regressions against {baselineLabel}.
              </TableCell>
            </TableRow>
          ) : (
            shown.map(({ row, passRate, basePassRate, passTrend, cells, regressions }) => (
              <TableRow key={row.id} data-regressed={regressions > 0 || undefined}>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[12.5px] text-foreground">{row.dataset}</span>
                    {regressions > 0 && (
                      <Badge tone="destructive" size="sm">
                        {regressions} {regressions === 1 ? 'regression' : 'regressions'}
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {row.passed}/{row.samples} passed
                  </span>
                </TableCell>
                <TableCell align="right">
                  <span className="block font-mono text-[12.5px] text-foreground">{formatValue(passRate)}</span>
                  <Delta delta={passRate - basePassRate} trend={passTrend} format="percent" increase={passRate >= basePassRate} />
                </TableCell>
                {cells.map(({ metric, value, delta, trend, passes }) => (
                  <TableCell key={metric.id} align="right">
                    {value === undefined ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <>
                        <span className={cn('block font-mono text-[12.5px]', passes ? 'text-foreground' : 'text-warning-text')}>
                          {formatValue(value, metric.format)}
                          {!passes && <span className="sr-only"> (below threshold)</span>}
                        </span>
                        <Delta delta={delta} trend={trend} format={metric.format} increase={delta >= 0} />
                      </>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  );
}
