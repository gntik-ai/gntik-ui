import type { AriaAttributes, ReactNode } from 'react';

/** Editors encode switches and calendar dates as strings to preserve cell callback compatibility. */
export type DataTableEditValue = string | number | null;
export interface DataTableRowEdit<T> {
  row: T;
  rowId: string;
  values: Record<string, DataTableEditValue>;
  previous: Record<string, DataTableEditValue>;
}
export type DataTableRowSaveResult = void | boolean | string | { fieldErrors: Record<string, string> };
export type DataTableRowsSaveResult = void | Record<string, string | { fieldErrors: Record<string, string> }>;
export interface DataTableEditorContext<T> {
  row: T;
  value: DataTableEditValue;
  setValue: (value: DataTableEditValue) => void;
  /** Commits a cell; in row mode, the current value is already part of the row draft. */
  commit: () => void;
  cancel: () => void;
  error?: string;
  inputProps: AriaAttributes & { 'aria-label': string; autoFocus: boolean };
}
export type DataTableRenderEditor<T> = (context: DataTableEditorContext<T>) => ReactNode;
