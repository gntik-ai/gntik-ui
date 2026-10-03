import { CommentThread, KpiRow, PageHeader, type CommentAuthor, type ThreadComment } from '@gntik-ai/blocks';
import { RadarChart } from '@gntik-ai/charts';
import { Download } from '@gntik-ai/icons';
import { Card, CardBody, CardDescription, CardHeader, CardTitle, Grid, HStack, Page, Section, SimpleSelect, Stack, Text, type BreadcrumbItem } from '@gntik-ai/ui';
import { useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import {
  periodKpis,
  scorecardAuthor,
  scorecardBreadcrumbs,
  scorecardComments,
  scorecardMetrics,
  scorecardPeriods,
  scorecardRadar,
  type RadarPoint,
  type ScorecardMetric,
} from './data';
import { TargetsTable } from './TargetsTable';

export interface ScorecardProps {
  title: string;
  description: string;
  /** Period labels, oldest first; every metric series is aligned with them. */
  periods: string[];
  /** Initially selected period (defaults to the latest). */
  defaultPeriod: string;
  onPeriodChange: (period: string) => void;
  metrics: ScorecardMetric[];
  /** Dimension scores: `dimension` plus one key per period label. */
  radar: RadarPoint[];
  comments: ThreadComment[];
  currentUser: CommentAuthor;
  onComment: (body: string) => void;
  onExport: (period: string) => void;
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  shell: Omit<ConsoleShellProps, 'children'>;
}

/** Scorecard: period-over-period KPIs, targets with attainment and trends, a radar of dimensions and a commentary rail. */
export default function ScorecardPage(props: Partial<ScorecardProps>) {
  const {
    title = 'Quarterly scorecard',
    description = 'Company metrics against target, compared with the previous quarter.',
    periods = scorecardPeriods,
    defaultPeriod,
    onPeriodChange,
    metrics = scorecardMetrics,
    radar = scorecardRadar,
    comments = scorecardComments,
    currentUser = scorecardAuthor,
    onComment,
    onExport,
    breadcrumbs = scorecardBreadcrumbs,
    currentHref = '/scorecard',
    shell,
  } = props;
  const [period, setPeriod] = useState(defaultPeriod ?? periods[periods.length - 1] ?? '');
  const index = Math.max(0, periods.indexOf(period));
  const previous = periods[index - 1];
  const compared = previous ? [period, previous] : [period];

  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <Page
        width="wide"
        header={
          <PageHeader
            breadcrumbs={null}
            title={title}
            description={description}
            status=""
            meta={[]}
            tabs={null}
            actions={[{ label: 'Export PDF', icon: Download, variant: 'secondary', onClick: () => onExport?.(period) }]}
          />
        }
      >
        <Stack gap={6}>
          <HStack gap={3} wrap>
            <SimpleSelect
              aria-label="Period"
              items={periods.map((p) => ({ value: p, label: p }))}
              value={period}
              onValueChange={(v) => {
                if (!v) return;
                setPeriod(v);
                onPeriodChange?.(v);
              }}
              className="w-40"
            />
            <Text as="span" variant="supporting" tone="muted" aria-live="polite">
              {previous ? `Compared with ${previous}` : 'No earlier period to compare with'}
            </Text>
          </HStack>
          <KpiRow items={periodKpis(metrics, periods, index)} label={`Key metrics, ${period}`} showTrends={false} />
          <Grid cols={{ base: 1, xl: 3 }} gap={6} align="start">
            <Stack gap={6} className="min-w-0 xl:col-span-2">
              <Section title="Targets" description="Attainment against this period’s targets; trend shows every quarter up to the selected one.">
                <TargetsTable metrics={metrics} periods={periods} index={index} />
              </Section>
              <Card>
                <CardHeader>
                  <CardTitle as="h2">Health by dimension</CardTitle>
                  <CardDescription>Scores out of 100{previous ? `, ${period} vs. ${previous}` : ''}.</CardDescription>
                </CardHeader>
                <CardBody>
                  <RadarChart<RadarPoint> data={radar} index="dimension" categories={compared} max={100} height={300} aria-label={`Health by dimension, ${compared.join(' vs. ')}`} dataTable />
                </CardBody>
              </Card>
            </Stack>
            <aside aria-label="Commentary" className="min-w-0">
              <Card>
                <CardHeader divided>
                  <CardTitle as="h2">Commentary</CardTitle>
                  <CardDescription>Notes from the review, newest last.</CardDescription>
                </CardHeader>
                <CardBody>
                  <CommentThread comments={comments} currentUser={currentUser} onSubmit={onComment} label="Scorecard commentary" placeholder="Add a note for this period…" submitLabel="Post note" />
                </CardBody>
              </Card>
            </aside>
          </Grid>
        </Stack>
      </Page>
    </ConsoleShell>
  );
}
