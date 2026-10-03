import { ArrowRight, ChevronsUpDown } from 'lucide-react';
import { useMemo, useRef, useState, type ReactNode, type Ref } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Toggle, ToggleGroup } from '../ToggleGroup';
import { diffLines, diffStats, toJsonText, type DiffLinesOptions } from './diff';
import { collapsibleRanges, pairLines, splitItems, unifiedItems, type ViewLine } from './diff-view';
import { diffViewerVariants } from './diff-viewer.variants';

export type DiffMode = 'split' | 'unified';

export interface DiffViewerProps extends DiffLinesOptions {
  /** The old text, or any JSON value when `format="json"`. */
  oldValue: unknown;
  /** The new text, or any JSON value when `format="json"`. */
  newValue: unknown;
  /** `json` pretty-prints both sides with sorted keys before diffing (strings are parsed). */
  format?: 'text' | 'json';
  /** Layout (controlled). */
  mode?: DiffMode;
  defaultMode?: DiffMode;
  onModeChange?: (mode: DiffMode) => void;
  /** Show the split / unified switch (default true). */
  showModeToggle?: boolean;
  /** File or version labels for each side, e.g. "config.yaml · v3". */
  oldLabel?: ReactNode;
  newLabel?: ReactNode;
  /** Unchanged lines kept around each change; longer runs collapse behind "Expand N lines". `Infinity` shows everything. Default 3. */
  context?: number;
  /** Highlight changed words inside paired lines (default true). */
  wordDiff?: boolean;
  showLineNumbers?: boolean;
  /** Max height of the scrolling body (any CSS length). */
  maxHeight?: number | string;
  /** Accessible name of the scrolling region. Defaults to "Diff". */
  'aria-label'?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Compares two texts (or JSON values) line by line, in split or unified layout. Changed lines
 * carry +/− markers and screen-reader text, not just a tint; paired lines get word-level
 * highlights; long unchanged runs collapse behind an "Expand N lines" button.
 */
export function DiffViewer({
  oldValue,
  newValue,
  format = 'text',
  mode: modeProp,
  defaultMode = 'unified',
  onModeChange,
  showModeToggle = true,
  oldLabel,
  newLabel,
  context = 3,
  wordDiff = true,
  showLineNumbers = true,
  ignoreWhitespace,
  ignoreCase,
  maxHeight,
  'aria-label': ariaLabel,
  className,
  ref,
}: DiffViewerProps) {
  const { t } = useI18n();
  const [innerMode, setInnerMode] = useState<DiffMode>(defaultMode);
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(() => new Set());
  const bodyRef = useRef<HTMLDivElement>(null);
  const mode = modeProp ?? innerMode;
  const s = diffViewerVariants();

  const lines = useMemo(() => {
    const toText = (v: unknown) => (format === 'json' ? toJsonText(v) : typeof v === 'string' ? v : String(v ?? ''));
    return diffLines(toText(oldValue), toText(newValue), { ignoreWhitespace, ignoreCase });
  }, [oldValue, newValue, format, ignoreWhitespace, ignoreCase]);
  const view = useMemo(() => pairLines(lines, wordDiff).lines, [lines, wordDiff]);
  const stats = useMemo(() => diffStats(lines), [lines]);
  const hidden = useMemo(() => collapsibleRanges(lines, context).filter(([start]) => !expanded.has(start)), [lines, context, expanded]);
  const items = useMemo(() => (mode === 'split' ? splitItems(view, hidden) : unifiedItems(view, hidden)), [mode, view, hidden]);

  const digits = String(Math.max(1, ...lines.map((l) => Math.max(l.oldLine ?? 0, l.newLine ?? 0)))).length;
  const numberStyle = { minWidth: `calc(${digits}ch + 1rem)` };

  const setMode = (next: DiffMode) => {
    setInnerMode(next);
    onModeChange?.(next);
  };

  const expand = (start: number) => {
    setExpanded((prev) => new Set(prev).add(start));
    bodyRef.current?.focus();
  };

  const srPrefix = (line: ViewLine) =>
    line.type === 'added' ? t('diff.addedLine', { line: line.newLine ?? '' }) : line.type === 'removed' ? t('diff.removedLine', { line: line.oldLine ?? '' }) : '';

  const code = (line: ViewLine) => {
    const v = diffViewerVariants({ type: line.type });
    const prefix = srPrefix(line);
    return (
      <span className={s.code()}>
        {prefix && <span className="sr-only">{prefix} </span>}
        {line.words
          ? line.words.map((w, i) =>
              w.changed ? (
                <span key={i} className={v.word()} data-changed="">
                  {w.text}
                </span>
              ) : (
                w.text
              ),
            )
          : line.text || '​'}
      </span>
    );
  };

  const marker = (line: ViewLine) => (
    <span aria-hidden className={diffViewerVariants({ type: line.type }).marker()}>
      {line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' '}
    </span>
  );

  const number = (value: number | undefined, line: ViewLine) =>
    showLineNumbers ? (
      <span aria-hidden className={diffViewerVariants({ type: line.type }).number()} style={numberStyle}>
        {value ?? ''}
      </span>
    ) : (
      <span aria-hidden />
    );

  // The new side of an unchanged row repeats the old one, so screen readers skip it.
  const half = (line: ViewLine | undefined, side: 'old' | 'new') => {
    if (!line) return <div className={cn(s.half(), s.empty())} />;
    const type = line.type;
    return (
      <div className={diffViewerVariants({ type }).half()} data-type={type} aria-hidden={side === 'new' && type === 'unchanged' ? true : undefined}>
        {number(side === 'old' ? line.oldLine : line.newLine, line)}
        {marker(line)}
        {code(line)}
      </div>
    );
  };

  const hasChanges = stats.added + stats.removed > 0;
  const labels = oldLabel != null || newLabel != null;

  return (
    <div ref={ref} className={cn(s.root(), className)} data-mode={mode}>
      <div className={s.header()}>
        <div className={s.labels()}>
          {labels && mode === 'unified' && (
            <>
              <span className={s.label()}>
                <span className="sr-only">{t('diff.old')}: </span>
                {oldLabel}
              </span>
              <ArrowRight size={13} aria-hidden className={s.arrow()} />
              <span className={s.label()}>
                <span className="sr-only">{t('diff.new')}: </span>
                {newLabel}
              </span>
            </>
          )}
        </div>
        <div className={s.stats()}>
          <span className={s.statAdded()}>
            <span aria-hidden>+{stats.added}</span>
            <span className="sr-only">{t('diff.additions', { count: stats.added })}</span>
          </span>
          <span className={s.statRemoved()}>
            <span aria-hidden>−{stats.removed}</span>
            <span className="sr-only">{t('diff.deletions', { count: stats.removed })}</span>
          </span>
        </div>
        {showModeToggle && (
          <ToggleGroup aria-label={t('diff.view')} size="sm" value={[mode]} onValueChange={(v) => v[0] && setMode(v[0] as DiffMode)}>
            <Toggle value="unified">{t('diff.unified')}</Toggle>
            <Toggle value="split">{t('diff.split')}</Toggle>
          </ToggleGroup>
        )}
      </div>
      {mode === 'split' && labels && (
        <div className={s.columns()}>
          <span className={s.column()}>
            <span className="sr-only">{t('diff.old')}: </span>
            {oldLabel}
          </span>
          <span className={s.column()}>
            <span className="sr-only">{t('diff.new')}: </span>
            {newLabel}
          </span>
        </div>
      )}
      <div
        ref={bodyRef}
        role="region"
        aria-label={ariaLabel ?? t('diff.label')}
        tabIndex={0}
        className={s.body()}
        style={maxHeight != null ? { maxHeight } : undefined}
      >
        {!hasChanges && <p className={s.noChanges()}>{t('diff.noChanges')}</p>}
        {items.map((item) => {
          if (item.kind === 'collapsed') {
            const start = Number(item.key.slice(1));
            return (
              <div key={item.key} className={s.collapsed()}>
                <Button variant="ghost" size="sm" icon={ChevronsUpDown} className="h-6 font-sans text-[12px]" onClick={() => expand(start)}>
                  {t('diff.expand', { count: item.count })}
                </Button>
              </div>
            );
          }
          if (item.line) {
            const line = item.line;
            return (
              <div key={item.key} className={cn(s.row(), s.unifiedRow(), diffViewerVariants({ type: line.type }).row())} data-type={line.type}>
                {number(line.oldLine, line)}
                {number(line.newLine, line)}
                {marker(line)}
                {code(line)}
              </div>
            );
          }
          const isUnchanged = item.left?.type === 'unchanged';
          return (
            <div key={item.key} className={cn(s.row(), s.splitRow())} data-type={isUnchanged ? 'unchanged' : 'changed'}>
              {half(item.left, 'old')}
              {half(item.right, 'new')}
            </div>
          );
        })}
      </div>
    </div>
  );
}
