import { useId, useMemo, useState } from 'react';
import { ChevronRight } from '@gntik-ai/icons';
import { Badge, StatusTag, cn } from '@gntik-ai/ui';
import { traceSpans, type SpanKind, type TraceSpan } from './fixtures';

export type { SpanKind, TraceSpan } from './fixtures';

/** Bar colour per span kind (category tokens; errors always use destructive). */
const KIND_BAR: Record<SpanKind, string> = {
  http: 'bg-muted-foreground/70',
  chain: 'bg-category-amber',
  llm: 'bg-primary',
  tool: 'bg-category-violet',
  retrieval: 'bg-category-cyan',
};

const SPAN_STATUSES = {
  ok: { label: 'OK', tone: 'success' },
  error: { label: 'Error', tone: 'destructive' },
} as const;

export interface TraceWaterfallProps {
  spans?: TraceSpan[];
  title?: string;
  /** Span selected initially (defaults to the first root). */
  defaultSelectedId?: string;
  /** Span ids collapsed initially. */
  defaultCollapsed?: string[];
  onSelect?: (span: TraceSpan) => void;
  /** Heading level of the title, to fit the page outline (default h3); inner headings use the next level. */
  titleAs?: 'h2' | 'h3' | 'h4';
  className?: string;
}

interface Row {
  span: TraceSpan;
  depth: number;
  hasChildren: boolean;
}

