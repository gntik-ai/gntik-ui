import { DataTable, EvaluationScorecard, PageHeader, type DataTableColumn, type EvalMetric, type EvalRow } from '@gntik-ai/blocks';
import { Heatmap, chartFmt } from '@gntik-ai/charts';
import { Download, FileSearch, Play } from '@gntik-ai/icons';
import {
  Badge,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  EmptyState,
  Grid,
  JsonViewer,
  Page,
  Section,
  Timestamp,
  type BreadcrumbItem,
} from '@gntik-ai/ui';
import { useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import {
  evalRun,
  evaluationBreadcrumbs,
  evaluationMetrics,
  evaluationRows,
  evaluationSamples,
  findRegressions,
  type EvalRegression,
  type EvalSample,
} from './data';

export interface EvaluationsProps {
  title: string;
  /** Run being reviewed, e.g. "support-agent · v13". */
  runLabel: string;
  /** Run compared against, e.g. "v12". */
  baselineLabel: string;
  finishedAt: string | Date;
  metrics: EvalMetric[];
  /** One row per dataset (scores and baseline). */
  rows: EvalRow[];
  /** Evaluated samples; the sample viewer shows a dataset's samples, failures first. */
  samples: EvalSample[];
  /** Pass-rate drop (ratio) that counts as a regression. */
  passRateTolerance: number;
  /** Header actions; omitted ones are hidden. */
  onRerun: () => void;
  onExport: () => void;
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  /** ConsoleShell props (app nav, user, workspaces, sidebar footer, topbar…). */
  shell: Omit<ConsoleShellProps, 'children'>;
}

const fmt = (format: EvalRegression['format'], n: number) => (format === 'percent' ? chartFmt.percent(n) : format === 'ms' ? `${Math.round(n)} ms` : String(n));
const fmtDelta = (format: EvalRegression['format'], n: number) =>
  format === 'percent' ? chartFmt.percentDelta(n) : `${n > 0 ? '+' : n < 0 ? '−' : ''}${fmt(format, Math.abs(n))}`;

/**
 * Evaluation results: ConsoleShell + Page with the EvaluationScorecard (one row per dataset),
 * a Heatmap of the change vs baseline per metric × dataset, the regressions table and a
 * sample viewer (Drawer + JsonViewer) per dataset.
 */
export default function EvaluationsPage(props: Partial<EvaluationsProps>) {
  const {
    title = evalRun.title,
    runLabel = evalRun.runLabel,
    baselineLabel = evalRun.baselineLabel,
    finishedAt = evalRun.finishedAt,
    metrics = evaluationMetrics,
    rows = evaluationRows,
    samples = evaluationSamples,
    passRateTolerance = 0.02,
    onRerun,
    onExport,
    breadcrumbs = evaluationBreadcrumbs,
    currentHref = '/evaluations',
    shell,
  } = props;
  const [dataset, setDataset] = useState<string | null>(null);
  const regressions = findRegressions(rows, metrics, passRateTolerance);
  const ratioMetrics = metrics.filter((m) => m.format === 'percent');
  const heat: Array<Record<string, string | number>> = rows.map((r) => ({
    dataset: r.dataset,
    ...Object.fromEntries(ratioMetrics.map((m) => [m.label, (r.scores[m.id] ?? NaN) - (r.baseline[m.id] ?? NaN)])),
  }));
  const shown = samples.filter((s) => s.dataset === dataset).sort((a, b) => Number(a.passed) - Number(b.passed));

  const columns: DataTableColumn<EvalRegression>[] = [
    { id: 'dataset', header: 'Dataset', accessor: (r) => r.dataset, variant: 'mono', sortable: true, hideable: false },
    { id: 'metric', header: 'Metric', accessor: (r) => r.metricLabel, sortable: true },
    { id: 'baseline', header: baselineLabel, accessor: (r) => r.baseline, cell: (r) => fmt(r.format, r.baseline), variant: 'numeric' },
    { id: 'current', header: 'This run', accessor: (r) => r.current, cell: (r) => fmt(r.format, r.current), variant: 'numeric' },
    {
      id: 'delta',
      header: 'Change',
      accessor: (r) => r.delta,
      cell: (r) => (
        <Badge tone="destructive" variant="soft" size="sm" className="font-mono">
          {fmtDelta(r.format, r.delta)}
        </Badge>
      ),
      align: 'right',
    },
  ];

  const actions = [
    ...(onExport ? [{ label: 'Export results', icon: Download, variant: 'secondary' as const, onClick: onExport }] : []),
    ...(onRerun ? [{ label: 'Re-run evaluation', icon: Play, variant: 'primary' as const, onClick: onRerun }] : []),
  ];

  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <Page
        width="wide"
        header={
          <PageHeader
            breadcrumbs={null}
            title={title}
            description={`${runLabel} compared with ${baselineLabel}.`}
            status={regressions.length ? 'failed' : 'succeeded'}
            statuses={{ failed: { label: `${regressions.length} regressions`, tone: 'destructive' }, succeeded: { label: 'No regressions', tone: 'success' } }}
            meta={[{ label: 'Finished', value: <Timestamp value={finishedAt} /> }]}
            tabs={null}
            actions={actions}
          />
        }
      >
        <EvaluationScorecard titleAs="h2" title="Results per dataset" metrics={metrics} rows={rows} baselineLabel={baselineLabel} passRateTolerance={passRateTolerance} />
        <Grid cols={{ base: 1, xl: 2 }} gap={4}>
          <Section variant="card" headingLevel="h2" title="Change vs baseline" description={`Score difference against ${baselineLabel}, per metric and dataset.`}>
            <Heatmap
              aria-label={`Score change vs ${baselineLabel} by dataset and metric`}
              data={heat}
              index="dataset"
              categories={ratioMetrics.map((m) => m.label)}
              scale="diverging"
              domain={[-0.06, 0, 0.06]}
              valueFormatter={chartFmt.percentDelta}
              showValues
              rowHeader="Dataset"
            />
          </Section>
          <Section variant="card" padding="none" headingLevel="h2" title="Regressions" description="Worse than baseline by more than the metric's tolerance." bodyClassName="p-0">
            <DataTable<EvalRegression>
              caption="Regressions"
              rows={regressions}
              columns={columns}
              getRowLabel={(r) => `${r.metricLabel} on ${r.dataset}`}
              paginated={false}
              showColumnMenu={false}
              showDensityToggle={false}
              defaultDensity="compact"
              rowActions={(r) => [{ label: 'View samples', icon: FileSearch, onSelect: () => setDataset(r.dataset) }]}
              emptyState={<EmptyState title="No regressions" description={`Every metric is within tolerance of ${baselineLabel}.`} />}
            />
          </Section>
        </Grid>
      </Page>
      <Drawer open={dataset !== null} onOpenChange={(open) => !open && setDataset(null)}>
        <DrawerContent size="lg">
          {dataset && (
            <>
              <DrawerHeader>
                <DrawerTitle>
                  Samples · <span className="font-mono">{dataset}</span>
                </DrawerTitle>
                <DrawerDescription>
                  {shown.filter((s) => !s.passed).length} failing of {shown.length} shown, failures first.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                {shown.length === 0 ? (
                  <EmptyState title="No samples recorded" description="This dataset has no stored samples for the run." />
                ) : (
                  <JsonViewer key={dataset} data={shown} label={`${dataset} samples`} defaultExpandDepth={2} />
                )}
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </ConsoleShell>
  );
}
