import { useAnnounce, useI18n, useSortable, type SortableDrag, type SortableMove } from '@gntik-ai/ui';
import { useEffect, useMemo, useRef } from 'react';
import type { DataTableRowMove } from './data-table-props';

export function useRowReorder<T>({
  rows,
  pageRows,
  getRowId,
  getRowLabel,
  onRowReorder,
  disabled = false,
}: {
  rows: readonly T[];
  pageRows: readonly T[];
  getRowId: (row: T) => string;
  getRowLabel: (row: T) => string;
  onRowReorder?: (move: DataTableRowMove) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const announce = useAnnounce();
  const picked = useRef<{ label: string; position: number; total: number } | null>(null);
  const enabled = !!onRowReorder;
  const pageIds = useMemo(() => (enabled ? pageRows.map(getRowId) : []), [enabled, pageRows, getRowId]);
  const indexes = useMemo(
    () => new Map(enabled ? rows.map((row, index) => [getRowId(row), index]) : []),
    [enabled, rows, getRowId],
  );
  const message = (
    key: 'table.rowPickedUp' | 'table.rowMoved' | 'table.rowDropped' | 'table.rowMoveCancelled',
    drag: SortableDrag,
    origin = false,
  ) => {
    const row = rows.find((row) => getRowId(row) === drag.itemId);
    const position = (indexes.get(pageIds[drag.over.index]!) ?? drag.over.index) + 1;
    if (key === 'table.rowPickedUp' && row) {
      picked.current = { label: getRowLabel(row), position, total: rows.length };
    }
    const source = picked.current;
    if (!source) return;
    announce(t(key, { ...source, position: origin ? source.position : position }));
  };
  const commit = (move: SortableMove) => {
    const fromIndex = indexes.get(move.itemId)!;
    const toIndex = indexes.get(pageIds[move.toIndex]!)!;
    const ids = rows.map(getRowId);
    ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, move.itemId);
    onRowReorder?.({
      rowId: move.itemId,
      fromIndex,
      toIndex,
      previousId: ids[toIndex - 1] ?? null,
      nextId: ids[toIndex + 1] ?? null,
    });
  };
  const sortable = useSortable({
    containers: [{ id: 'page', items: pageIds }],
    onMove: commit,
    disabled: !enabled || disabled,
    onDragStart: (drag) => message('table.rowPickedUp', drag),
    onDragOver: (drag) => message('table.rowMoved', drag),
    onDragEnd: (drag) => message('table.rowDropped', drag),
    onDragCancel: (drag) => message('table.rowMoveCancelled', drag, true),
  });
  const { cancel } = sortable;
  const pageKey = pageIds.join('\0');
  const previous = useRef(rows);
  const previousPage = useRef(pageKey);
  useEffect(() => {
    if (!enabled || disabled || previous.current !== rows || previousPage.current !== pageKey) cancel();
    previous.current = rows;
    previousPage.current = pageKey;
  }, [rows, pageKey, cancel, enabled, disabled]);
  const byId = useMemo(
    () => new Map(enabled ? pageRows.map((row) => [getRowId(row), row]) : []),
    [enabled, pageRows, getRowId],
  );
  return {
    ...sortable,
    rows: enabled
      ? sortable.containers[0]!.items.map((id) => byId.get(id)).filter((row): row is T => row !== undefined)
      : pageRows,
  };
}

export function useReorderVirtualizationWarning(enabled: boolean) {
  const warned = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && enabled && !warned.current) {
      warned.current = true;
      console.warn(
        'DataTable: virtualize=true is ignored with onRowReorder because dragged rows must stay mounted. Use pagination for large tables.',
      );
    }
  }, [enabled]);
}