export function formatSpanDuration(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(ms >= 10000 ? 1 : 2)}s` : `${Math.round(ms)}ms`;
}

/** Depth-first rows, skipping the descendants of collapsed spans. */
function flatten(spans: TraceSpan[], collapsed: Set<string>): Row[] {
  const ids = new Set(spans.map((s) => s.id));
  const children = new Map<string | undefined, TraceSpan[]>();
  for (const s of spans) {
    const key = s.parentId && ids.has(s.parentId) ? s.parentId : undefined;
    children.set(key, [...(children.get(key) ?? []), s]);
  }
  const rows: Row[] = [];
  const walk = (parent: string | undefined, depth: number) => {
    const list = [...(children.get(parent) ?? [])].sort((a, b) => a.start - b.start);
    for (const span of list) {
      const hasChildren = (children.get(span.id)?.length ?? 0) > 0;
      rows.push({ span, depth, hasChildren });
      if (hasChildren && !collapsed.has(span.id)) walk(span.id, depth + 1);
    }
  };
  walk(undefined, 0);
  return rows;
}

/** Trace waterfall: span tree + duration bars on a shared time axis + selected span details. */
export function TraceWaterfall({
  spans = traceSpans,
  title = 'Trace',
  defaultSelectedId,
  defaultCollapsed = [],
  onSelect,
  titleAs: TitleTag = 'h3',
  className,
}: TraceWaterfallProps) {
  const SubTag = TitleTag === 'h2' ? 'h3' : TitleTag === 'h3' ? 'h4' : 'h5';
  const titleId = useId();
  const [collapsed, setCollapsed] = useState(() => new Set(defaultCollapsed));
  const [selectedId, setSelectedId] = useState(defaultSelectedId ?? spans.find((s) => !s.parentId)?.id);
  const rows = useMemo(() => flatten(spans, collapsed), [spans, collapsed]);
  const total = Math.max(1, ...spans.map((s) => s.start + s.duration));
  const selected = spans.find((s) => s.id === selectedId);
  const errors = spans.filter((s) => s.status === 'error').length;

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const select = (span: TraceSpan) => {
    setSelectedId(span.id);
    onSelect?.(span);
  };

  return (
    <section
      aria-labelledby={titleId}
      className={cn('grid overflow-hidden rounded-lg border border-border bg-card shadow-sm lg:grid-cols-[minmax(0,1fr)_288px]', className)}
    >
      <div className="min-w-0">
        <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-secondary/35 px-3 py-2.5">
          <TitleTag id={titleId} className="text-[13px] font-semibold text-foreground">
            {title}
          </TitleTag>
          <span className="font-mono text-[11px] text-muted-foreground">
            {spans.length} spans · {formatSpanDuration(total)}
          </span>
          {errors > 0 && (
            <Badge tone="destructive" variant="soft" size="sm">
              {errors} {errors === 1 ? 'error' : 'errors'}
            </Badge>
          )}
        </header>
        <div aria-hidden className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] border-b border-border px-3 py-1.5 font-mono text-[10.5px] text-muted-foreground">
          <span>Span</span>
          <span className="relative h-3.5">
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <span
                key={f}
                className={cn('absolute top-0', f === 1 ? '-translate-x-full' : f > 0 && '-translate-x-1/2')}
                style={{ left: `${f * 100}%` }}
              >
                {formatSpanDuration(total * f)}
              </span>
            ))}
          </span>
        </div>
        <ol aria-label="Spans" className="py-1">
          {rows.map(({ span, depth, hasChildren }) => {
            const open = !collapsed.has(span.id);
            const isSelected = span.id === selectedId;
            const indent = 12 + depth * 16;
            return (
              <li key={span.id} className="relative">
                {hasChildren && (
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-label={`${open ? 'Collapse' : 'Expand'} ${span.name}`}
                    onClick={() => toggle(span.id)}
                    className="absolute top-1/2 z-10 grid size-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                    style={{ left: indent - 4 }}
                  >
                    <ChevronRight size={13} aria-hidden className={cn('transition-transform motion-reduce:transition-none', open && 'rotate-90')} />
                  </button>
                )}
                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${span.name}, ${formatSpanDuration(span.duration)}${span.status === 'error' ? ', error' : ''}`}
                  onClick={() => select(span)}
                  className={cn(
                    'grid h-8 w-full grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center pr-3 text-left hover:bg-secondary/50',
                    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
                    isSelected && 'bg-primary/8 hover:bg-primary/12',
                  )}
                >
                  <span className="flex min-w-0 items-center gap-1.5 pr-3" style={{ paddingLeft: indent + 22 }}>
                    <span className={cn('size-2 shrink-0 rounded-full', span.status === 'error' ? 'bg-destructive' : KIND_BAR[span.kind])} aria-hidden />
                    <span className={cn('truncate text-[12.5px]', span.status === 'error' ? 'text-destructive-text' : 'text-foreground')}>
                      {span.name}
                    </span>
                  </span>
                  <span className="relative h-full">
                    <span
                      aria-hidden
                      className={cn('absolute top-1/2 h-2.5 min-w-0.5 -translate-y-1/2 rounded-sm', span.status === 'error' ? 'bg-destructive' : KIND_BAR[span.kind])}
                      style={{ left: `${(span.start / total) * 100}%`, width: `${(span.duration / total) * 100}%` }}
                    />
                    <span
                      aria-hidden
                      className="absolute top-1/2 -translate-y-1/2 pl-1.5 font-mono text-[10.5px] text-muted-foreground"
                      style={span.start + span.duration > total * 0.8 ? { right: `${(1 - span.start / total) * 100}%`, paddingRight: 6 } : { left: `${((span.start + span.duration) / total) * 100}%` }}
                    >
                      {formatSpanDuration(span.duration)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <aside aria-label="Span details" className="border-t border-border bg-secondary/20 p-4 lg:border-t-0 lg:border-l">
        {selected ? (
          <div className="flex flex-col gap-3">
            <div>
              <SubTag className="text-[13.5px] font-semibold break-words text-foreground">{selected.name}</SubTag>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Badge variant="soft" size="sm">
                  {selected.kind}
                </Badge>
                <StatusTag size="sm" status={selected.status} statuses={SPAN_STATUSES} />
              </div>
            </div>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[12px]">
              <dt className="text-muted-foreground">Start</dt>
              <dd className="font-mono text-foreground">+{formatSpanDuration(selected.start)}</dd>
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="font-mono text-foreground">{formatSpanDuration(selected.duration)}</dd>
              {Object.entries(selected.attributes ?? {}).map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="truncate text-muted-foreground">{k}</dt>
                  <dd className="font-mono break-words text-foreground">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <p className="text-[12.5px] text-muted-foreground">Select a span to see its details.</p>
        )}
      </aside>
    </section>
  );
}
