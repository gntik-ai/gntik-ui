import { ArrowDown, Check, ChevronDown, ChevronUp, Copy, Search, WrapText } from 'lucide-react';
import {
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { ansiClassName, parseAnsiState, type AnsiSegment, type AnsiStyle } from './ansi';
import { appendChunk, EMPTY_BUFFER, toBufferLine, trimBuffer, type BufferLine, type TerminalBuffer, type TerminalLine } from './buffer';
import { terminalVariants } from './terminal.variants';

export type { TerminalLine } from './buffer';

/** Imperative API (`ref`): stream output into an uncontrolled Terminal. */
export interface TerminalHandle {
  /** Appends raw output; a chunk without a trailing newline leaves the line open for the next one. */
  write: (chunk: string) => void;
  /** Appends one complete line. */
  writeln: (line?: string) => void;
  /** Removes every line. */
  clear: () => void;
  /** Scrolls to the newest line and resumes following the tail. */
  scrollToBottom: () => void;
  /** All output as plain text (escapes stripped). */
  getText: () => string;
}

export interface TerminalProps {
  /** Controlled output (ANSI escapes allowed). Without it, stream through the `ref` handle. */
  lines?: readonly TerminalLine[];
  /** Initial output of an uncontrolled Terminal. */
  defaultLines?: readonly TerminalLine[];
  ref?: Ref<TerminalHandle>;
  /** Oldest lines beyond this are dropped (line numbers keep counting). Default 5000. */
  maxLines?: number;
  showLineNumbers?: boolean;
  /** Shows each line's time (lines written through the handle are stamped on arrival). */
  showTimestamps?: boolean;
  formatTimestamp?: (date: Date) => string;
  wrap?: boolean;
  defaultWrap?: boolean;
  onWrapChange?: (wrap: boolean) => void;
  /** Toolbar title, e.g. the command or job name. */
  title?: ReactNode;
  /** Accessible name of the log. Default: "Terminal output". */
  label?: string;
  /**
   * Announce new output to screen readers. Off by default (a busy log is noise); opt in with
   * `true` / `'polite'` for slow, meaningful output, `'assertive'` only for urgent streams.
   */
  live?: boolean | 'polite' | 'assertive';
  /** Show the toolbar (title, search, wrap, copy). Default true. */
  toolbar?: boolean;
  searchable?: boolean;
  copyable?: boolean;
  wrapToggle?: boolean;
  /** Shown while there is no output. */
  emptyText?: ReactNode;
  className?: string;
}

interface Match {
  line: number;
  start: number;
  end: number;
}

const BOTTOM_SLACK = 8;

/** Parses every line, carrying the ANSI style across lines like a real terminal. */
function parseLines(lines: readonly BufferLine[]) {
  let style: AnsiStyle = {};
  return lines.map((line) => {
    const result = parseAnsiState(line.text, style);
    style = result.style;
    return { segments: result.segments, plain: result.segments.map((seg) => seg.text).join('') };
  });
}

/** Segments of one line with the search matches cut out as `<mark>`s. */
function renderSegments(segments: AnsiSegment[], matches: Match[], currentKey: string | null, markClass: string, lineIndex: number) {
  if (!matches.length) {
    return segments.map((seg, i) => {
      const cls = ansiClassName(seg);
      return cls ? (
        <span key={i} className={cls}>
          {seg.text}
        </span>
      ) : (
        seg.text
      );
    });
  }
  const out: ReactNode[] = [];
  let offset = 0;
  segments.forEach((seg, i) => {
    const cls = ansiClassName(seg) || undefined;
    const segStart = offset;
    const segEnd = offset + seg.text.length;
    let cursor = segStart;
    for (const m of matches) {
      if (m.end <= cursor || m.start >= segEnd) continue;
      const from = Math.max(m.start, cursor);
      const to = Math.min(m.end, segEnd);
      if (from > cursor) out.push(<span key={`${i}-${cursor}`} className={cls}>{seg.text.slice(cursor - segStart, from - segStart)}</span>);
      const key = `${lineIndex}:${m.start}`;
      out.push(
        <mark key={`${i}-m${from}`} className={cn(markClass, cls)} data-current={key === currentKey || undefined} data-match={key}>
          {seg.text.slice(from - segStart, to - segStart)}
        </mark>,
      );
      cursor = to;
    }
    if (cursor < segEnd) out.push(<span key={`${i}-${cursor}`} className={cls}>{seg.text.slice(cursor - segStart)}</span>);
    offset = segEnd;
  });
  return out;
}

/**
 * Streamed command output: ANSI colours mapped to tokens, tail following with "Jump to latest",
 * optional line numbers / timestamps, wrap toggle, copy all, search highlight and a line cap.
 * The output is a `role="log"` (aria-live off unless `live`).
 */
export function Terminal({
  lines: linesProp,
  defaultLines,
  ref,
  maxLines = 5000,
  showLineNumbers = false,
  showTimestamps = false,
  formatTimestamp,
  wrap: wrapProp,
  defaultWrap = false,
  onWrapChange,
  title,
  label,
  live = false,
  toolbar = true,
  searchable = true,
  copyable = true,
  wrapToggle = true,
  emptyText,
  className,
}: TerminalProps) {
  const { t, locale } = useI18n();
  const [inner, setInner] = useState<TerminalBuffer>(() =>
    trimBuffer({ ...EMPTY_BUFFER, lines: (defaultLines ?? []).map(toBufferLine) }, maxLines),
  );
  const buffer = useMemo<TerminalBuffer>(
    () => (linesProp ? trimBuffer({ ...EMPTY_BUFFER, lines: linesProp.map(toBufferLine) }, maxLines) : trimBuffer(inner, maxLines)),
    [linesProp, inner, maxLines],
  );
  const [innerWrap, setInnerWrap] = useState(defaultWrap);
  const wrap = wrapProp ?? innerWrap;
  const [following, setFollowing] = useState(true);
  const [seenTotal, setSeenTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [current, setCurrent] = useState(0);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const viewportRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchId = useId();
  const s = terminalVariants({ wrap });

  const total = buffer.first + buffer.lines.length;

  const parsed = useMemo(() => parseLines(buffer.lines), [buffer.lines]);

  const matches = useMemo<Match[]>(() => {
    const q = query.trim().toLocaleLowerCase(locale);
    if (!q) return [];
    const found: Match[] = [];
    parsed.forEach((line, index) => {
      const hay = line.plain.toLocaleLowerCase(locale);
      let at = hay.indexOf(q);
      while (at >= 0) {
        found.push({ line: index, start: at, end: at + q.length });
        at = hay.indexOf(q, at + q.length);
      }
    });
    return found;
  }, [parsed, query, locale]);
  const currentIndex = matches.length ? Math.min(current, matches.length - 1) : -1;
  const currentMatch = currentIndex >= 0 ? matches[currentIndex] : undefined;
  const currentKey = currentMatch ? `${currentMatch.line}:${currentMatch.start}` : null;

  const scrollToBottom = () => {
    const el = viewportRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    setFollowing(true);
  };

  useImperativeHandle(
    ref,
    () => ({
      write: (chunk) => setInner((prev) => appendChunk(prev, chunk, maxLines)),
      writeln: (line = '') => setInner((prev) => appendChunk(prev, `${prev.open ? '\n' : ''}${line}\n`, maxLines)),
      clear: () => setInner(EMPTY_BUFFER),
      scrollToBottom,
      getText: () => parsed.map((line) => line.plain).join('\n'),
    }),
    [maxLines, parsed],
  );

  // Follow the tail while the user has not scrolled up.
  useLayoutEffect(() => {
    if (!following || currentKey) return;
    const el = viewportRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [total, buffer.lines, following, currentKey]);

  // Bring the current search match into view.
  useEffect(() => {
    if (!currentKey) return;
    const mark = viewportRef.current?.querySelector(`[data-match="${currentKey}"]`);
    if (mark && 'scrollIntoView' in mark && typeof mark.scrollIntoView === 'function') mark.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [currentKey]);

  useEffect(() => {
    if (copyStatus === 'idle') return;
    const id = window.setTimeout(() => setCopyStatus('idle'), 2000);
    return () => window.clearTimeout(id);
  }, [copyStatus]);

  const onScroll = () => {
    const el = viewportRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_SLACK;
    if (atBottom !== following) {
      setFollowing(atBottom);
      if (!atBottom) setSeenTotal(total);
    }
  };

  const onViewportKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const el = viewportRef.current;
    if (!el) return;
    if (e.key === 'End' && !e.shiftKey) {
      e.preventDefault();
      scrollToBottom();
    } else if (e.key === 'Home' && !e.shiftKey) {
      e.preventDefault();
      el.scrollTop = 0;
      setFollowing(false);
      setSeenTotal(total);
    }
  };

  const onRootKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (searchable && toolbar && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    }
  };

  const step = (delta: number) => {
    if (!matches.length) return;
    if (following) setSeenTotal(total);
    setFollowing(false);
    setCurrent((c) => (Math.min(c, matches.length - 1) + delta + matches.length) % matches.length);
  };

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      step(e.shiftKey ? -1 : 1);
    } else if (e.key === 'Escape' && query) {
      e.preventDefault();
      e.stopPropagation();
      setQuery('');
      setCurrent(0);
    }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(parsed.map((line) => line.plain).join('\n'));
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  const toggleWrap = () => {
    const next = !wrap;
    setInnerWrap(next);
    onWrapChange?.(next);
  };

  const unseen = following ? 0 : Math.max(0, total - seenTotal);
  const digits = String(Math.max(total, 1)).length;
  const timeFormat = useMemo(() => {
    if (formatTimestamp) return formatTimestamp;
    const fmt = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    return (d: Date) => fmt.format(d);
  }, [formatTimestamp, locale]);
  const ariaLive = live === true ? 'polite' : live || 'off';
  const announcement = copyStatus === 'copied' ? t('common.copiedToClipboard') : copyStatus === 'failed' ? t('common.copyFailed') : '';

  return (
    <div className={cn(s.root(), className)} onKeyDown={onRootKeyDown}>
      {toolbar && (
        <div className={s.header()}>
          {title && <span className={s.title()}>{title}</span>}
          <div className={s.actions()}>
            {searchable && (
              <div className={s.search()}>
                <Search size={12} aria-hidden className="shrink-0" />
                <input
                  ref={searchRef}
                  id={searchId}
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCurrent(0);
                  }}
                  onKeyDown={onSearchKeyDown}
                  aria-label={t('terminal.search')}
                  placeholder={t('common.searchPlaceholder')}
                  className={s.searchInput()}
                />
                {query.trim() && (
                  <span className={s.matches()} aria-live="polite">
                    {matches.length ? t('terminal.matches', { current: currentIndex + 1, total: matches.length }) : t('terminal.noMatches')}
                  </span>
                )}
                <button type="button" className={s.button()} aria-label={t('terminal.previousMatch')} disabled={!matches.length} onClick={() => step(-1)}>
                  <ChevronUp size={13} aria-hidden />
                </button>
                <button type="button" className={s.button()} aria-label={t('terminal.nextMatch')} disabled={!matches.length} onClick={() => step(1)}>
                  <ChevronDown size={13} aria-hidden />
                </button>
              </div>
            )}
            {wrapToggle && (
              <button type="button" className={s.button()} aria-label={t('terminal.wrap')} aria-pressed={wrap} onClick={toggleWrap}>
                <WrapText size={14} aria-hidden />
              </button>
            )}
            {copyable && (
              <button
                type="button"
                className={cn(s.button(), copyStatus === 'copied' && s.copied())}
                aria-label={t('terminal.copyAll')}
                disabled={!buffer.lines.length}
                onClick={copyAll}
              >
                {copyStatus === 'copied' ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
              </button>
            )}
          </div>
        </div>
      )}
      <div className={s.body()}>
        <div
          ref={viewportRef}
          role="log"
          aria-live={ariaLive}
          aria-label={label ?? t('terminal.label')}
          tabIndex={0}
          onScroll={onScroll}
          onKeyDown={onViewportKeyDown}
          className={s.viewport()}
        >
          {buffer.lines.length === 0 && emptyText ? <div className={s.empty()}>{emptyText}</div> : null}
          <div className={s.lines()}>
            {buffer.lines.map((line, index) => {
              const number = buffer.first + index + 1;
              const lineMatches = matches.length ? matches.filter((m) => m.line === index) : [];
              const segments = parsed[index]?.segments ?? [];
              return (
                <div key={number} className={s.line()} data-current={currentMatch?.line === index || undefined}>
                  {showLineNumbers && (
                    <span aria-hidden className={s.lineNumber()} style={{ minWidth: `${digits}ch` }}>
                      {number}
                    </span>
                  )}
                  {showTimestamps && line.timestamp !== undefined && (
                    <time dateTime={new Date(line.timestamp).toISOString()} className={s.timestamp()}>
                      {timeFormat(new Date(line.timestamp))}
                    </time>
                  )}
                  <span className={s.content()}>{segments.length ? renderSegments(segments, lineMatches, currentKey, s.mark(), index) : '​'}</span>
                </div>
              );
            })}
          </div>
        </div>
        {!following && (
          <button type="button" className={s.jump()} onClick={scrollToBottom}>
            <ArrowDown size={13} aria-hidden />
            {t('terminal.jumpToLatest')}
            {unseen > 0 && <span className="text-muted-foreground">· {t('terminal.newLines', { count: unseen })}</span>}
          </button>
        )}
      </div>
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
