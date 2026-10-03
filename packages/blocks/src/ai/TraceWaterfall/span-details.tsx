import { Badge, StatusTag } from '@gntik-ai/ui';
import type { TraceSpan } from './fixtures';

/** StatusTag dictionary of span statuses (running is announced by its label, not colour alone). */
export const SPAN_STATUSES = {
  ok: { label: 'OK', tone: 'success' },
  error: { label: 'Error', tone: 'destructive' },
  running: { label: 'Running', tone: 'info' },
} as const;

export function formatSpanDuration(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(ms >= 10000 ? 1 : 2)}s` : `${Math.round(ms)}ms`;
}

export interface SpanDetailsProps {
  span: TraceSpan;
  /** Heading level of the span name. */
  headingAs: 'h3' | 'h4' | 'h5';
}

/** Default content of the details pane: name, kind, status, timing and attributes. */
export function SpanDetails({ span, headingAs: Heading }: SpanDetailsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Heading className="text-[13.5px] font-semibold break-words text-foreground">{span.name}</Heading>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge variant="soft" size="sm">
            {span.kind}
          </Badge>
          <StatusTag size="sm" status={span.status} statuses={SPAN_STATUSES} />
        </div>
      </div>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[12px]">
        <dt className="text-muted-foreground">Start</dt>
        <dd className="font-mono text-foreground">+{formatSpanDuration(span.start)}</dd>
        <dt className="text-muted-foreground">{span.status === 'running' ? 'Elapsed' : 'Duration'}</dt>
        <dd className="font-mono text-foreground">
          {formatSpanDuration(span.duration)}
          {span.status === 'running' && <span className="font-sans text-muted-foreground"> (in progress)</span>}
        </dd>
        {Object.entries(span.attributes ?? {}).map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="truncate text-muted-foreground">{k}</dt>
            <dd className="font-mono break-words text-foreground">{String(v)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
