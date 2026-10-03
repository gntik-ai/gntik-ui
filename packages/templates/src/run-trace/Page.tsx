import { LogViewer, PageHeader, TokenCostCard, TraceWaterfall, formatSpanDuration, type LogLine, type TokenUsagePeriod, type TraceSpan } from '@gntik-ai/blocks';
import { RotateCcw, Square } from '@gntik-ai/icons';
import { Badge, Grid, HStack, InspectorLayout, InspectorToggle, JsonViewer, Page, Stack, StatusTag, Timer, Timestamp, type BreadcrumbItem } from '@gntik-ai/ui';
import { useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import { traceBreadcrumbs, traceLogs, traceRun, traceSpanDetails, traceSpans, traceUsage, type SpanDetail, type TraceRun } from './data';

export interface RunTraceProps {
  /** The run: name, status, start time, model, environment. Omit `startedAt` to start "now". */
  run: Omit<TraceRun, 'startedAt'> & { startedAt?: string };
  spans: TraceSpan[];
  /** Inputs, outputs and running state per span id. */
  spanDetails: Record<string, SpanDetail>;
  logs: LogLine[];
  /** Token usage and cost of the run (one period hides the period switch). */
  usage: TokenUsagePeriod[];
  currency: string;
  /** Span selected initially (defaults to the first running span, else the root). */
  defaultSelectedId: string;
  onSelectSpan: (span: TraceSpan) => void;
  /** Header actions; omitted ones are hidden. */
  onCancel: () => void;
  onRerun: () => void;
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  /** ConsoleShell props (app nav, user, workspaces, sidebar footer, topbar…). */
  shell: Omit<ConsoleShellProps, 'children'>;
}

function SpanPanel({ span, detail, runStart }: { span: TraceSpan | undefined; detail: SpanDetail | undefined; runStart: number }) {
  if (!span) return <p className="text-[13px] text-muted-foreground">Select a span to see its inputs and outputs.</p>;
  const running = detail?.running ?? false;
  return (
    <Stack gap={4}>
      <div>
        <h3 className="font-mono text-[13px] font-semibold text-foreground">{span.name}</h3>
        <HStack gap={2} wrap className="mt-1.5">
          <Badge size="sm" className="font-mono">
            {span.kind}
          </Badge>
          <StatusTag size="sm" status={running ? 'running' : span.status === 'error' ? 'failed' : 'succeeded'} />
        </HStack>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[12.5px]">
        <dt className="text-muted-foreground">Started</dt>
        <dd className="font-mono">+{formatSpanDuration(span.start)}</dd>
        <dt className="text-muted-foreground">{running ? 'Elapsed' : 'Duration'}</dt>
        <dd>
          {running ? (
            <Timer start={runStart + span.start} size="sm" aria-label={`${span.name} elapsed time`} />
          ) : (
            <span className="font-mono">{formatSpanDuration(span.duration)}</span>
          )}
        </dd>
        {Object.entries(span.attributes ?? {}).map(([key, value]) => (
          <div key={key} className="contents">
            <dt className="font-mono text-muted-foreground">{key}</dt>
            <dd className="min-w-0 truncate font-mono">{value}</dd>
          </div>
        ))}
      </dl>
      <section aria-label="Input">
        <h3 className="mb-2 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Input</h3>
        {detail?.input === undefined ? (
          <p className="text-[12.5px] text-muted-foreground">No input recorded.</p>
        ) : (
          <JsonViewer key={`${span.id}-in`} data={detail.input} label={`${span.name} input`} defaultExpandDepth={2} maxHeight={240} />
        )}
      </section>
      <section aria-label="Output">
        <h3 className="mb-2 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Output</h3>
        {detail?.output === undefined ? (
          <p className="text-[12.5px] text-muted-foreground">{running ? 'Waiting for the span to finish…' : 'No output recorded.'}</p>
        ) : (
          <JsonViewer key={`${span.id}-out`} data={detail.output} label={`${span.name} output`} defaultExpandDepth={2} maxHeight={240} />
        )}
      </section>
    </Stack>
  );
}

/**
 * Run trace: ConsoleShell + InspectorLayout. The main area holds the run header, the
 * TraceWaterfall, token cost and the run log; the inspector shows the selected span's
 * attributes, a live Timer while it runs and its input / output in JsonViewers.
 */
export default function RunTracePage(props: Partial<RunTraceProps>) {
  const {
    run = traceRun,
    spans = traceSpans,
    spanDetails = traceSpanDetails,
    logs = traceLogs,
    usage = traceUsage,
    currency = 'USD',
    defaultSelectedId,
    onSelectSpan,
    onCancel,
    onRerun,
    breadcrumbs = traceBreadcrumbs,
    currentHref = '/runs',
    shell,
  } = props;
  const extent = Math.max(0, ...spans.map((s) => s.start + s.duration));
  // Without a start time the demo run "started" `extent` ms before mount, so timers read sensibly.
  const [fallbackStart] = useState(() => Date.now() - extent);
  const runStart = run.startedAt ? new Date(run.startedAt).getTime() : fallbackStart;
  const firstRunning = spans.find((s) => spanDetails[s.id]?.running && s.parentId);
  const [selectedId, setSelectedId] = useState(defaultSelectedId ?? firstRunning?.id ?? spans.find((s) => !s.parentId)?.id);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const selected = spans.find((s) => s.id === selectedId);
  const isRunning = run.status === 'running';

  const actions = [
    ...(onCancel && isRunning ? [{ label: 'Cancel run', icon: Square, variant: 'secondary' as const, onClick: onCancel }] : []),
    ...(onRerun ? [{ label: 'Re-run', icon: RotateCcw, variant: 'primary' as const, onClick: onRerun }] : []),
  ];

  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <InspectorLayout
        panelTitle="Span inspector"
        panelWidth={360}
        open={inspectorOpen}
        onOpenChange={setInspectorOpen}
        panel={<SpanPanel span={selected} detail={selectedId ? spanDetails[selectedId] : undefined} runStart={runStart} />}
      >
        <Page
          width="wide"
          header={
            <PageHeader
              breadcrumbs={null}
              title={run.name}
              status={run.status}
              meta={[
                { label: 'Run', value: run.id, mono: true },
                { label: 'Started', value: <Timestamp value={new Date(runStart)} /> },
                {
                  label: isRunning ? 'Elapsed' : 'Duration',
                  value: isRunning ? <Timer start={runStart} format="compact" showStatus={false} aria-label="Run elapsed time" /> : formatSpanDuration(extent),
                },
                { label: 'Model', value: run.model, mono: true },
                { label: 'Environment', value: run.environment },
              ]}
              tabs={null}
              actions={actions}
            />
          }
        >
          <TraceWaterfall
            titleAs="h2"
            title="Spans"
            spans={spans}
            defaultSelectedId={selectedId}
            onSelect={(span) => {
              setSelectedId(span.id);
              setInspectorOpen(true);
              onSelectSpan?.(span);
            }}
          />
          <HStack justify="end">
            <InspectorToggle label="Toggle span inspector" />
          </HStack>
          <Grid cols={{ base: 1, lg: 3 }} gap={4}>
            <TokenCostCard titleAs="h2" title="Tokens and cost" description={`${run.model} · this run`} periods={usage} currency={currency} />
            <div className="min-w-0 lg:col-span-2">
              <LogViewer titleAs="h2" title="Run log" lines={logs} height={260} defaultFollow />
            </div>
          </Grid>
        </Page>
      </InspectorLayout>
    </ConsoleShell>
  );
}
