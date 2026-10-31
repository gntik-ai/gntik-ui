import { useClipboard } from '../../hooks/useClipboard';
import { useI18n } from '../../i18n/I18nProvider';
import { highlight } from '../../utils/highlight';
import { Check, Copy } from 'lucide-react';
import { useMemo, useState, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { Badge } from '../Badge/Badge';
import { TreeList } from '../TreeList/TreeList';
import type { TreeNode } from '../TreeList/tree-model';
import {
  entries,
  joinPath,
  jsonType,
  jsonSearchIndex,
  ancestorsFromIndex,
  measureJsonDisplay,
  pathsToDepth,
} from './json-model';
import { jsonTypeClass, jsonViewerVariants } from './json-viewer.variants';

export interface JsonViewerLabels {
  copyPath: string;
  copyValue: string;
  copied: string;
  copyFailed: string;
  /** Toolbar hint before a node is selected. */
  selectHint: string;
  /** Visible indicator when the display cap is exceeded. */
  truncated: string;
  /** Explains that copying capped text copies the full value. */
  copyFullHint: string;
  /** Summary of an object / array. */
  keys: (n: number) => string;
  items: (n: number) => string;
  /** Name of the root when the path is empty. */
  root: string;
}

export interface JsonViewerProps {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Any JSON-serialisable value. */
  data: unknown;
  /** Accessible name of the tree or capped text scroll region. */
  label?: string;
  /** Levels expanded on first render (default 1). */
  defaultExpandDepth?: number;
  /** Deeper containers render as a summary and do not expand. */
  maxDepth?: number;
  /** Highlights matching keys and values and expands their ancestors. No effect on capped text. */
  search?: string;
  /** Shows the path / copy toolbar (default true). */
  toolbar?: boolean;
  /** Max height of the scrollable body (px or CSS length). */
  maxHeight?: number | string;
  /** Display limit in UTF-16 code units. Only finite integers >= 1 enable capped mode. */
  maxDisplayChars?: number;
  /** Content for null, undefined or an empty string in capped mode (default a muted dash). */
  emptyContent?: ReactNode;
  /** Built-in strings (English defaults). */
  labels?: Partial<JsonViewerLabels>;
}

const s = jsonViewerVariants();

function preview(value: unknown, labels: JsonViewerLabels, query: string, locale?: string): ReactNode {
  const type = jsonType(value);
  if (type === 'object' || type === 'array') {
    const n = entries(value).length;
    return (
      <span className={jsonTypeClass.summary}>
        {type === 'array' ? `[ ] ${labels.items(n)}` : `{ } ${labels.keys(n)}`}
      </span>
    );
  }
  const text = type === 'string' ? JSON.stringify(value) : String(value ?? null);
  return <span className={jsonTypeClass[type]}>{highlight(text, query, locale)}</span>;
}

/**
 * Collapsible JSON inspector on TreeList (tree keyboard pattern): objects and arrays expand,
 * values are coloured by type with contrast-safe text tokens, `search` highlights and reveals
 * matches, and the toolbar copies the selected node's path or value.
 */
export function JsonViewer({
  data,
  label = 'JSON', // i18n-literal-allow: language-independent data format identifier
  defaultExpandDepth = 1,
  maxDepth = Infinity,
  search = '',
  toolbar = true,
  maxHeight,
  maxDisplayChars,
  emptyContent = <span className={s.emptyValue()}>—</span>,
  labels: labelsProp,
  className,
  ref,
}: JsonViewerProps) {
  const { t, locale } = useI18n();
  const labels: JsonViewerLabels = {
    copyPath: t('jsonViewer.copyPath'),
    copyValue: t('jsonViewer.copyValue'),
    selectHint: t('jsonViewer.selectHint'),
    truncated: t('jsonViewer.truncated'),
    copyFullHint: t('jsonViewer.copyFullHint'),
    keys: (count) => t('jsonViewer.keys', { count }),
    items: (count) => t('jsonViewer.items', { count }),
    root: t('jsonViewer.root'),
    copied: t('common.copiedToClipboard'),
    copyFailed: t('common.copyFailed'),
    ...labelsProp,
  };
  const display = useMemo(() => measureJsonDisplay(data, maxDisplayChars), [data, maxDisplayChars]);
  const truncated = display?.truncated ?? false;
  const showTree = !truncated && !display?.empty;
  const [expanded, setExpanded] = useState(() =>
    showTree ? pathsToDepth(data, Math.min(defaultExpandDepth, maxDepth)) : [],
  );
  const [selected, setSelected] = useState<string[]>([]);
  const { status, copy } = useClipboard();
  const searchIndex = useMemo(
    () => (showTree ? jsonSearchIndex(data, maxDepth, locale) : []),
    [data, maxDepth, locale, showTree],
  );
  const [revealed, setRevealed] = useState({ search: '', data: undefined as unknown, locale: '' });

  // Reveal matches when the query (or data) changes; the user can still collapse them afterwards.
  if (revealed.search !== search || revealed.data !== data || revealed.locale !== locale) {
    setRevealed({ search, data, locale });
    const extra = showTree
      ? [...ancestorsFromIndex(searchIndex, search, locale)].filter((p) => !expanded.includes(p))
      : [];
    if (extra.length) setExpanded([...expanded, ...extra]);
  }

  const values = new Map<string, unknown>([['', data]]);
  const build = (value: unknown, path: string, level: number): TreeNode[] =>
    entries(value).map(([key, v]) => {
      const id = joinPath(path, key);
      values.set(id, v);
      const type = jsonType(v);
      const keyText = String(key);
      return {
        id,
        label: keyText,
        content: (
          <span className={s.row()}>
            <span className={typeof key === 'number' ? jsonTypeClass.punctuation : jsonTypeClass.key}>
              {highlight(keyText, search, locale)}
            </span>
            <span className={jsonTypeClass.punctuation}>: </span>
            {preview(v, labels, search, locale)}
          </span>
        ),
        children: (type === 'object' || type === 'array') && level < maxDepth ? build(v, id, level + 1) : undefined,
      };
    });
  const rootType = jsonType(data);
  const nodes: TreeNode[] = !showTree
    ? []
    : rootType === 'object' || rootType === 'array'
      ? build(data, '', 1)
      : [
          {
            id: '',
            label: labels.root,
            content: <span className={s.row()}>{preview(data, labels, search, locale)}</span>,
          },
        ];

  const current = selected[0];

  return (
    <div ref={ref} className={cn(s.root(), className)}>
      {toolbar && (
        <div className={s.toolbar()}>
          <span className={s.path()}>
            {truncated ? (
              labels.copyFullHint
            ) : current !== undefined ? (
              <span className={s.pathValue()}>{current || labels.root}</span>
            ) : (
              labels.selectHint
            )}
          </span>
          <button
            type="button"
            disabled={!showTree || current === undefined}
            onClick={() => current !== undefined && copy(current)}
            className={s.action()}
          >
            <Copy size={13} aria-hidden />
            {labels.copyPath}
          </button>
          <button
            type="button"
            disabled={!truncated && (!showTree || current === undefined)}
            onClick={() =>
              truncated && display
                ? copy(display.text)
                : current !== undefined && copy(JSON.stringify(values.get(current), null, 2) ?? 'null')
            }
            className={s.action()}
          >
            {status === 'copied' ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
            {labels.copyValue}
          </button>
          <span role="status" className="sr-only">
            {status === 'copied' ? labels.copied : status === 'failed' ? labels.copyFailed : ''}
          </span>
        </div>
      )}
      {truncated && (
        <div className={s.truncated()}>
          <Badge tone="warning">{labels.truncated}</Badge>
        </div>
      )}
      <div
        className={s.body()}
        style={maxHeight !== undefined ? { maxHeight } : undefined}
        role={truncated ? 'region' : undefined}
        aria-label={truncated ? label : undefined}
        tabIndex={truncated ? 0 : undefined}
      >
        {display?.empty ? (
          emptyContent
        ) : truncated ? (
          <pre className={s.text()}>{display?.displayText}</pre>
        ) : (
          <TreeList
            aria-label={label}
            nodes={nodes}
            expanded={expanded}
            onExpandedChange={setExpanded}
            selected={selected}
            onSelectedChange={setSelected}
            indent={14}
          />
        )}
      </div>
    </div>
  );
}
