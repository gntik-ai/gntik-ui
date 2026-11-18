import { evaluateQuery, newQueryId, useI18n, type QueryField, type QueryGroup } from '@gntik-ai/ui';
import { useEffect, useEffectEvent, useMemo, useRef } from 'react';
import type { DataTableColumn, DataTableFilterValue } from './data-table-utils';
import { useControllable } from './use-table-views';

export const EMPTY_FILTER_MODEL: QueryGroup = { type: 'group', id: 'table-filters', combinator: 'and', children: [] };

/** Owns the optional typed model and the client pipeline, independently of table rendering. */
export function useFilterModel<T>(options: {
  rows: readonly T[];
  columns: ReadonlyArray<DataTableColumn<T>>;
  model?: QueryGroup;
  initial?: QueryGroup;
  onChange?: (model: QueryGroup) => void;
  serverMode: boolean;
  onExternalChange?: () => void;
}) {
  const { locale } = useI18n();
  const [model, updateModel] = useControllable(options.model, options.initial ?? EMPTY_FILTER_MODEL, options.onChange);
  const key = JSON.stringify(model);
  const previousKey = useRef(key);
  const resetExternal = useEffectEvent(() => options.onExternalChange?.());
  useEffect(() => {
    if (previousKey.current !== key) {
      previousKey.current = key;
      resetExternal();
    }
  }, [key]);
  const { rows, columns, serverMode } = options;
  const filteredRows = useMemo(() => {
    if (serverMode || model.children.length === 0) return rows;
    const fields: QueryField[] = columns.map((column) => ({
      id: column.id,
      label: column.header,
      type: column.filter && column.filter.type !== 'custom' ? column.filter.type : 'text',
    }));
    return rows.filter((row) => {
      const record = Object.fromEntries(columns.map((column) => [column.id, column.accessor?.(row)]));
      return evaluateQuery(model, record, fields, locale);
    });
  }, [rows, columns, model, locale, serverMode]);
  return {
    model,
    setModel: (next: QueryGroup) => {
      previousKey.current = JSON.stringify(next);
      updateModel(next);
    },
    rows: filteredRows,
    edit: (field: string, value: DataTableFilterValue | null): QueryGroup => ({
      ...model,
      combinator: 'and',
      children: [
        ...model.children.filter((node) => node.type !== 'condition' || node.field !== field),
        ...(value ? [{ ...value, type: 'condition' as const, id: newQueryId(), field }] : []),
      ],
    }),
  };
}
