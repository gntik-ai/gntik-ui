import { Button, useI18n } from '@gntik-ai/ui';
import { useId, useRef, useLayoutEffect, useCallback, type KeyboardEvent } from 'react';
import { CellEditor } from './cell-editors';
import type { DataTableColumn } from './data-table-utils';
import type { DataTableLabels } from './labels';
import type { RowEdits } from './use-row-edits';

export function focusRowAction(table: HTMLTableElement | null, id: string) {
  const row = [...(table?.querySelectorAll<HTMLElement>('[data-row-id]') ?? [])].find(
    (element) => element.dataset.rowId === id,
  );
  row?.querySelector<HTMLElement>('[data-row-edit],button[aria-haspopup="menu"]')?.focus();
}
export function RowEditor<T>({
  row,
  rowLabel,
  column,
  edits,
  autoFocus,
  labels,
}: {
  row: T;
  rowLabel: string;
  column: DataTableColumn<T>;
  edits: RowEdits<T>;
  autoFocus: boolean;
  labels?: Partial<DataTableLabels>;
}) {
  const focusOnMount = useCallback(
    (element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement | null) => {
      if (autoFocus) element?.focus();
    },
    [autoFocus],
  );
  const errorId = useId();
  const draft = edits.get(row);
  const error = draft.fieldErrors[column.id];
  const editor = column.editor;
  const { t } = useI18n();
  const inputProps = {
    'aria-label':
      labels?.editLabel?.(column.header, rowLabel) ?? t('table.editLabel', { column: column.header, row: rowLabel }),
    'aria-invalid': !!error || undefined,
    'aria-describedby': error ? errorId : undefined,
    autoFocus,
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (
      event.defaultPrevented ||
      (event.key === 'Enter' && event.shiftKey && event.target instanceof HTMLTextAreaElement)
    )
      return;
    if (event.key === 'Escape') {
      event.preventDefault();
      edits.cancel(row);
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      void edits.save(row);
    }
  };
  return (
    <div
      data-cell-editor=""
      onKeyDown={
        column.renderEditor
          ? (event) => {
              if (!(event.target instanceof HTMLButtonElement)) onKeyDown(event);
            }
          : undefined
      }
    >
      {column.renderEditor ? (
        column.renderEditor({
          row,
          value: draft.values[column.id] ?? null,
          setValue: (value) => edits.setValue(row, column.id, value),
          commit: () => {},
          cancel: () => edits.cancel(row),
          error,
          inputProps,
        })
      ) : (
        <CellEditor
          editor={editor ?? { type: 'text' }}
          value={draft.values[column.id] ?? null}
          setValue={(value) => edits.setValue(row, column.id, value)}
          inputProps={inputProps}
          focusRef={focusOnMount}
          pending={draft.pending}
          onKeyDown={onKeyDown}
        />
      )}

      {error && (
        <p id={errorId} role="alert" className="text-destructive-text">
          {error}
        </p>
      )}
    </div>
  );
}
export function RowEditActions<T>({
  row,
  rowId,
  label,
  edits,
  labels,
}: {
  row: T;
  rowId: string;
  label: string;
  edits: RowEdits<T>;
  labels?: Partial<DataTableLabels>;
}) {
  const { t } = useI18n();
  const container = useRef<HTMLSpanElement>(null);
  const editing = edits.ids.includes(rowId);
  const previousEditing = useRef(editing);
  useLayoutEffect(() => {
    if (previousEditing.current && !editing) focusRowAction(container.current?.closest('table') ?? null, rowId);
    previousEditing.current = editing;
  }, [editing, rowId]);
  return (
    <span ref={container} className="inline-flex gap-1">
      {editing ? (
        <>
          <Button
            size="sm"
            loading={edits.get(row).pending}
            onClick={() => {
              void edits.save(row);
            }}
          >
            {labels?.saveRow ?? t('common.save')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              edits.cancel(row);
            }}
          >
            {labels?.cancel ?? t('common.cancel')}
          </Button>
        </>
      ) : (
        <Button data-row-edit="" size="sm" variant="ghost" onClick={() => edits.start(row)}>
          {labels?.editRow?.(label) ?? t('table.editRow', { label })}
        </Button>
      )}
      {edits.get(row).error && (
        <span role="alert" className="text-destructive-text">
          {edits.get(row).error}
        </span>
      )}
    </span>
  );
}
