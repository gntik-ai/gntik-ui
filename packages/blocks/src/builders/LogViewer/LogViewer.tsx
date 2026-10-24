import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type UIEvent } from 'react';
import { Check, Copy, Eye, Search, X } from '@gntik-ai/icons';
import { IconButton, Input, Switch, Toggle, ToggleGroup, cn, foldText, matchRanges, useI18n } from '@gntik-ai/ui';
import { useWrappedLogRows } from './use-wrapped-log-rows';
import { logLines as defaultLines, type LogLevel, type LogLine } from './fixtures';

export type { LogLevel, LogLine } from './fixtures';

export const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];

const LEVEL_STYLE: Record<LogLevel, { label: string; className: string }> = {
  debug: { label: 'DEBUG', className: 'bg-muted-foreground/16 text-foreground' },
  info: { label: 'INFO', className: 'bg-info/15 text-foreground' },
  warn: { label: 'WARN', className: 'bg-warning/16 text-warning-chip-text' },
  error: { label: 'ERROR', className: 'bg-destructive/15 text-destructive-chip-text' },
};

export interface LogViewerLabels {
  levels?: Partial<Record<LogLevel, string>>;
  title: string;
  levelFilter: string;
  searchLabel: string;
  searchPlaceholder: string;
  follow: string;
  count: (visible: number, total: number) => string;
  empty: string;
  inspect: (timestamp: string) => string;
  copy: (timestamp: string) => string;
  copied: string;
  copyFailed?: string;
}

export interface LogViewerProps {
  /** Per-key copy overrides; explicit props take precedence, then labels, then the active catalog. */
  labels?: Partial<LogViewerLabels>;
  /** Log lines, oldest first. */
  lines?: LogLine[];
  /** Accessible name of the log region and visible title. */
  title?: string;
  /** Height of the scrolling viewport in px. */
  height?: number;
  /** Fixed row height in px (the windowing math relies on it). */
  rowHeight?: number;
  /** Wrap full messages and measure variable-height rows. Default false; rowHeight estimates unmeasured rows. */
  wrap?: boolean;
  /** Rows rendered above and below the visible window. */
  overscan?: number;
  /** Levels shown initially. */
  defaultLevels?: LogLevel[];
  /** Start pinned to the newest line. */
  defaultFollow?: boolean;
  /** Called after a line is copied. */
  onCopyLine?: (line: LogLine) => void;
  /** Enables an inspect button and mouse selection on each visible row. */
  onSelectLine?: (line: LogLine) => void;
  /** Selected inspect button, exposed through aria-pressed. */
  selectedLineId?: string;
  /** Announce appended lines while following (default true). False keeps aria-live off. */
  announceLines?: boolean;
  /** Heading level of the title, to fit the page outline (default h3). */
  titleAs?: 'h2' | 'h3' | 'h4';
  className?: string;
}

/** Wraps case-insensitive matches of `query` in <mark>. */
function highlight(text: string, query: string, locale?: string): ReactNode {
  const parts: ReactNode[] = [];
  let from = 0;
  for (const [start, end] of matchRanges(text, query, { locale })) {
    parts.push(text.slice(from, start));
    parts.push(
      <mark key={start} className="rounded-sm bg-warning/30 text-foreground">
        {text.slice(start, end)}
      </mark>,
    );
    from = end;
  }
  parts.push(text.slice(from));
  return parts;
}

function lineText(line: LogLine) {
  return `${line.timestamp} ${LEVEL_STYLE[line.level].label} ${line.source ? `[${line.source}] ` : ''}${line.message}`;
}

/**
 * Log stream viewer. Only the visible rows are rendered (fixed row height + scroll offset),
 * so it stays fast with thousands of lines. Level filter, search with highlighted matches,
 * follow-tail and per-line copy.
 */
