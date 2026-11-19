import { useEffect, useRef, type MouseEvent } from 'react';
import type { DataTableProps } from './data-table-props';

const INTERACTIVE =
  'a, button, input, select, textarea, label, [role="checkbox"], [role="menuitem"], [role="button"], [contenteditable], [data-row-click-ignore], [data-cell-editor], [data-cell-edit-trigger], [data-detail-interactive]';

function hasSelection(row: HTMLElement): boolean {
  const selection = row.ownerDocument.getSelection();
  return !!(
    selection &&
    !selection.isCollapsed &&
    ((selection.anchorNode && row.contains(selection.anchorNode)) ||
      (selection.focusNode && row.contains(selection.focusNode)))
  );
}

/** Keep controls and text selection independent of whole-row actions, including detail toggles. */
export function isInteractiveTarget(event: MouseEvent<HTMLElement>, checkSelection = true): boolean {
  const row = event.currentTarget;
  const target = event.target;
  return (
    event.defaultPrevented ||
    !(target instanceof Element) ||
    !row.contains(target) ||
    target.closest(INTERACTIVE) != null ||
    (checkSelection && hasSelection(row))
  );
}

export type RowActivationProps<T> = Pick<
  DataTableProps<T>,
  'getRowHref' | 'onRowClick' | 'onRowDoubleClick' | 'selectOnRowClick'
>;

export function useRowActivation<T>({
  row,
  href,
  getRowHref,
  onRowClick,
  onRowDoubleClick,
  selectOnRowClick,
  disabled,
  detail,
}: RowActivationProps<T> & {
  row: T;
  href?: string;
  disabled?: boolean;
  detail?: () => void;
}) {
  const following = useRef(false);
  // Resolve precedence once; a disabled selection row must not fall through to details.
  const mode = getRowHref || onRowClick ? 'activate' : selectOnRowClick ? 'select' : detail ? 'detail' : 'none';
  const clickable = mode === 'activate' && (!!href || (!getRowHref && !!onRowClick));
  const selecting = mode === 'select' && !disabled;
  const activate = (event: MouseEvent<HTMLTableRowElement>) => {
    if (following.current || isInteractiveTarget(event)) return;
    if (event.button !== 0 && event.button !== 1) return;
    if (clickable) {
      onRowClick?.(row, event);
      if (event.defaultPrevented || !href) return;
      if (event.button === 1 || event.ctrlKey || event.metaKey) {
        event.preventDefault();
        window.open(href, '_blank', 'noopener');
      } else {
        following.current = true;
        try {
          event.currentTarget.querySelector<HTMLAnchorElement>('[data-row-link]')?.click();
        } finally {
          following.current = false;
        }
      }
    } else if (event.button === 0) {
      if (selecting) event.currentTarget.querySelector<HTMLElement>('input[type="radio"], [role="checkbox"]')?.click();
      else if (mode === 'detail') detail?.();
    }
  };
  return {
    clickable: clickable || selecting,
    onHeaderClick: (event: MouseEvent<HTMLElement>) => {
      if (following.current) return;
      if (event.detail > 0 && hasSelection(event.currentTarget.closest('tr') ?? event.currentTarget)) {
        event.preventDefault();
        return;
      }
      onRowClick?.(row, event);
    },
    onClick: clickable || selecting || mode === 'detail' ? activate : undefined,
    onAuxClick: href
      ? (event: MouseEvent<HTMLTableRowElement>) => {
          if (event.button === 1) activate(event);
        }
      : undefined,
    onDoubleClick: onRowDoubleClick
      ? (event: MouseEvent<HTMLTableRowElement>) => {
          if (!isInteractiveTarget(event, false)) onRowDoubleClick(row, event);
        }
      : undefined,
  };
}

/** Activation takes precedence over selection and detail actions, once per mounted table. */
export function useRowActivationWarning<T>({
  getRowHref,
  onRowClick,
  selectOnRowClick,
  detailOnRowClick,
}: RowActivationProps<T> & { detailOnRowClick?: boolean }) {
  const warned = useRef(false);
  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' &&
      (getRowHref || onRowClick) &&
      (selectOnRowClick || detailOnRowClick) &&
      !warned.current
    ) {
      warned.current = true;
      console.warn(
        `DataTable: ${[selectOnRowClick && 'selectOnRowClick', detailOnRowClick && 'detailOnRowClick'].filter(Boolean).join(' and ')} ignored with getRowHref or onRowClick.`,
      );
    }
  }, [getRowHref, onRowClick, selectOnRowClick, detailOnRowClick]);
}
