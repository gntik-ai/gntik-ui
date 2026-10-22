import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { DataTableSelectionModel } from './data-table-utils';

/** Owns include/exclude selection independently of the currently supplied server page. */
export function useMultipleSelection(options: {
  rowIds: string[];
  enabledIds: string[];
  selectedIds?: readonly string[];
  defaultSelectedIds: readonly string[];
  onSelectionChange?: (ids: string[]) => void;
  preserveSelection: boolean;
  selectionModel?: DataTableSelectionModel;
  onSelectionModelChange?: (model: DataTableSelectionModel) => void;
  serverMode: boolean;
  selectAllMatching: boolean;
  total: number;
  filters?: unknown;
}) {
  const needsModelCallback = options.serverMode && options.selectAllMatching && !options.onSelectionModelChange;
  useEffect(() => {
    if (needsModelCallback && process.env.NODE_ENV === 'development')
      console.warn('DataTable selectAllMatching with server pagination requires onSelectionModelChange.');
  }, [needsModelCallback]);
  const [inner, setInner] = useState<DataTableSelectionModel>(() => ({
    type: 'include',
    ids: [...options.defaultSelectedIds],
  }));
  const model =
    options.selectionModel ??
    (options.selectedIds ? { type: 'include' as const, ids: [...options.selectedIds] } : inner);
  const modelIds = new Set(model.ids);
  const selected = new Set(model.type === 'exclude' ? options.enabledIds.filter((id) => !modelIds.has(id)) : model.ids);
  const report = (next: DataTableSelectionModel) => {
    const ids = new Set(next.ids);
    if (next.type === 'exclude') return options.enabledIds.filter((id) => !ids.has(id));
    return options.preserveSelection ? [...next.ids] : options.rowIds.filter((id) => ids.has(id));
  };
  const selectedList = report(model);
  const change = (next: DataTableSelectionModel) => {
    setInner(next);
    options.onSelectionChange?.(report(next));
    options.onSelectionModelChange?.(next);
  };
  const filterKey = JSON.stringify(options.filters);
  const previousFilters = useRef(filterKey);
  const resetForFilters = useEffectEvent(() => {
    if (model.type === 'exclude') change({ type: 'include', ids: [] });
  });
  useEffect(() => {
    if (previousFilters.current !== filterKey) {
      previousFilters.current = filterKey;
      resetForFilters();
    }
  }, [filterKey]);

  return {
    selected,
    selectedList,
    model,
    selectedCount: model.type === 'exclude' ? Math.max(0, options.total - model.ids.length) : selectedList.length,
    allMatchingSelected:
      model.type === 'exclude' || (options.enabledIds.length > 0 && options.enabledIds.every((id) => selected.has(id))),
    selectAllMatching: () =>
      change(
        options.serverMode
          ? { type: 'exclude', ids: options.rowIds.filter((id) => !options.enabledIds.includes(id)) }
          : { type: 'include', ids: options.enabledIds },
      ),
    clear: () => change({ type: 'include', ids: [] }),
    setSelected: (next: Set<string>) => {
      if (model.type === 'include') {
        change({
          type: 'include',
          ids: [...next],
        });
      } else {
        const excluded = new Set(model.ids);
        for (const id of options.enabledIds) {
          if (next.has(id)) excluded.delete(id);
          else excluded.add(id);
        }
        change({ type: 'exclude', ids: [...excluded] });
      }
    },
  };
}