export function LogViewer({
  lines = defaultLines,
  title: titleProp,
  labels,
  height = 360,
  rowHeight = 24,
  wrap = false,
  overscan = 8,
  defaultLevels = LOG_LEVELS,
  defaultFollow = true,
  onCopyLine,
  onSelectLine,
  selectedLineId,
  announceLines = true,
  titleAs: TitleTag = 'h3',
  className,
}: LogViewerProps) {
  const { locale, t } = useI18n();
  const title = titleProp ?? labels?.title ?? t('logViewer.title');
  const titleId = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [levels, setLevels] = useState<string[]>(defaultLevels);
  const [query, setQuery] = useState('');
  const [follow, setFollow] = useState(defaultFollow);
  const [scrollTop, setScrollTop] = useState(0);
  const [copyResult, setCopyResult] = useState<{ id: string; status: 'copied' | 'failed' } | null>(null);
  const mounted = useRef(true);
  const copyAttempt = useRef(0);

  const counts = useMemo(() => {
    const c: Record<LogLevel, number> = { debug: 0, info: 0, warn: 0, error: 0 };
    for (const l of lines) c[l.level] += 1;
    return c;
  }, [lines]);

  const foldedLines = useMemo(
    () =>
      lines.map((line) => ({
        line,
        message: foldText(line.message, locale),
        source: foldText(line.source ?? '', locale),
      })),
    [lines, locale],
  );
  const visible = useMemo(() => {
    const q = foldText(query.trim(), locale);
    return foldedLines
      .filter(
        ({ line, message, source }) =>
          levels.includes(line.level) && (!q || message.indexOf(q) !== -1 || source.indexOf(q) !== -1),
      )
      .map(({ line }) => line);
  }, [foldedLines, levels, query, locale]);

  const wrapped = useWrappedLogRows(wrap, visible, rowHeight, height, overscan, scrollTop, follow);
  const total = wrap ? wrapped.total : visible.length * rowHeight;
  const maxScroll = Math.max(0, total - height);
  // While following, the window is pinned to the end (the DOM scroll catches up in the effect).
  const offset = follow ? maxScroll : Math.min(scrollTop, maxScroll);
  const start = wrap ? wrapped.start : Math.max(0, Math.floor(offset / rowHeight) - overscan);
  const end = wrap ? wrapped.end : Math.min(visible.length, Math.ceil((offset + height) / rowHeight) + overscan);
  const rows = visible.slice(start, end);

  useEffect(() => {
    if (follow && viewport.current) viewport.current.scrollTop = maxScroll;
  }, [follow, maxScroll]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      copyAttempt.current += 1;
      clearTimeout(copyTimer.current);
    };
  }, []);

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const top = event.currentTarget.scrollTop;
    setScrollTop(top);
    if (follow && top < maxScroll - rowHeight) setFollow(false);
  };

  const copy = async (line: LogLine) => {
    clearTimeout(copyTimer.current);
    const current = ++copyAttempt.current;
    let status: 'copied' | 'failed' = 'failed';
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(lineText(line));
        status = 'copied';
      }
    } catch {
      // A denied write must not confirm a copied line.
    }
    if (!mounted.current) return;
    if (current === copyAttempt.current) {
      setCopyResult({ id: line.id, status });
      copyTimer.current = setTimeout(() => setCopyResult(null), 1500);
    }
    if (status === 'copied') onCopyLine?.(line);
  };

  return (
    <section
      aria-labelledby={titleId}
      className={cn('flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm', className)}
    >
      <div className="flex flex-col gap-3 border-b border-border bg-secondary/35 px-3 py-2.5 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2">
          <TitleTag id={titleId} className="text-[13px] font-semibold text-foreground">
            {title}
          </TitleTag>
          <span className="font-mono text-[11px] text-muted-foreground">
            {labels?.count?.(visible.length, lines.length) ??
              t('logViewer.count', { visible: visible.length, total: lines.length })}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ms-auto">
          <ToggleGroup
            aria-label={labels?.levelFilter ?? t('logViewer.levelFilter')}
            size="sm"
            multiple
            value={levels}
            onValueChange={(v) => setLevels(v)}
          >
            {LOG_LEVELS.map((lv) => (
              <Toggle key={lv} value={lv}>
                {labels?.levels?.[lv] ?? t(`logViewer.levelFilterOption.${lv}`)}
                <span className="font-mono text-[10.5px] opacity-70">{counts[lv]}</span>
              </Toggle>
            ))}
          </ToggleGroup>
          <Input
            size="sm"
            type="search"
            aria-label={labels?.searchLabel ?? t('logViewer.searchLabel')}
            placeholder={labels?.searchPlaceholder ?? t('logViewer.searchPlaceholder')}
            leadingIcon={Search}
            value={query}
            onValueChange={(v) => setQuery(String(v))}
            className="w-full sm:w-48"
          />
          <Switch
            size="sm"
            label={labels?.follow ?? t('logViewer.follow')}
            checked={follow}
            onCheckedChange={setFollow}
          />
        </div>
      </div>
      <div
        ref={viewport}
        role="log"
        aria-label={title}
        aria-live={announceLines && follow ? 'polite' : 'off'}
        tabIndex={0}
        onScroll={onScroll}
        className="relative overflow-auto bg-background font-mono text-[12px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring"
        style={{ height }}
      >
        {visible.length === 0 ? (
          <p className="px-4 py-6 text-center font-sans text-[13px] text-muted-foreground">
            {labels?.empty ?? t('logViewer.empty')}
          </p>
        ) : (
          <div className="relative w-full" style={{ height: total }}>
            {rows.map((line, i) => {
              const lv = LEVEL_STYLE[line.level];
              const status = copyResult?.id === line.id ? copyResult.status : 'idle';
              return (
                <div
                  key={line.id}
                  data-slot="log-line"
                  ref={wrap ? (node) => wrapped.measureRow(node, line.id) : undefined}
                  onClick={onSelectLine ? () => onSelectLine(line) : undefined}
                  className={
                    wrap
                      ? 'group absolute inset-x-0 flex items-start gap-2.5 px-3 hover:bg-secondary/50'
                      : 'group absolute inset-x-0 flex items-center gap-2.5 px-3 hover:bg-secondary/50'
                  }
                  style={
                    wrap
                      ? { top: wrapped.offsets[start + i], minHeight: rowHeight }
                      : { top: (start + i) * rowHeight, height: rowHeight }
                  }
                >
                  <span className="shrink-0 text-muted-foreground tabular-nums">{line.timestamp}</span>
                  <span
                    className={cn(
                      'inline-flex h-4 w-12 shrink-0 items-center justify-center rounded text-[10px] font-semibold',
                      lv.className,
                    )}
                  >
                    {labels?.levels?.[line.level] ?? t(`logViewer.level.${line.level}`)}
                  </span>
                  {line.source && (
                    <span className="hidden shrink-0 text-muted-foreground sm:inline">
                      [{highlight(line.source, query, locale)}]
                    </span>
                  )}
                  <span
                    className={
                      wrap
                        ? 'min-w-0 flex-1 whitespace-pre-wrap break-words text-foreground'
                        : 'min-w-0 flex-1 truncate text-foreground'
                    }
                  >
                    {highlight(line.message, query, locale)}
                  </span>
                  {onSelectLine && (
                    <IconButton
                      size="sm"
                      icon={Eye}
                      label={labels?.inspect?.(line.timestamp) ?? t('logViewer.inspect', { timestamp: line.timestamp })}
                      aria-pressed={line.id === selectedLineId}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectLine(line);
                      }}
                      className="size-6 shrink-0"
                    />
                  )}
                  <IconButton
                    size="sm"
                    icon={status === 'failed' ? X : status === 'copied' ? Check : Copy}
                    label={
                      status === 'failed'
                        ? (labels?.copyFailed ?? t('common.copyFailed'))
                        : status === 'copied'
                          ? (labels?.copied ?? t('common.copied'))
                          : (labels?.copy?.(line.timestamp) ?? t('logViewer.copy', { timestamp: line.timestamp }))
                    }
                    onClick={(event) => {
                      if (onSelectLine) event.stopPropagation();
                      void copy(line);
                    }}
                    className="size-6 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
