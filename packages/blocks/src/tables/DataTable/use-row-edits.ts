import { useId, useLayoutEffect, useRef, useState } from 'react';
import { useI18n } from '@gntik-ai/ui';
import type { DataTableProps } from './data-table-props';
import type { DataTableColumn } from './data-table-utils';
import { isCellEditable } from './editable-cell';
import { startValue } from './edit-values';
import type { DataTableRowEdit, DataTableRowSaveResult } from './row-edit-types';
import { useControllable } from './use-table-views';

export interface RowDraft<T> extends DataTableRowEdit<T> {
  fieldErrors: Record<string, string>;
  error?: string;
  pending?: boolean;
}
export function useRowEdits<T>(
  options: Pick<
    DataTableProps<T>,
    | 'editingRowIds'
    | 'defaultEditingRowIds'
    | 'onEditingRowIdsChange'
    | 'onRowSave'
    | 'onRowsSave'
    | 'labels'
    | 'onRowAdd'
    | 'newRowDefaults'
  > & {
    columns: ReadonlyArray<DataTableColumn<T>>;
    getRowId: (row: T) => string;
    genericError: string;
  },
) {
  const { t } = useI18n();
  const [ids, setIds] = useControllable<readonly string[]>(
    options.editingRowIds,
    () => options.defaultEditingRowIds ?? [],
    (next) => options.onEditingRowIdsChange?.([...next]),
  );
  const [drafts, setDrafts] = useState<Record<string, RowDraft<T>>>({});
  const newId = useId();
  const [newRow, setNewRow] = useState<T | null>(null);
  const [previousIds, setPreviousIds] = useState(ids);
  if (previousIds !== ids) {
    setPreviousIds(ids);
    const removed = previousIds.filter((id) => !ids.includes(id));
    if (removed.length)
      setDrafts((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !removed.includes(id))));
  }
  const idOf = (row: T) => (row === newRow ? newId : options.getRowId(row));
  const [savingAll, setSavingAll] = useState(false);
  const sessions = useRef(new Map<string, symbol>());
  const bulkBusy = useRef(false);
  const latestIds = useRef(ids);
  useLayoutEffect(() => {
    for (const id of latestIds.current) if (!ids.includes(id)) sessions.current.delete(id);
    latestIds.current = ids;
  });
  const create = (row: T): RowDraft<T> => {
    const values = Object.fromEntries(
      options.columns
        .filter((column) => isCellEditable(column, row))
        .map((column) => [column.id, startValue(row, column)]),
    );
    return { row, rowId: options.getRowId(row), values, previous: { ...values }, fieldErrors: {} };
  };
  const get = (row: T) => (Object.hasOwn(drafts, idOf(row)) ? drafts[idOf(row)]! : create(row));
  const patch = (draft: RowDraft<T>) => setDrafts((current) => ({ ...current, [draft.rowId]: draft }));
  const start = (row: T) => {
    const id = options.getRowId(row);
    patch(create(row));
    const next = [...new Set([...latestIds.current, id])];
    latestIds.current = next;
    setIds(next);
  };
  const finish = (finished: readonly string[]) => {
    for (const id of finished) sessions.current.delete(id);
    if (finished.includes(newId)) {
      setNewRow(null);
    }
    setDrafts((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !finished.includes(id))));
    if (finished.some((id) => latestIds.current.includes(id))) {
      // Two saves can settle before React renders either update.
      const remaining = latestIds.current.filter((id) => !finished.includes(id));
      latestIds.current = remaining;
      setIds(remaining);
    }
  };
  const setValue = (row: T, column: string, value: RowDraft<T>['values'][string]) => {
    const draft = get(row);
    if (draft.pending) return;
    const editor = options.columns.find((item) => item.id === column)?.editor;
    const nextValue = editor?.type === 'number' ? (value === '' || value === null ? null : Number(value)) : value;
    patch({
      ...draft,
      values: { ...draft.values, [column]: nextValue },
      fieldErrors: { ...draft.fieldErrors, [column]: '' },
      error: undefined,
    });
  };
  const validate = (draft: RowDraft<T>) => {
    const fieldErrors: Record<string, string> = {};
    for (const column of options.columns) {
      if (!(column.id in draft.values)) continue;
      const value = draft.values[column.id] ?? null;
      const editor = column.editor;
      let message: string | undefined;
      if (editor?.type === 'number' && value !== null) {
        const number = Number(value);
        if (!Number.isFinite(number)) message = options.labels?.enterNumber ?? t('table.enterNumber');
        else if (editor.min != null && number < editor.min)
          message = options.labels?.minimumValue?.(editor.min) ?? t('table.minimumValue', { min: editor.min });
        else if (editor.max != null && number > editor.max)
          message = options.labels?.maximumValue?.(editor.max) ?? t('table.maximumValue', { max: editor.max });
      }
      message ??= column.validate?.(value, draft.row);
      if (message !== undefined) fieldErrors[column.id] = message;
    }
    if (Object.keys(fieldErrors).length) {
      patch({ ...draft, fieldErrors });
      return false;
    }
    return true;
  };
  const reject = (draft: RowDraft<T>, result: DataTableRowSaveResult) => {
    if (result === false || typeof result === 'string' || (result && typeof result === 'object')) {
      patch({
        ...draft,
        pending: false,
        error: typeof result === 'string' ? result : result === false ? options.genericError : undefined,
        fieldErrors: typeof result === 'object' ? result.fieldErrors : {},
      });
      return true;
    }
    return false;
  };
  const editOf = ({ row, rowId, values, previous }: RowDraft<T>): DataTableRowEdit<T> => ({
    row,
    rowId,
    values,
    previous,
  });
  const save = async (row: T) => {
    const draft = get(row);
    if (sessions.current.has(draft.rowId) || !validate(draft)) return false;
    const token = Symbol();
    sessions.current.set(draft.rowId, token);
    patch({ ...draft, pending: true });
    let result;
    try {
      result =
        draft.rowId === newId
          ? await options.onRowAdd?.(draft.values)
          : options.onRowSave
            ? await options.onRowSave(editOf(draft))
            : (await options.onRowsSave?.([editOf(draft)]))?.[draft.rowId];
    } catch (error) {
      result = error instanceof Error ? error.message : options.genericError;
    }
    if (sessions.current.get(draft.rowId) !== token) return false;
    sessions.current.delete(draft.rowId);
    if (reject(draft, result)) return false;
    finish([draft.rowId]);
    return true;
  };
  const changed = Object.values(drafts).filter(
    (draft) =>
      ids.includes(draft.rowId) &&
      Object.keys(draft.values).some((key) => !Object.is(draft.values[key], draft.previous[key])),
  );
  const saveAll = async () => {
    if (bulkBusy.current || changed.some((draft) => draft.pending)) return;
    const valid = changed.map(validate).every(Boolean);
    if (!valid) return;
    bulkBusy.current = true;
    setSavingAll(true);
    const token = Symbol();
    for (const draft of changed) {
      sessions.current.set(draft.rowId, token);
      patch({ ...draft, pending: true });
    }
    let result;
    try {
      result = await options.onRowsSave?.(changed.map(editOf));
    } catch (error) {
      result = Object.fromEntries(
        changed.map((draft) => [draft.rowId, error instanceof Error ? error.message : options.genericError]),
      );
    }
    const accepted: string[] = [];
    for (const draft of changed) {
      if (sessions.current.get(draft.rowId) !== token) continue;
      sessions.current.delete(draft.rowId);
      if (!reject(draft, result?.[draft.rowId])) accepted.push(draft.rowId);
    }
    if (accepted.length) finish(accepted);
    bulkBusy.current = false;
    setSavingAll(false);
  };
  const add = () => {
    if (newRow) return;
    const defaults = options.newRowDefaults?.() ?? {};
    const row = { ...defaults } as unknown as T;
    const values = {
      ...defaults,
      ...Object.fromEntries(
        options.columns
          .filter((column) => isCellEditable(column, row))
          .map((column) => [column.id, defaults[column.id] ?? null]),
      ),
    };
    setNewRow(row);
    patch({ row, rowId: newId, values, previous: { ...values }, fieldErrors: {} });
  };
  return {
    ids: newRow ? [...ids, newId] : ids,
    newRow,
    newId,
    add,
    get,
    start,
    setValue,
    save,
    savingAll,
    saveAll,
    changedCount: changed.length,
    discardAll: () => finish(ids),
    cancel: (row: T) => finish([idOf(row)]),
  };
}
export type RowEdits<T> = ReturnType<typeof useRowEdits<T>>;
