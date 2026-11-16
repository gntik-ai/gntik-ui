import { cn, useInlineEdit, useI18n } from '@gntik-ai/ui';
import { useCallback, useId, useRef, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react';
import type { DataTableLabels } from './labels';
import { startValue, useEditorValue } from './edit-values';
import { CellEditor } from './cell-editors';
import type { DataTableEditValue } from './row-edit-types';
import type { DataTableColumn } from './data-table-utils';

/** One committed cell edit, as `onCellEdit` receives it. */
export interface DataTableCellEdit<T> {
  row: T;
  rowId: string;
  columnId: string;
  /** Parsed value: a string (text, select) or a number / null (number editor). */
  value: DataTableEditValue;
  /** Value the editor started from. */
  previous: DataTableEditValue;
}

/**
 * Result of `onCellEdit`: nothing or `true` accepts the edit (the parent updates `rows`); a string
 * rejects it and is shown inline as the error; `false` rejects with a generic message. A thrown
 * error (or a rejected promise) rejects with its message.
 */
export type DataTableCellEditResult = void | boolean | string;

export type DataTableCellEditHandler<T> = (
  edit: DataTableCellEdit<T>,
) => DataTableCellEditResult | Promise<DataTableCellEditResult>;

export interface EditableCellProps<T> {
  labels?: Partial<DataTableLabels>;
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
export function EditableCell<T>({
  row,
  rowId,
  rowLabel,
  column,
  onCellEdit,
  hintId,
  children,
  labels,
}: EditableCellProps<T>) {
  const { t } = useI18n();
  const errorId = useId();
  const editor = column.editor ?? { type: 'text' as const };
  const enhanced =
    column.validate != null || column.renderEditor != null || !['text', 'number', 'select'].includes(editor.type);
  const custom = useEditorValue();
  const trigger = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLElement | null>(null);

  const focusOnMount = useCallback(
    (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement | null) => {
      field.current = el;
      if (!el) return;
      el.focus();
      if (el instanceof HTMLInputElement) el.select();
    },
    [],
  );

  const parse = (draft: string): { ok: true; value: string | number | null } | { ok: false; message: string } => {
    const value = column.renderEditor ? custom.getValue() : draft;
    if (editor.type !== 'number') return { ok: true, value };
    const text = String(value ?? '').trim();
    if (text === '') return { ok: true, value: null };
    const n = Number(text);
    if (!Number.isFinite(n))
      return { ok: false, message: labels?.enterNumber ?? (enhanced ? t('table.enterNumber') : 'Enter a number.') };
    if (editor.min != null && n < editor.min)
      return {
        ok: false,
        message:
          labels?.minimumValue?.(editor.min) ??
          (enhanced ? t('table.minimumValue', { min: editor.min }) : `Enter ${editor.min} or more.`),
      };
    if (editor.max != null && n > editor.max)
      return {
        ok: false,
        message:
          labels?.maximumValue?.(editor.max) ??
          (enhanced ? t('table.maximumValue', { max: editor.max }) : `Enter ${editor.max} or less.`),
      };
    return { ok: true, value: n };
  };

  const { editing, draft, setDraft, error, pending, busy, start, cancel, commit } = useInlineEdit({
    value: startValue(row, column),
    parse,
    validate: (value) => column.validate?.(value, row),
    genericError: labels?.editError ?? (enhanced ? t('table.editSaveError') : 'The change could not be saved.'),
    focusEditor: (after) => {
      if (after !== null) field.current?.focus();
    },
    isEqual: (next, previous) =>
      column.renderEditor
        ? Object.is(next, previous)
        : next === previous || (previous != null && String(previous) === String(next) && editor.type !== 'number'),
    onSave: (value, previous) => onCellEdit({ row, rowId, columnId: column.id, value, previous }),
    onMove: (dir) => {
      if (dir === 'self') trigger.current?.focus();
      else focusSibling(trigger.current, dir);
    },
  });

  const startEditor = () => {
    if (column.renderEditor) {
      const value = startValue(row, column);
      custom.setValue(value);
    }
    start();
  };
  const onEditorKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.defaultPrevented || (e.key === 'Enter' && e.shiftKey && e.target instanceof HTMLTextAreaElement)) return;
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
  const onEditorBlur = (e: FocusEvent<HTMLElement>) => {
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
        onClick={startEditor}
        onKeyDown={(e) => {
          if (e.key === 'F2') {
            e.preventDefault();
            startEditor();
          }
        }}
        className={cn(
          '-mx-1.5 -my-1 block max-w-[calc(100%+0.75rem)] min-w-[calc(100%+0.75rem)] cursor-text truncate rounded-sm px-1.5 py-1 text-inherit',
          'hover:bg-secondary/60 focus-ring-inset',
          column.align === 'right' || column.variant === 'numeric' ? 'text-end' : 'text-start',
        )}
      >
        {children}
      </button>
    );
  }

  const label =
    labels?.editLabel?.(column.header, rowLabel) ??
    (enhanced ? t('table.editLabel', { column: column.header, row: rowLabel }) : `${column.header} for ${rowLabel}`);
  const common = {
    'aria-label': label,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    'aria-busy': pending || undefined,
    // Not `disabled`: the field keeps focus while an async onCellEdit runs.
    'aria-disabled': pending || undefined,
  };
  return (
    <div className="-my-1 min-w-0" data-cell-editor="" onKeyDown={column.renderEditor ? onEditorKeyDown : undefined}>
      {column.renderEditor ? (
        column.renderEditor({
          row,
          value: custom.value,
          setValue: (value) => {
            if (!pending) {
              custom.setValue(value);
              setDraft(value == null ? '' : String(value));
            }
          },
          commit: () => {
            void commit('self');
          },
          cancel: () => cancel(),
          error: error ?? undefined,
          inputProps: { ...common, autoFocus: true },
        })
      ) : (
        <CellEditor
          editor={editor}
          value={draft}
          setValue={(value) => setDraft(value == null ? '' : String(value))}
          inputProps={{ ...common, autoFocus: false }}
          pending={pending}
          focusRef={focusOnMount}
          onKeyDown={onEditorKeyDown}
          onBlur={onEditorBlur}
        />
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1 rounded-sm border border-border bg-popover px-1.5 py-1 text-start text-[11.5px] font-medium whitespace-normal text-destructive-text"
        >
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
