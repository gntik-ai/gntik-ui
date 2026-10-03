import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type UIEvent } from 'react';
import { Check, Copy, Search } from '@gntik-ai/icons';
import { IconButton, Input, Switch, Toggle, ToggleGroup, cn } from '@gntik-ai/ui';
import { logLines as defaultLines, type LogLevel, type LogLine } from './fixtures';

export type { LogLevel, LogLine } from './fixtures';

export const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];

const LEVEL_STYLE: Record<LogLevel, { label: string; className: string }> = {
  debug: { label: 'DEBUG', className: 'bg-muted-foreground/16 text-foreground' },
  info: { label: 'INFO', className: 'bg-info/15 text-foreground' },
  warn: { label: 'WARN', className: 'bg-warning/16 text-warning-chip-text' },
  error: { label: 'ERROR', className: 'bg-destructive/15 text-destructive-chip-text' },
};

export interface LogViewerProps {
  /** Log lines, oldest first. */
  lines?: LogLine[];
  /** Accessible name of the log region and visible title. */
  title?: string;
  /** Height of the scrolling viewport in px. */
  height?: number;
  /** Fixed row height in px (the windowing math relies on it). */
  rowHeight?: number;
  /** Rows rendered above and below the visible window. */
  overscan?: number;
  /** Levels shown initially. */
  defaultLevels?: LogLevel[];
  /** Start pinned to the newest line. */
  defaultFollow?: boolean;
  /** Called after a line is copied. */
  onCopyLine?: (line: LogLine) => void;
  /** Heading level of the title, to fit the page outline (default h3). */
  titleAs?: 'h2' | 'h3' | 'h4';
  className?: string;
}

/** Wraps case-insensitive matches of `query` in <mark>. */
function highlight(text: string, query: string): ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const parts: ReactNode[] = [];
  let from = 0;
  let at = lower.indexOf(q, from);
  while (at !== -1) {
    if (at > from) parts.push(text.slice(from, at));
    parts.push(
      <mark key={at} className="rounded-sm bg-warning/30 text-foreground">
        {text.slice(at, at + q.length)}
      </mark>,
    );
    from = at + q.length;
    at = lower.indexOf(q, from);
  }
  if (from < text.length) parts.push(text.slice(from));
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
  title = 'Logs',
  height = 360,
  rowHeight = 24,
  overscan = 8,
  defaultLevels = LOG_LEVELS,
  defaultFollow = true,
  onCopyLine,
  titleAs: TitleTag = 'h3',
  className,
}: LogViewerProps) {
  const titleId = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [levels, setLevels] = useState<string[]>(defaultLevels);
  const [query, setQuery] = useState('');
  const [follow, setFollow] = useState(defaultFollow);
  const [scrollTop, setScrollTop] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<LogLevel, number> = { debug: 0, info: 0, warn: 0, error: 0 };
    for (const l of lines) c[l.level] += 1;
    return c;
  }, [lines]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lines.filter(
      (l) => levels.includes(l.level) && (!q || l.message.toLowerCase().includes(q) || (l.source ?? '').toLowerCase().includes(q)),
    );
  }, [lines, levels, query]);

  const total = visible.length * rowHeight;
  const maxScroll = Math.max(0, total - height);
  // While following, the window is pinned to the end (the DOM scroll catches up in the effect).
  const offset = follow ? maxScroll : Math.min(scrollTop, maxScroll);
  const start = Math.max(0, Math.floor(offset / rowHeight) - overscan);
  const end = Math.min(visible.length, Math.ceil((offset + height) / rowHeight) + overscan);
  const rows = visible.slice(start, end);

  useEffect(() => {
    if (follow && viewport.current) viewport.current.scrollTop = maxScroll;
  }, [follow, maxScroll]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const top = event.currentTarget.scrollTop;
    setScrollTop(top);
    if (follow && top < maxScroll - rowHeight) setFollow(false);
  };

  const copy = (line: LogLine) => {
    void navigator.clipboard?.writeText(lineText(line)).catch(() => undefined);
    onCopyLine?.(line);
    setCopied(line.id);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(null), 1500);
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
            {visible.length} of {lines.length}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <ToggleGroup aria-label="Log levels" size="sm" multiple value={levels} onValueChange={(v) => setLevels(v)}>
            {LOG_LEVELS.map((lv) => (
              <Toggle key={lv} value={lv}>
                {lv}
                <span className="font-mono text-[10.5px] opacity-70">{counts[lv]}</span>
              </Toggle>
            ))}
          </ToggleGroup>
          <Input
            size="sm"
            type="search"
            aria-label="Search logs"
            placeholder="Search…"
            leadingIcon={Search}
            value={query}
            onValueChange={(v) => setQuery(String(v))}
            className="w-full sm:w-48"
          />
          <Switch size="sm" label="Follow" checked={follow} onCheckedChange={setFollow} />
        </div>
      </div>
      <div
        ref={viewport}
        role="log"
        aria-label={title}
        aria-live={follow ? 'polite' : 'off'}
        tabIndex={0}
        onScroll={onScroll}
        className="relative overflow-auto bg-background font-mono text-[12px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring"
        style={{ height }}
      >
        {visible.length === 0 ? (
          <p className="px-4 py-6 text-center font-sans text-[13px] text-muted-foreground">No lines match the current filters.</p>
        ) : (
          <div className="relative w-full" style={{ height: total }}>
            {rows.map((line, i) => {
              const lv = LEVEL_STYLE[line.level];
              return (
                <div
                  key={line.id}
                  data-slot="log-line"
                  className="group absolute inset-x-0 flex items-center gap-2.5 px-3 hover:bg-secondary/50"
                  style={{ top: (start + i) * rowHeight, height: rowHeight }}
                >
                  <span className="shrink-0 text-muted-foreground tabular-nums">{line.timestamp}</span>
                  <span className={cn('inline-flex h-4 w-12 shrink-0 items-center justify-center rounded text-[10px] font-semibold', lv.className)}>
                    {lv.label}
                  </span>
                  {line.source && <span className="hidden shrink-0 text-muted-foreground sm:inline">[{highlight(line.source, query.trim())}]</span>}
                  <span className="min-w-0 flex-1 truncate text-foreground">{highlight(line.message, query.trim())}</span>
                  <IconButton
                    size="sm"
                    icon={copied === line.id ? Check : Copy}
                    label={copied === line.id ? 'Copied' : `Copy line ${line.timestamp}`}
                    onClick={() => copy(line)}
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
