import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronRight } from '@gntik-ai/icons';
import { Badge, cn, useI18n } from '@gntik-ai/ui';
import { traceSpans, type SpanKind, type TraceSpan } from './fixtures';
import { SpanDetails, formatSpanDuration } from './span-details';

export type { SpanKind, TraceSpan } from './fixtures';
export { SPAN_STATUSES, SpanDetails, formatSpanDuration, type SpanDetailsProps } from './span-details';

/** Bar colour per span kind (category tokens; errors always use destructive). */
const KIND_BAR: Record<SpanKind, string> = {
  http: 'bg-muted-foreground/70',
  chain: 'bg-category-amber',
  llm: 'bg-primary',
  tool: 'bg-category-violet',
  retrieval: 'bg-category-cyan',
};

export interface TraceWaterfallProps {
  spans?: TraceSpan[];
  title?: string;
  /** Selected span (controlled). `null` selects nothing. */
  selectedId?: string | null;
  /** Span selected initially (defaults to the first root). */
  defaultSelectedId?: string;
  /** Called with the span selected by click, Enter or Space. */
  onSelect?: (span: TraceSpan) => void;
  /** Called with the id of the span selected (pair with `selectedId`). */
  onSelectedIdChange?: (id: string) => void;
  /** Span ids collapsed initially. */
  defaultCollapsed?: string[];
  /** Shows the details pane of the selected span (default true). */
  showDetails?: boolean;
  /** Custom content of the details pane (default: name, kind, status, timing and attributes). */
  renderDetails?: (span: TraceSpan) => ReactNode;
  /** Heading level of the title, to fit the page outline (default h3); inner headings use the next level. */
  titleAs?: 'h2' | 'h3' | 'h4';
  className?: string;
}

