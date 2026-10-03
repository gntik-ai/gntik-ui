import { Check, Copy } from 'lucide-react';
import { useEffect, useState, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { TreeList } from '../TreeList/TreeList';
import type { TreeNode } from '../TreeList/tree-model';
import { entries, joinPath, jsonType, matchAncestors, pathsToDepth } from './json-model';
import { jsonTypeClass, jsonViewerVariants } from './json-viewer.variants';

export interface JsonViewerLabels {
  copyPath: string;
  copyValue: string;
  copied: string;
  copyFailed: string;
  /** Toolbar hint before a node is selected. */
  selectHint: string;
  /** Summary of an object / array. */
  keys: (n: number) => string;
  items: (n: number) => string;
  /** Name of the root when the path is empty. */
  root: string;
}

const DEFAULT_LABELS: JsonViewerLabels = {
  copyPath: 'Copy path',
  copyValue: 'Copy value',
  copied: 'Copied to clipboard',
  copyFailed: 'Copy failed',
  selectHint: 'Select a node to copy its path or value',
  keys: (n) => `${n} ${n === 1 ? 'key' : 'keys'}`,
  items: (n) => `${n} ${n === 1 ? 'item' : 'items'}`,
  root: '(root)',
};

export interface JsonViewerProps {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Any JSON-serialisable value. */
  data: unknown;
  /** Accessible name of the tree. */
  label?: string;
  /** Levels expanded on first render (default 1). */
  defaultExpandDepth?: number;
  /** Deeper containers render as a summary and do not expand. */
  maxDepth?: number;
  /** Highlights matching keys and values and expands their ancestors. */
  search?: string;
  /** Shows the path / copy toolbar (default true). */
  toolbar?: boolean;
  /** Max height of the scrollable body (px or CSS length). */
  maxHeight?: number | string;
  /** Built-in strings (English defaults). */
  labels?: Partial<JsonViewerLabels>;
}

const s = jsonViewerVariants();

function highlight(text: string, query: string): ReactNode {
  const q = query.trim().toLowerCase();
  if (!q) return text;
  const out: ReactNode[] = [];
  let from = 0;
  let at = text.toLowerCase().indexOf(q);
  while (at !== -1) {
    if (at > from) out.push(text.slice(from, at));
    out.push(
      <mark key={at} className={s.mark()}>
        {text.slice(at, at + q.length)}
      </mark>,
    );
    from = at + q.length;
    at = text.toLowerCase().indexOf(q, from);
  }
  if (from < text.length) out.push(text.slice(from));
  return out;
}

function preview(value: unknown, labels: JsonViewerLabels, query: string): ReactNode {
  const type = jsonType(value);
  if (type === 'object' || type === 'array') {
    const n = entries(value).length;
    return <span className={jsonTypeClass.summary}>{type === 'array' ? `[ ] ${labels.items(n)}` : `{ } ${labels.keys(n)}`}</span>;
  }
  const text = type === 'string' ? JSON.stringify(value) : String(value ?? null);
  return <span className={jsonTypeClass[type]}>{highlight(text, query)}</span>;
}

/**
 * Collapsible JSON inspector on TreeList (tree keyboard pattern): objects and arrays expand,
 * values are coloured by type with contrast-safe text tokens, `search` highlights and reveals
 * matches, and the toolbar copies the selected node's path or value.
 */
export function JsonViewer({
  data,
  label = 'JSON',
  defaultExpandDepth = 1,
  maxDepth = Infinity,
  search = '',
  toolbar = true,
  maxHeight,
  labels: labelsProp,
  className,
  ref,
}: JsonViewerProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const [expanded, setExpanded] = useState(() => pathsToDepth(data, Math.min(defaultExpandDepth, maxDepth)));
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [revealed, setRevealed] = useState({ search: '', data: undefined as unknown });

  // Reveal matches when the query (or data) changes; the user can still collapse them afterwards.
  if (revealed.search !== search || revealed.data !== data) {
    setRevealed({ search, data });
    const extra = [...matchAncestors(data, search, maxDepth)].filter((p) => !expanded.includes(p));
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
            <span className={typeof key === 'number' ? jsonTypeClass.punctuation : jsonTypeClass.key}>{highlight(keyText, search)}</span>
            <span className={jsonTypeClass.punctuation}>: </span>
            {preview(v, labels, search)}
          </span>
        ),
        children: (type === 'object' || type === 'array') && level < maxDepth ? build(v, id, level + 1) : undefined,
      };
    });
  const rootType = jsonType(data);
  const nodes: TreeNode[] =
    rootType === 'object' || rootType === 'array'
      ? build(data, '', 1)
      : [{ id: '', label: labels.root, content: <span className={s.row()}>{preview(data, labels, search)}</span> }];

  useEffect(() => {
    if (status === 'idle') return;
    const id = window.setTimeout(() => setStatus('idle'), 2000);
    return () => window.clearTimeout(id);
  }, [status]);

  const current = selected[0];
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  };

  return (
    <div ref={ref} className={cn(s.root(), className)}>
      {toolbar && (
        <div className={s.toolbar()}>
          <span className={s.path()}>{current !== undefined ? <span className={s.pathValue()}>{current || labels.root}</span> : labels.selectHint}</span>
          <button type="button" disabled={current === undefined} onClick={() => current !== undefined && copy(current)} className={s.action()}>
            <Copy size={13} aria-hidden />
            {labels.copyPath}
          </button>
          <button
            type="button"
            disabled={current === undefined}
            onClick={() => current !== undefined && copy(JSON.stringify(values.get(current), null, 2) ?? 'null')}
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
      <div className={s.body()} style={maxHeight !== undefined ? { maxHeight } : undefined}>
        <TreeList aria-label={label} nodes={nodes} expanded={expanded} onExpandedChange={setExpanded} selected={selected} onSelectedChange={setSelected} indent={14} />
      </div>
    </div>
  );
}
