import { cn, Input } from '@gntik-ai/ui';
import { useCallback, useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react';
import type { DataTableColumn } from './data-table-utils';

/** One committed cell edit, as `onCellEdit` receives it. */
export interface DataTableCellEdit<T> {
  row: T;
  rowId: string;
  columnId: string;
  /** Parsed value: a string (text, select) or a number / null (number editor). */
  value: string | number | null;
  /** Value the editor started from. */
  previous: string | number | null;
}

/**
 * Result of `onCellEdit`: nothing or `true` accepts the edit (the parent updates `rows`); a string
 * rejects it and is shown inline as the error; `false` rejects with a generic message. A thrown
 * error (or a rejected promise) rejects with its message.
 */
export type DataTableCellEditResult = void | boolean | string;

export type DataTableCellEditHandler<T> = (edit: DataTableCellEdit<T>) => DataTableCellEditResult | Promise<DataTableCellEditResult>;

export interface EditableCellProps<T> {
  row: T;
  rowId: string;
  rowLabel: string;
  column: DataTableColumn<T>;
  onCellEdit: DataTableCellEditHandler<T>;
  /** Id of the shared "Press Enter or F2 to edit" hint. */
  hintId: string;
  /** The cell's display content. */
  children: ReactNode;
}

const GENERIC_ERROR = 'The change could not be saved.';
type Move = 'self' | 'next' | 'prev' | null;

/** Starting value of the editor for a row. */
function startValue<T>(row: T, column: DataTableColumn<T>): string | number | null {
  const raw = column.editValue ? column.editValue(row) : column.accessor?.(row);
  if (raw == null) return null;
  if (typeof raw === 'number' || typeof raw === 'string') return raw;
  if (raw instanceof Date) return raw.toISOString();
  return String(raw);
}

/** Focuses the next or previous editable cell of the table (Tab / Shift+Tab while editing). */
function focusSibling(from: HTMLElement | null, dir: 'next' | 'prev') {
  const table = from?.closest('table');
  if (!table || !from) return;
  const all = [...table.querySelectorAll<HTMLElement>('[data-cell-edit-trigger]')];
  const i = all.indexOf(from);
  const target = all[dir === 'next' ? i + 1 : i - 1];
  (target ?? from).focus();
}

/**
 * An editable body cell's content. At rest it is a button showing the value (Enter, F2 or a click
 * edits); while editing, an input or a select: Enter or Tab commits, Escape cancels. `onCellEdit`
 * can reject the value with a message, shown inline under the editor.
 */
export function EditableCell<T>({ row, rowId, rowLabel, column, onCellEdit, hintId, children }: EditableCellProps<T>) {
  const errorId = useId();
  const editor = column.editor ?? { type: 'text' as const };
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement | HTMLSelectElement | null>(null);
  const move = useRef<Move>(null);
  const busy = useRef(false);

  useEffect(() => {
    if (editing || !move.current) return;
    const dir = move.current;
    move.current = null;
    if (dir === 'self') trigger.current?.focus();
    else focusSibling(trigger.current, dir);
  }, [editing]);

  const focusOnMount = useCallback((el: HTMLInputElement | HTMLSelectElement | null) => {
    field.current = el;
    if (!el) return;
    el.focus();
    if (el instanceof HTMLInputElement) el.select();
  }, []);

  const start = () => {
    const v = startValue(row, column);
    setDraft(v == null ? '' : String(v));
    setError(null);
    setEditing(true);
  };
  const cancel = () => {
    move.current = 'self';
    setError(null);
    setEditing(false);
  };

  const parse = (): { ok: true; value: string | number | null } | { ok: false; message: string } => {
    if (editor.type !== 'number') return { ok: true, value: draft };
    const text = draft.trim();
    if (text === '') return { ok: true, value: null };
    const n = Number(text);
    if (!Number.isFinite(n)) return { ok: false, message: 'Enter a number.' };
    if (editor.min != null && n < editor.min) return { ok: false, message: `Enter ${editor.min} or more.` };
    if (editor.max != null && n > editor.max) return { ok: false, message: `Enter ${editor.max} or less.` };
    return { ok: true, value: n };
  };

  const commit = async (after: Move) => {
    if (busy.current) return;
    const parsed = parse();
    if (!parsed.ok) {
      setError(parsed.message);
      field.current?.focus();
      return;
    }
    const previous = startValue(row, column);
    if (parsed.value === previous || (previous != null && String(previous) === String(parsed.value) && editor.type !== 'number')) {
      move.current = after;
      setError(null);
      setEditing(false);
      return;
    }
    busy.current = true;
    setPending(true);
    let result: DataTableCellEditResult;
    try {
      result = await onCellEdit({ row, rowId, columnId: column.id, value: parsed.value, previous });
    } catch (err) {
      result = err instanceof Error && err.message ? err.message : GENERIC_ERROR;
    }
    busy.current = false;
    setPending(false);
    if (result === false) result = GENERIC_ERROR;
    if (typeof result === 'string') {
      setError(result);
      if (after) field.current?.focus();
      return;
    }
    move.current = after;
    setError(null);
    setEditing(false);
  };

  const onEditorKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancel();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      void commit('self');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      void commit(e.shiftKey ? 'prev' : 'next');
    }
  };
  const onEditorBlur = (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    // Focus left the editor (a click elsewhere): commit in place, without moving focus.
    if (!editing || busy.current || e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    void commit(null);
  };

  if (!editing) {
    return (
      <button
        ref={trigger}
        type="button"
        data-cell-edit-trigger=""
        aria-describedby={hintId}
        onClick={start}
        onKeyDown={(e) => {
          if (e.key === 'F2') {
            e.preventDefault();
            start();
          }
        }}
        className={cn(
          '-mx-1.5 -my-1 block max-w-[calc(100%+0.75rem)] min-w-[calc(100%+0.75rem)] cursor-text truncate rounded-sm px-1.5 py-1 text-inherit',
          'hover:bg-secondary/60 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus-ring',
          column.align === 'right' || column.variant === 'numeric' ? 'text-end' : 'text-start',
        )}
      >
        {children}
      </button>
    );
  }

  const label = `${column.header} for ${rowLabel}`;
  const common = {
    'aria-label': label,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    'aria-busy': pending || undefined,
    // Not `disabled`: the field keeps focus while an async onCellEdit runs.
    'aria-disabled': pending || undefined,
    onKeyDown: onEditorKeyDown,
    onBlur: onEditorBlur,
  };
  return (
    <div className="-my-1 min-w-0" data-cell-editor="">
      {editor.type === 'select' ? (
        <select
          ref={focusOnMount}
          value={draft}
          onChange={(e) => {
            if (!pending) setDraft(e.target.value);
          }}
          className={cn(
            'h-8 w-full rounded-md border border-input bg-background px-2 text-[13px] text-foreground',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
            error && 'border-destructive',
          )}
          {...common}
        >
          {editor.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          ref={focusOnMount}
          type={editor.type === 'number' ? 'number' : 'text'}
          inputMode={editor.type === 'number' ? 'decimal' : undefined}
          min={editor.type === 'number' ? editor.min : undefined}
          max={editor.type === 'number' ? editor.max : undefined}
          step={editor.type === 'number' ? editor.step : undefined}
          placeholder={editor.type === 'text' ? editor.placeholder : undefined}
          value={draft}
          readOnly={pending}
          onChange={(e) => setDraft(e.target.value)}
          invalid={error != null}
          className="w-full"
          {...common}
        />
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-start text-[11.5px] font-medium whitespace-normal text-destructive-text">
          {error}
        </p>
      )}
    </div>
  );
}

/** Whether a column is editable for a row. */
export function isCellEditable<T>(column: DataTableColumn<T>, row: T): boolean {
  return typeof column.editable === 'function' ? column.editable(row) : column.editable === true;
}
