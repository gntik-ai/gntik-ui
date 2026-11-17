import { useRef, useState } from 'react';
import type { DataTableColumn } from './data-table-utils';
import type { DataTableEditValue } from './row-edit-types';

export function startValue<T>(row: T, column: DataTableColumn<T>): DataTableEditValue {
  const raw = column.editValue ? column.editValue(row) : column.accessor?.(row);
  if (raw == null) return null;
  if (typeof raw === 'number' || typeof raw === 'string') return raw;
  if (raw instanceof Date) {
    if (column.editor?.type === 'date' && !Number.isNaN(raw.getTime()))
      return `${raw.getFullYear()}-${String(raw.getMonth() + 1).padStart(2, '0')}-${String(raw.getDate()).padStart(2, '0')}`;
    return raw.toISOString();
  }
  return String(raw);
}

/** Reactive custom-editor value plus an event-time snapshot for setValue(); commit() in one handler. */
export function useEditorValue() {
  const [value, setValue] = useState<DataTableEditValue>(null);
  const latest = useRef<DataTableEditValue>(null);
  return {
    value,
    setValue: (next: DataTableEditValue) => {
      latest.current = next;
      setValue(next);
    },
    getValue: () => latest.current,
  };
}
