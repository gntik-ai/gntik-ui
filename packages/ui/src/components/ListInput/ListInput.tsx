import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useId, useLayoutEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '../../utils/cn';
import { Button, IconButton } from '../Button';
import { Input } from '../Input';
import { parseListInputPairs, type ListInputPair } from './list-input-parse';
import { listInputVariants } from './list-input.variants';

export interface ListInputRow extends ListInputPair {
  /** Stable identity for keys and focus; create rows with `createListInputRow`. */
  id: string;
}

export interface ListInputRowErrors {
  key?: string | null;
  value?: string | null;
}

export interface ListInputLabels {
  key: string;
  value: string;
  add: string;
  remove: (n: number) => string;
  moveUp: (n: number) => string;
  moveDown: (n: number) => string;
  reveal: (n: number) => string;
  duplicate: string;
  added: (count: number) => string;
  removed: (n: number) => string;
  moved: (n: number) => string;
  limit: (max: number) => string;
  pasteHint: string;
}

const defaultLabels: ListInputLabels = {
  key: 'Key',
  value: 'Value',
  add: 'Add row',
  remove: (n) => `Remove row ${n}`,
  moveUp: (n) => `Move row ${n} up`,
  moveDown: (n) => `Move row ${n} down`,
  reveal: (n) => `Show value ${n}`,
  duplicate: 'Duplicate key',
  added: (c) => (c === 1 ? 'Added a row.' : `Added ${c} rows.`),
  removed: (n) => `Removed row ${n}.`,
  moved: (n) => `Moved to position ${n}.`,
  limit: (m) => `Limit of ${m} rows reached.`,
  pasteHint: 'Paste KEY=value lines to add several rows.',
};

let seq = 0;
/** A row with a fresh id. */
export const createListInputRow = (key = '', value = ''): ListInputRow => ({ id: `row-${++seq}`, key, value });

export interface ListInputProps {
  value?: ListInputRow[];
  /** Initial rows; ids are added when missing. */
  defaultValue?: Array<ListInputPair & { id?: string }>;
  onValueChange?: (rows: ListInputRow[]) => void;
  /** Accessible name of the row list (e.g. "Environment variables"). */
  label: string;
  /** Per-row errors; return null when the row is valid. Empty rows are skipped. */
  validate?: (row: ListInputRow, index: number, rows: readonly ListInputRow[]) => ListInputRowErrors | null | undefined;
  /** Flag repeated keys (case-sensitive). */
  uniqueKeys?: boolean;
  /** Mask values (all rows, or the rows the function picks) with a per-row reveal toggle. */
  secret?: boolean | ((row: ListInputRow) => boolean);
  /** Show move up/down buttons (Alt+Arrow keys work either way). */
  reorderable?: boolean;
  maxRows?: number;
  /** Separator for pasted lines. */
  separator?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  disabled?: boolean;
  labels?: Partial<ListInputLabels>;
  className?: string;
}

type Field = 'key' | 'value';

/**
 * Repeatable key/value rows (env vars, headers, labels): add, remove and reorder with buttons
 * or Alt+Arrow keys, Enter on the last value adds a row, pasted `KEY=value` lines bulk-add,
 * per-row validation (with duplicate-key detection) and optional masked values.
 */