interface Row {
  span: TraceSpan;
  depth: number;
  hasChildren: boolean;
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

const statusSuffix = (span: TraceSpan) => (span.status === 'error' ? ', error' : span.status === 'running' ? ', running' : '');

/**
 * Trace waterfall: span tree + duration bars on a shared time axis + an optional details pane for
 * the selected span. The span list is one tab stop: ↑/↓ move, Home/End jump, → expands or moves to
 * the first child, ← collapses or moves to the parent, Enter/Space select.
 */
export function TraceWaterfall({
  spans = traceSpans,
  title = 'Trace',
  selectedId: selectedProp,
  defaultSelectedId,
  onSelect,
  onSelectedIdChange,
  defaultCollapsed = [],
  showDetails = true,
  renderDetails,
  titleAs: TitleTag = 'h3',
  className,
}: TraceWaterfallProps) {
  const { t } = useI18n();
  const SubTag = TitleTag === 'h2' ? 'h3' : TitleTag === 'h3' ? 'h4' : 'h5';
  const titleId = useId();
  const [collapsed, setCollapsed] = useState(() => new Set(defaultCollapsed));
  const [innerSelected, setInnerSelected] = useState<string | undefined>(defaultSelectedId ?? spans.find((s) => !s.parentId)?.id);
  const [focusId, setFocusId] = useState<string | undefined>(undefined);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const rows = useMemo(() => flatten(spans, collapsed), [spans, collapsed]);
  const total = Math.max(1, ...spans.map((s) => s.start + s.duration));
  const selectedId = selectedProp === undefined ? innerSelected : (selectedProp ?? undefined);
  const selected = spans.find((s) => s.id === selectedId);
  const errors = spans.filter((s) => s.status === 'error').length;
  const running = spans.filter((s) => s.status === 'running').length;
  // Roving tab stop: the focused span, else the selected one, else the first row.
  const tabStop = rows.find((r) => r.span.id === focusId)?.span.id ?? rows.find((r) => r.span.id === selectedId)?.span.id ?? rows[0]?.span.id;

  const setOpen = (id: string, open: boolean) =>
    setCollapsed((prev) => {
      if (prev.has(id) === !open) return prev;
      const next = new Set(prev);
      if (open) next.delete(id);
      else next.add(id);
      return next;
    });

  const select = (span: TraceSpan) => {
    setInnerSelected(span.id);
    onSelectedIdChange?.(span.id);
    onSelect?.(span);
  };

  const focusSpan = (id: string | undefined) => {
    if (!id) return;
    setFocusId(id);
    buttons.current.get(id)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const row = rows[index];
    if (!row) return;
    const open = !collapsed.has(row.span.id);
    let handled = true;
    if (e.key === 'ArrowDown') focusSpan(rows[index + 1]?.span.id);
    else if (e.key === 'ArrowUp') focusSpan(rows[index - 1]?.span.id);
    else if (e.key === 'Home') focusSpan(rows[0]?.span.id);
    else if (e.key === 'End') focusSpan(rows[rows.length - 1]?.span.id);
    else if (e.key === 'ArrowRight' && row.hasChildren) {
      if (open) focusSpan(rows[index + 1]?.span.id);
      else setOpen(row.span.id, true);
    } else if (e.key === 'ArrowLeft') {
      if (row.hasChildren && open) setOpen(row.span.id, false);
      else focusSpan(row.span.parentId);
    } else handled = false;
    if (handled) e.preventDefault();
  };

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'grid overflow-hidden rounded-lg border border-border bg-card shadow-sm',
        showDetails && 'lg:grid-cols-[minmax(0,1fr)_288px]',
        className,
      )}
    >
      <div className="min-w-0">
        <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-secondary/35 px-3 py-2.5">
          <TitleTag id={titleId} className="text-[13px] font-semibold text-foreground">
            {title}
          </TitleTag>
          <span className="font-mono text-[11px] text-muted-foreground">
            {spans.length} spans · {formatSpanDuration(total)}
          </span>
          {running > 0 && (
            <Badge tone="info" variant="soft" size="sm">
              {running} running
            </Badge>
          )}
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
                className={cn('absolute top-0', f === 1 ? '-translate-x-full rtl:translate-x-full' : f > 0 && '-translate-x-1/2 rtl:translate-x-1/2')}
                style={{ insetInlineStart: `${f * 100}%` }}
              >
                {formatSpanDuration(total * f)}
              </span>
            ))}
          </span>
        </div>
        <ol aria-label="Spans" className="py-1">
          {rows.map(({ span, depth, hasChildren }, index) => {
            const open = !collapsed.has(span.id);
            const isSelected = span.id === selectedId;
            const isRunning = span.status === 'running';
            const indent = 12 + depth * 16;
            const bar = span.status === 'error' ? 'bg-destructive' : KIND_BAR[span.kind];
            const label = `${formatSpanDuration(span.duration)}${isRunning ? ' · running' : ''}`;
            return (
              <li key={span.id} className="relative">
                {hasChildren && (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-expanded={open}
                    aria-label={t(open ? 'common.collapseItem' : 'common.expandItem', { label: span.name })}
                    onClick={() => setOpen(span.id, !open)}
                    className="absolute top-1/2 z-10 grid size-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                    style={{ insetInlineStart: indent - 4 }}
                  >
                    <ChevronRight size={13} aria-hidden className={cn('transition-transform motion-reduce:transition-none', open ? 'rotate-90' : 'rtl:-scale-x-100')} />
                  </button>
                )}
                <button
                  ref={(el) => {
                    if (el) buttons.current.set(span.id, el);
                    else buttons.current.delete(span.id);
                  }}
                  type="button"
                  tabIndex={span.id === tabStop ? 0 : -1}
                  aria-pressed={isSelected}
                  aria-label={`${span.name}, ${formatSpanDuration(span.duration)}${statusSuffix(span)}`}
                  data-status={span.status}
                  onClick={() => select(span)}
                  onFocus={() => setFocusId(span.id)}
                  onKeyDown={(e) => onKeyDown(e, index)}
                  className={cn(
                    'grid h-8 w-full grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center pe-3 text-start hover:bg-secondary/50',
                    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
                    isSelected && 'bg-primary/8 hover:bg-primary/12',
                  )}
                >
                  <span className="flex min-w-0 items-center gap-1.5 pe-3" style={{ paddingInlineStart: indent + 22 }}>
                    <span
                      aria-hidden
                      className={cn(
                        'size-2 shrink-0 rounded-full',
                        isRunning ? 'border-[1.5px] border-foreground bg-transparent' : bar,
                      )}
                    />
                    <span className={cn('truncate text-[12.5px]', span.status === 'error' ? 'text-destructive-text' : 'text-foreground')}>
                      {span.name}
                    </span>
                  </span>
                  <span className="relative h-full">
                    <span
                      aria-hidden
                      data-span-bar=""
                      className={cn(
                        'absolute top-1/2 h-2.5 min-w-0.5 -translate-y-1/2',
                        bar,
                        // In progress: an open (square, outlined) end and a soft pulse that stops under reduced motion.
                        isRunning ? 'animate-pulse rounded-s-sm border-e-2 border-foreground opacity-70 motion-reduce:animate-none' : 'rounded-sm',
                      )}
                      style={{ insetInlineStart: `${(span.start / total) * 100}%`, width: `${(span.duration / total) * 100}%` }}
                    />
                    <span
                      aria-hidden
                      className="absolute top-1/2 -translate-y-1/2 ps-1.5 font-mono text-[10.5px] whitespace-nowrap text-muted-foreground"
                      style={span.start + span.duration > total * 0.8 ? { insetInlineEnd: `${(1 - span.start / total) * 100}%`, paddingInlineEnd: 6 } : { insetInlineStart: `${((span.start + span.duration) / total) * 100}%` }}
                    >
                      {label}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      {showDetails && (
        <aside aria-label="Span details" className="border-t border-border bg-secondary/20 p-4 lg:border-t-0 lg:border-s">
          {selected ? (
            renderDetails ? (
              renderDetails(selected)
            ) : (
              <SpanDetails span={selected} headingAs={SubTag} />
            )
          ) : (
            <p className="text-[12.5px] text-muted-foreground">Select a span to see its details.</p>
          )}
        </aside>
      )}
    </section>
  );
}
