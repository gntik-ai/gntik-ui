import { ChevronRight } from '@gntik-ai/icons';
import { Checkbox, cn, MoreMenu, TableCell, TableHead, TableRow, type MoreMenuAction, useI18n } from '@gntik-ai/ui';
import type { CSSProperties, ReactNode } from 'react';
import { stickyTint, type TableLayout } from './column-sizing';
import { COLUMN_VARIANT_CLASSES, columnAlign, formatCell, selectionState, type DataTableColumn } from './data-table-utils';
import { EditableCell, isCellEditable, type DataTableCellEditHandler } from './editable-cell';

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

/** Row rendering shared by the plain, grouped and virtualized bodies. */
export interface RowContext<T> {
  columns: ReadonlyArray<DataTableColumn<T>>;
  getRowId: (row: T) => string;
  getRowLabel: (row: T) => string;
  selectable: boolean;
  selected: ReadonlySet<string>;
  onToggleRow: (id: string) => void;
  rowActions?: (row: T) => Array<MoreMenuAction | 'separator'>;
  layout?: TableLayout;
  onCellEdit?: DataTableCellEditHandler<T>;
  /** Id of the "Press Enter or F2 to edit" hint. */
  editHintId?: string;
}

export interface DataTableRowProps<T> extends RowContext<T> {
  row: T;
  /** 1-based row index in the whole table (virtualized tables). */
  ariaRowIndex?: number;
  style?: CSSProperties;
}

export function DataTableRow<T>({
  row,
  columns,
  getRowId,
  getRowLabel,
  selectable,
  selected,
  onToggleRow,
  rowActions,
  layout,
  onCellEdit,
  editHintId,
  ariaRowIndex,
  style,
}: DataTableRowProps<T>) {
  const { t } = useI18n();
  const id = getRowId(row);
  const isSelected = selected.has(id);
  const label = getRowLabel(row);
  const tint = (l: TableLayout['lead'] | undefined) => stickyTint(l, { selected: selectable && isSelected });
  return (
    <TableRow selected={selectable && isSelected} aria-rowindex={ariaRowIndex} data-row-id={id} style={style}>
      {selectable && (
        <TableCell className={cn('w-10 pe-0', layout?.lead.className, tint(layout?.lead))} style={layout?.lead.style}>
          <Checkbox aria-label={t('table.selectRow', { label })} checked={isSelected} onCheckedChange={() => onToggleRow(id)} />
        </TableCell>
      )}
      {columns.map((c) => {
        const cl = layout?.columns.get(c.id);
        const content = c.cell ? c.cell(row) : formatCell(c.accessor?.(row));
        const editable = onCellEdit && editHintId && isCellEditable(c, row);
        return (
          <TableCell
            key={c.id}
            align={columnAlign(c)}
            style={cl?.style}
            className={cn('whitespace-nowrap', cl?.style && 'overflow-hidden text-ellipsis', COLUMN_VARIANT_CLASSES[c.variant ?? 'default'], c.className, cl?.className, tint(cl))}
          >
            {editable ? (
              <EditableCell row={row} rowId={id} rowLabel={label} column={c} onCellEdit={onCellEdit} hintId={editHintId}>
                {content}
              </EditableCell>
            ) : (
              content
            )}
          </TableCell>
        );
      })}
      {rowActions && (
        <TableCell align="right" className={cn('w-12 py-0', layout?.trail.className, tint(layout?.trail))} style={layout?.trail.style}>
          <MoreMenu items={rowActions(row)} label={t('table.rowActions', { label })} variant="ghost" size="sm" />
        </TableCell>
      )}
    </TableRow>
  );
}

export const groupHeadClass = 'h-9 bg-secondary/50 text-[12.5px] font-semibold tracking-normal normal-case text-foreground';

export interface GroupHeaderRowProps<T> {
  group: DataTableBodyGroup<T>;
  open: boolean;
  selectable: boolean;
  selected: ReadonlySet<string>;
  /** Columns spanned by the header cell (every column but the selection one). */
  span: number;
  collapsible: boolean;
  onToggle?: (key: string) => void;
  onToggleRows?: (ids: readonly string[]) => void;
  ariaRowIndex?: number;
  style?: CSSProperties;
}

/** The header row of a group: group checkbox, collapse button, label and count. */
export function GroupHeaderRow<T>({ group, open, selectable, selected, span, collapsible, onToggle, onToggleRows, ariaRowIndex, style }: GroupHeaderRowProps<T>) {
  const { t } = useI18n();
  const state = selectionState(group.ids, selected);
  const count = group.ids.length;
  const heading = (
    <>
      <span className="truncate">{group.label}</span>{' '}
      <span className="rounded-full bg-secondary px-1.5 font-mono text-[11px] font-medium text-muted-foreground tabular-nums">{count}</span>{' '}
      <span className="sr-only">{count === 1 ? 'row' : 'rows'}</span>
    </>
  );
  return (
    <TableRow className="hover:bg-transparent" aria-rowindex={ariaRowIndex} style={style} data-group-header={group.key}>
      {selectable && (
        <TableCell className={cn('w-10 pe-0', groupHeadClass)}>
          <Checkbox
            aria-label={t('table.selectRow', { label: `all in ${group.name}` })}
            checked={state.checked}
            indeterminate={state.indeterminate}
            disabled={count === 0}
            onCheckedChange={() => onToggleRows?.(group.ids)}
          />
        </TableCell>
      )}
      <TableHead scope="rowgroup" colSpan={span} className={cn(groupHeadClass, collapsible && 'ps-2')}>
        {collapsible ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => onToggle?.(group.key)}
            className="inline-flex max-w-full items-center gap-1.5 rounded-sm px-1 py-0.5 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            <ChevronRight
              size={14}
              aria-hidden
              className={cn('shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none', open ? 'rotate-90' : 'rtl:-scale-x-100')}
            />
            {heading}
          </button>
        ) : (
          <span className="inline-flex max-w-full items-center gap-1.5">{heading}</span>
        )}
      </TableHead>
    </TableRow>
  );
}