export function ListInput({
  value,
  defaultValue,
  onValueChange,
  label,
  validate,
  uniqueKeys = true,
  secret = false,
  reorderable = true,
  maxRows,
  separator = '=',
  keyPlaceholder = 'KEY',
  valuePlaceholder = 'value',
  disabled,
  labels: labelsProp,
  className,
}: ListInputProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const [inner, setInner] = useState<ListInputRow[]>(() => {
    const rows = (defaultValue ?? []).map((r) => ({ ...createListInputRow(r.key, r.value), ...(r.id ? { id: r.id } : {}) }));
    return rows.length ? rows : [createListInputRow()];
  });
  const rows = value ?? inner;
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [announcement, setAnnouncement] = useState('');
  const pendingFocus = useRef<{ id: string; field: Field | 'add' } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const uid = useId();
  const s = listInputVariants();
  const full = maxRows != null && rows.length >= maxRows;

  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const root = rootRef.current;
    const el =
      target.field === 'add'
        ? root?.querySelector<HTMLElement>('[data-list-input-add]')
        : root?.querySelector<HTMLElement>(`[data-row-id="${target.id}"] [data-field="${target.field}"]`);
    el?.focus();
  });

  const commit = (next: ListInputRow[], message?: string) => {
    setInner(next);
    onValueChange?.(next);
    if (message) setAnnouncement(message);
  };

  const keyCounts = new Map<string, number>();
  for (const r of rows) if (r.key) keyCounts.set(r.key, (keyCounts.get(r.key) ?? 0) + 1);
  const errorsFor = (row: ListInputRow, i: number): ListInputRowErrors => {
    if (!row.key && !row.value) return {};
    const custom = validate?.(row, i, rows) ?? {};
    const dup = uniqueKeys && row.key && (keyCounts.get(row.key) ?? 0) > 1 ? labels.duplicate : null;
    return { key: custom.key ?? dup, value: custom.value };
  };

  const update = (id: string, patch: Partial<ListInputPair>) => commit(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const add = (after?: number, pairs: ListInputPair[] = [{ key: '', value: '' }]) => {
    const room = maxRows == null ? pairs.length : Math.max(0, maxRows - rows.length);
    if (room === 0) {
      setAnnouncement(labels.limit(maxRows ?? 0));
      return;
    }
    const created = pairs.slice(0, room).map((p) => createListInputRow(p.key, p.value));
    const at = after == null ? rows.length : after + 1;
    commit([...rows.slice(0, at), ...created, ...rows.slice(at)], labels.added(created.length) + (created.length < pairs.length ? ` ${labels.limit(maxRows ?? 0)}` : ''));
    const first = created[0];
    if (first) pendingFocus.current = { id: first.id, field: pairs.length > 1 ? 'value' : 'key' };
  };

  const remove = (i: number) => {
    const next = rows.filter((_, j) => j !== i);
    const kept = next.length ? next : [createListInputRow()];
    commit(kept, labels.removed(i + 1));
    const focusRow = kept[Math.min(i, kept.length - 1)];
    pendingFocus.current = next.length && focusRow ? { id: focusRow.id, field: 'key' } : { id: '', field: 'add' };
  };

  const move = (i: number, delta: number, field: Field) => {
    const j = i + delta;
    const row = rows[i];
    const other = rows[j];
    if (!row || !other) return;
    const next = [...rows];
    next[i] = other;
    next[j] = row;
    commit(next, labels.moved(j + 1));
    pendingFocus.current = { id: row.id, field };
  };

  const onFieldKeyDown = (e: KeyboardEvent<HTMLInputElement>, i: number, field: Field) => {
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      move(i, e.key === 'ArrowUp' ? -1 : 1, field);
    } else if (e.key === 'Enter' && field === 'value' && i === rows.length - 1) {
      e.preventDefault();
      add();
    } else if (e.key === 'Enter' && field === 'key') {
      e.preventDefault();
      e.currentTarget.closest('li')?.querySelector<HTMLElement>('[data-field="value"]')?.focus();
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>, i: number) => {
    const text = e.clipboardData.getData('text');
    if (!text.includes('\n') && !text.includes(separator)) return;
    const pairs = parseListInputPairs(text, separator);
    if (!pairs.length) return;
    e.preventDefault();
    const row = rows[i];
    if (row && !row.key && !row.value) {
      const [firstPair, ...rest] = pairs;
      const filled = rows.map((r, j) => (j === i && firstPair ? { ...r, ...firstPair } : r));
      const room = maxRows == null ? rest.length : Math.max(0, maxRows - filled.length);
      const created = rest.slice(0, room).map((p) => createListInputRow(p.key, p.value));
      commit([...filled.slice(0, i + 1), ...created, ...filled.slice(i + 1)], labels.added(created.length + 1));
      const last = created[created.length - 1];
      pendingFocus.current = { id: last ? last.id : row.id, field: 'value' };
    } else add(i, pairs);
  };

  return (
    <div ref={rootRef} className={cn(s.root(), className)}>
      <div aria-hidden className={s.head()}>
        <span>{labels.key}</span>
        <span>{labels.value}</span>
        <span />
      </div>
      <ul aria-label={label} className={s.list()}>
        {rows.map((row, i) => {
          const n = i + 1;
          const errs = errorsFor(row, i);
          const masked = (typeof secret === 'function' ? secret(row) : secret) && !revealed[row.id];
          const isSecret = typeof secret === 'function' ? secret(row) : secret;
          const keyErrId = `${uid}-${row.id}-kerr`;
          const valErrId = `${uid}-${row.id}-verr`;
          return (
            <li key={row.id} data-row-id={row.id} className={s.row()}>
              <div className={s.fields()}>
                <Input
                  size="sm"
                  data-field="key"
                  aria-label={`${labels.key} ${n}`}
                  placeholder={keyPlaceholder}
                  value={row.key}
                  disabled={disabled}
                  invalid={!!errs.key}
                  aria-describedby={errs.key ? keyErrId : undefined}
                  autoComplete="off"
                  spellCheck={false}
                  inputClassName={s.keyInput()}
                  onValueChange={(v: string) => update(row.id, { key: v })}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => onFieldKeyDown(e, i, 'key')}
                  onPaste={(e: ClipboardEvent<HTMLInputElement>) => onPaste(e, i)}
                />
                <Input
                  size="sm"
                  data-field="value"
                  type={masked ? 'password' : 'text'}
                  aria-label={`${labels.value} ${n}`}
                  placeholder={valuePlaceholder}
                  value={row.value}
                  disabled={disabled}
                  invalid={!!errs.value}
                  aria-describedby={errs.value ? valErrId : undefined}
                  autoComplete="off"
                  spellCheck={false}
                  inputClassName={s.valueInput()}
                  onValueChange={(v: string) => update(row.id, { value: v })}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => onFieldKeyDown(e, i, 'value')}
                  trailingAddon={
                    isSecret ? (
                      <button
                        type="button"
                        aria-label={labels.reveal(n)}
                        aria-pressed={!masked}
                        disabled={disabled}
                        onClick={() => setRevealed((r) => ({ ...r, [row.id]: !r[row.id] }))}
                        className="grid size-6 place-items-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-focus-ring"
                      >
                        {masked ? <Eye size={13} aria-hidden /> : <EyeOff size={13} aria-hidden />}
                      </button>
                    ) : undefined
                  }
                />
                <div className={s.actions()}>
                  {reorderable && (
                    <>
                      <IconButton size="sm" icon={ArrowUp} label={labels.moveUp(n)} disabled={disabled || i === 0} onClick={() => move(i, -1, 'key')} />
                      <IconButton size="sm" icon={ArrowDown} label={labels.moveDown(n)} disabled={disabled || i === rows.length - 1} onClick={() => move(i, 1, 'key')} />
                    </>
                  )}
                  <IconButton size="sm" icon={Trash2} label={labels.remove(n)} disabled={disabled} onClick={() => remove(i)} />
                </div>
              </div>
              {errs.key && (
                <p id={keyErrId} className={s.error()}>
                  {errs.key}
                </p>
              )}
              {errs.value && (
                <p id={valErrId} className={s.error()}>
                  {errs.value}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <div className={s.footer()}>
        <Button size="sm" variant="secondary" icon={Plus} data-list-input-add="" disabled={disabled || full} onClick={() => add()}>
          {labels.add}
        </Button>
        <span className={s.hint()}>{full ? labels.limit(maxRows ?? 0) : labels.pasteHint}</span>
      </div>
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
