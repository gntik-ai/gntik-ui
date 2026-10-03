import { TrendDelta } from '@gntik-ai/blocks';
import { MiniBar } from '@gntik-ai/charts';
import { Meter, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@gntik-ai/ui';
import { attainment, periodDelta, type ScorecardMetric } from './data';

/** Attainment never turns amber/red: for targets, a full bar is the good outcome. */
const NO_ALERT = { warning: 1000, destructive: 1000 };

export interface TargetsTableProps {
  metrics: readonly ScorecardMetric[];
  periods: readonly string[];
  index: number;
}

/** Period-over-period metrics against their targets, with attainment and a trend per row. */
export function TargetsTable({ metrics, periods, index }: TargetsTableProps) {
  const current = periods[index] ?? '';
  const previous = periods[index - 1];
  return (
    <Table containerLabel="Targets">
      <TableCaption srOnly>Metrics for {current} against target</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Metric</TableHead>
          <TableHead scope="col" align="right">
            {current}
          </TableHead>
          <TableHead scope="col" align="right">
            {previous ?? 'Previous'}
          </TableHead>
          <TableHead scope="col" align="right">
            Change
          </TableHead>
          <TableHead scope="col" align="right">
            Target
          </TableHead>
          <TableHead scope="col" className="w-40">
            Attainment
          </TableHead>
          <TableHead scope="col">Trend</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {metrics.map((m) => {
          const value = m.series[index] ?? 0;
          const prev = m.series[index - 1];
          const delta = periodDelta(m, value, prev);
          const att = attainment(m, value);
          const series = m.series.slice(0, index + 1);
          return (
            <TableRow key={m.id}>
              <TableHead scope="row" className="font-medium text-foreground">
                {m.label}
              </TableHead>
              <TableCell align="right" className="font-mono tabular-nums text-foreground">
                {m.format(value)}
              </TableCell>
              <TableCell align="right" className="font-mono tabular-nums text-muted-foreground">
                {prev === undefined ? '—' : m.format(prev)}
              </TableCell>
              <TableCell align="right">{delta ? <TrendDelta {...delta} /> : '—'}</TableCell>
              <TableCell align="right" className="font-mono tabular-nums text-muted-foreground">
                {m.lowerIsBetter ? '≤ ' : ''}
                {m.format(m.target)}
              </TableCell>
              <TableCell>
                <Meter
                  size="sm"
                  value={Math.min(att, 100)}
                  aria-label={`${m.label} attainment`}
                  aria-valuetext={`${att}% of target`}
                  valueLabel={`${att}%`}
                  thresholds={NO_ALERT}
                />
              </TableCell>
              <TableCell>
                <MiniBar data={series} labels={periods.slice(0, index + 1)} formatValue={m.format} label={`${m.label} by quarter`} width={88} height={24} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
