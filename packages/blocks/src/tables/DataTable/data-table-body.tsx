import { ChevronRight, Inbox } from '@gntik-ai/icons';
import { Checkbox, cn, EmptyState, MoreMenu, Skeleton, TableBody, TableCell, TableHead, TableRow, type MoreMenuAction, useI18n } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { COLUMN_VARIANT_CLASSES, columnAlign, formatCell, selectionState, type DataTableColumn } from './data-table-utils';

/** A group as the body renders it: its rows on the current page plus header data. */
export interface DataTableBodyGroup<T> {
  key: string;
  /** Visible group name (header text). */
  label: ReactNode;
  /** Plain-text name for button and checkbox labels. */
  name: string;
  /** Rows of the group on the current page. */
  rows: readonly T[];
  /** Ids of every row in the group (all pages): the count and the group checkbox use them. */
  ids: readonly string[];
}

export interface DataTableBodyProps<T> {
  rows: readonly T[];
  columns: ReadonlyArray<DataTableColumn<T>>;
  getRowId: (row: T) => string;
  /** Label of a row for its checkbox and actions ("orders-api"). */
  getRowLabel: (row: T) => string;
  selectable: boolean;
  selected: ReadonlySet<string>;
  onToggleRow: (id: string) => void;
  rowActions?: (row: T) => Array<MoreMenuAction | 'separator'>;
  loading: boolean;
  loadingRows: number;
  emptyState?: ReactNode;
  /** Grouped rendering: one `<tbody>` per group with a header row (replaces `rows`). */
  groups?: ReadonlyArray<DataTableBodyGroup<T>>;
  /** Keys of collapsed groups. */
  collapsedGroups?: ReadonlySet<string>;
  /** Group headers render a collapse button (default true). */
  collapsibleGroups?: boolean;
  onToggleGroup?: (key: string) => void;
  /** Selects or clears every row of a group. */
  onToggleGroupRows?: (ids: readonly string[]) => void;
}

const groupHeadClass = 'h-9 bg-secondary/50 text-[12.5px] font-semibold tracking-normal normal-case text-foreground';

/** Body rows, plus the loading (skeleton rows) and empty (EmptyState) states. */
export function DataTableBody<T>({
  rows,
  columns,
  getRowId,
  getRowLabel,
  selectable,
  selected,
  onToggleRow,
  rowActions,
  loading,
  loadingRows,
  emptyState,
  groups,
  collapsedGroups,
  collapsibleGroups = true,
  onToggleGroup,
  onToggleGroupRows,
}: DataTableBodyProps<T>) {
  const { t } = useI18n();
  const span = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);
  if (loading) {
    return (
      <TableBody>
        {Array.from({ length: loadingRows }, (_, i) => (
          <TableRow key={`loading-${i}`}>
            {selectable && (
              <TableCell className="w-10">
                <Skeleton className="size-4 rounded-[4px]" />
              </TableCell>
            )}
            {columns.map((c) => (
              <TableCell key={c.id} align={columnAlign(c)}>
                <Skeleton className={cn('h-3.5', columnAlign(c) === 'right' ? 'ms-auto w-16' : 'w-24')} />
              </TableCell>
            ))}
            {rowActions && <TableCell className="w-12" />}
          </TableRow>
        ))}
      </TableBody>
    );
  }
  if (rows.length === 0) {
    return (
      <TableBody>
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={span} className="py-10">
            {emptyState ?? <EmptyState icon={Inbox} size="sm" title={t('common.noResults')} description={t('table.emptyDescription')} />}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }
  const renderRow = (row: T) => {
    const id = getRowId(row);
    const isSelected = selected.has(id);
    const label = getRowLabel(row);
    return (
      <TableRow key={id} selected={selectable && isSelected}>
        {selectable && (
          <TableCell className="w-10 pe-0">
            <Checkbox aria-label={t('table.selectRow', { label })} checked={isSelected} onCheckedChange={() => onToggleRow(id)} />
          </TableCell>
        )}
        {columns.map((c) => (
          <TableCell key={c.id} align={columnAlign(c)} className={cn('whitespace-nowrap', COLUMN_VARIANT_CLASSES[c.variant ?? 'default'], c.className)}>
            {c.cell ? c.cell(row) : formatCell(c.accessor?.(row))}
          </TableCell>
        ))}
        {rowActions && (
          <TableCell align="right" className="w-12 py-0">
            <MoreMenu items={rowActions(row)} label={t('table.rowActions', { label })} variant="ghost" size="sm" />
          </TableCell>
        )}
      </TableRow>
    );
  };
  if (!groups) return <TableBody>{rows.map(renderRow)}</TableBody>;
  return (
    <>
      {groups.map((group, gi) => {
        const open = !collapsedGroups?.has(group.key);
        const state = selectionState(group.ids, selected);
        const count = group.ids.length;
        const heading = (
          <>
            <span className="truncate">{group.label}</span>{' '}
            <span className="rounded-full bg-secondary px-1.5 font-mono text-[11px] font-medium text-muted-foreground tabular-nums">
              {count}
            </span>{' '}
            <span className="sr-only">{count === 1 ? 'row' : 'rows'}</span>
          </>
        );
        return (
          <TableBody
            key={group.key}
            data-group={group.key}
            // Every group but the last keeps the bottom rule of its last row.
            className={gi < groups.length - 1 ? '[&>tr:last-child>td]:border-b' : undefined}
          >
            <TableRow className="hover:bg-transparent">
              {selectable && (
                <TableCell className={cn('w-10 pe-0', groupHeadClass)}>
                  <Checkbox
                    aria-label={t('table.selectRow', { label: `all in ${group.name}` })}
                    checked={state.checked}
                    indeterminate={state.indeterminate}
                    disabled={count === 0}
                    onCheckedChange={() => onToggleGroupRows?.(group.ids)}
                  />
                </TableCell>
              )}
              <TableHead scope="rowgroup" colSpan={span - (selectable ? 1 : 0)} className={cn(groupHeadClass, collapsibleGroups && 'ps-2')}>
                {collapsibleGroups ? (
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => onToggleGroup?.(group.key)}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-sm px-1 py-0.5 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                  >
                    <ChevronRight size={14} aria-hidden className={cn('shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none', open ? 'rotate-90' : 'rtl:-scale-x-100')} />
                    {heading}
                  </button>
                ) : (
                  <span className="inline-flex max-w-full items-center gap-1.5">{heading}</span>
                )}
              </TableHead>
            </TableRow>
            {open && group.rows.map(renderRow)}
          </TableBody>
        );
      })}
    </>
  );
}
