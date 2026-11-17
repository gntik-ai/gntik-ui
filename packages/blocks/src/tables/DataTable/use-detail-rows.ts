import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import type { DataTableProps } from './data-table-props';

export interface DetailRows<T> {
  render: (row: T) => ReactNode;
  canExpand: (row: T) => boolean;
  isExpanded: (id: string) => boolean;
  toggle: (id: string) => void;
  ids: (id: string) => { toggle: string; panel: string };
  onRowClick: boolean;
}

/** Detail ids deliberately survive paging, sorting and temporarily absent rows. */
export function useDetailRows<T>({
  renderDetail,
  hasDetail,
  expandedDetailIds,
  defaultExpandedDetailIds = [],
  onExpandedDetailIdsChange,
  detailExpandMode = 'multiple',
  detailOnRowClick = false,
}: Pick<
  DataTableProps<T>,
  | 'renderDetail'
  | 'hasDetail'
  | 'expandedDetailIds'
  | 'defaultExpandedDetailIds'
  | 'onExpandedDetailIdsChange'
  | 'detailExpandMode'
  | 'detailOnRowClick'
>): DetailRows<T> | undefined {
  const prefix = useId();
  const [innerIds, setInnerIds] = useState<readonly string[]>(defaultExpandedDetailIds);
  const expanded = expandedDetailIds ?? innerIds;
  if (!renderDetail) return undefined;
  return {
    render: renderDetail,
    canExpand: (row) => hasDetail?.(row) ?? true,
    isExpanded: (id) => expanded.includes(id),
    toggle: (id) => {
      const next = expanded.includes(id)
        ? expanded.filter((value) => value !== id)
        : detailExpandMode === 'single'
          ? [id]
          : [...expanded, id];
      if (expandedDetailIds === undefined) setInnerIds(next);
      onExpandedDetailIdsChange?.(next);
    },
    ids: (id) => ({
      toggle: `${prefix}-${encodeURIComponent(id)}-toggle`,
      panel: `${prefix}-${encodeURIComponent(id)}-panel`,
    }),
    onRowClick: detailOnRowClick,
  };
}

/** Warn once per table, including when virtualization is enabled after mount. */
export function useDetailVirtualizationWarning(enabled: boolean) {
  const warned = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && enabled && !warned.current) {
      warned.current = true;
      console.warn(
        'DataTable: virtualize=true is ignored with renderDetail because expandable rows need measured heights. Use pagination for large tables.',
      );
    }
  }, [enabled]);
}
