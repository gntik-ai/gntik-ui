import { Inbox } from '@gntik-ai/icons';
import { cn, EmptyState, Skeleton, TableBody, TableCell, TableRow, useI18n } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { columnAlign } from './data-table-utils';
import { DataTableRow, GroupHeaderRow, type DataTableBodyGroup, type RowContext } from './data-table-row';
import type { VirtualWindow } from './use-virtual-rows';

export type { DataTableBodyGroup } from './data-table-row';

export interface DataTableBodyProps<T> extends RowContext<T> {
  rows: readonly T[];
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
  /** Renders only the items of this window (virtualized rows), with spacers for the rest. */
  virtual?: VirtualWindow;
}

/** One rendered line of the body: a group header or a data row. */
export type DataTableBodyItem<T> = { kind: 'group'; group: DataTableBodyGroup<T>; open: boolean } | { kind: 'row'; row: T; groupKey?: string };

/** Flattens rows (or groups and their open rows) into the lines the body renders. */
export function flattenBody<T>(rows: readonly T[], groups: ReadonlyArray<DataTableBodyGroup<T>> | undefined, collapsed: ReadonlySet<string> | undefined): Array<DataTableBodyItem<T>> {
  if (!groups) return rows.map((row) => ({ kind: 'row', row }));
  const items: Array<DataTableBodyItem<T>> = [];
  for (const group of groups) {
    const open = !collapsed?.has(group.key);
    items.push({ kind: 'group', group, open });
    if (open) for (const row of group.rows) items.push({ kind: 'row', row, groupKey: group.key });
  }
  return items;
}

function Spacer({ height, span }: { height: number; span: number }) {
  if (height <= 0) return null;
  return (
    <tbody aria-hidden data-virtual-spacer="">
      <tr role="presentation">
        <td colSpan={span} style={{ height, padding: 0, border: 0 }} />
      </tr>
    </tbody>
  );
}

/** Body rows, plus the loading (skeleton rows) and empty (EmptyState) states. */
export function DataTableBody<T>(props: DataTableBodyProps<T>) {
  const { rows, columns, selectable, selected, rowActions, loading, loadingRows, emptyState, groups, collapsedGroups, collapsibleGroups = true, onToggleGroup, onToggleGroupRows, virtual } = props;
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
  const row = (r: T, extra?: { ariaRowIndex?: number; height?: number }) => (
    <DataTableRow key={props.getRowId(r)} {...props} row={r} ariaRowIndex={extra?.ariaRowIndex} style={extra?.height ? { height: extra.height } : undefined} />
  );
  const header = (group: DataTableBodyGroup<T>, open: boolean, extra?: { ariaRowIndex?: number; height?: number }) => (
    <GroupHeaderRow
      key={`group-${group.key}`}
      group={group}
      open={open}
      selectable={selectable}
      selected={selected}
      span={span - (selectable ? 1 : 0)}
      collapsible={collapsibleGroups}
      onToggle={onToggleGroup}
      onToggleRows={onToggleGroupRows}
      ariaRowIndex={extra?.ariaRowIndex}
      style={extra?.height ? { height: extra.height } : undefined}
    />
  );

  if (virtual) {
    const items = flattenBody(rows, groups, collapsedGroups);
    const { start, end, rowHeight } = virtual;
    // Consecutive items of the same group share a <tbody> (a rowgroup), as in the full render.
    const chunks: Array<{ key: string; group?: string; items: Array<{ item: DataTableBodyItem<T>; index: number }> }> = [];
    for (let i = start; i < Math.min(end, items.length); i++) {
      const item = items[i]!;
      const g = item.kind === 'group' ? item.group.key : item.groupKey;
      const lastChunk = chunks[chunks.length - 1];
      if (lastChunk && lastChunk.group === g) lastChunk.items.push({ item, index: i });
      else chunks.push({ key: `${g ?? 'rows'}-${i}`, group: g, items: [{ item, index: i }] });
    }
    return (
      <>
        <Spacer height={start * rowHeight} span={span} />
        {chunks.map((chunk) => (
          <TableBody key={chunk.key} data-group={chunk.group}>
            {chunk.items.map(({ item, index }) =>
              item.kind === 'group'
                ? header(item.group, item.open, { ariaRowIndex: index + 2, height: rowHeight })
                : row(item.row, { ariaRowIndex: index + 2, height: rowHeight }),
            )}
          </TableBody>
        ))}
        <Spacer height={Math.max(0, items.length - end) * rowHeight} span={span} />
      </>
    );
  }

  if (!groups) return <TableBody>{rows.map((r) => row(r))}</TableBody>;
  return (
    <>
      {groups.map((group, gi) => {
        const open = !collapsedGroups?.has(group.key);
        return (
          <TableBody
            key={group.key}
            data-group={group.key}
            // Every group but the last keeps the bottom rule of its last row.
            className={gi < groups.length - 1 ? '[&>tr:last-child>td]:border-b' : undefined}
          >
            {header(group, open)}
            {open && group.rows.map((r) => row(r))}
          </TableBody>
        );
      })}
    </>
  );
}
