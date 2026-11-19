import { ReorderCell, type RowReorder } from './row-reorder';
import { ChevronRight } from '@gntik-ai/icons';
import {
  Button,
  Checkbox,
  cn,
  MoreMenu,
  Link,
  TableCell,
  TableHead,
  TableRow,
  type MoreMenuAction,
  useI18n,
  useOptionalI18n,
} from '@gntik-ai/ui';
import type { CSSProperties, ReactNode } from 'react';
import { stickyTint, type TableLayout } from './column-sizing';
import {
  COLUMN_VARIANT_CLASSES,
  columnAlign,
  formatCell,
  selectionState,
  type DataTableColumn,
} from './data-table-utils';
import { EditableCell, isCellEditable, type DataTableCellEditHandler } from './editable-cell';
import type { DataTableLabels } from './labels';
import { RowEditor, RowEditActions } from './row-editor';
import type { RowEdits } from './use-row-edits';
import type { DetailRows } from './use-detail-rows';
import { useRowActivation, type RowActivationProps } from './row-activation';
import type { SingleSelection } from './single-selection';

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
  selectableIds: readonly string[];
}

/** Row rendering shared by the plain, grouped and virtualized bodies. */
export interface RowContext<T> extends RowActivationProps<T> {
  details?: DetailRows<T>;
  reorder?: RowReorder<T>;
  labels?: Partial<DataTableLabels>;
  columns: ReadonlyArray<DataTableColumn<T>>;
  /** Id of the row-header column (resolved from all columns); its cell renders only while visible. */
  rowHeaderId?: string;
  getRowId: (row: T) => string;
  getRowLabel: (row: T) => string;
  selectable: boolean;
  isRowDisabled?: (row: T) => boolean;
  selected: ReadonlySet<string>;
  singleSelection?: SingleSelection<T>;
  onToggleRow: (id: string) => void;
  rowActions?: (row: T) => Array<MoreMenuAction | 'separator'>;
  layout?: TableLayout;
  hasRowActions?: boolean;
  rowEdits?: RowEdits<T>;
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
  labels,
  details,
  reorder,
  row,
  columns,
  rowHeaderId,
  getRowId,
  getRowLabel,
  getRowHref,
  onRowClick,
  onRowDoubleClick,
  selectOnRowClick,
  selectable,
  isRowDisabled,
  selected,
  singleSelection,
  onToggleRow,
  rowActions,
  layout,
  onCellEdit,
  rowEdits,
  hasRowActions,
  editHintId,
  ariaRowIndex,
  style,
}: DataTableRowProps<T>) {
  const { t } = useI18n();
  const locale = useOptionalI18n()?.locale;
  const id = getRowId(row);
  const selectionColumn = selectable || singleSelection != null;
  const isSelected = singleSelection ? singleSelection.selectedId === id : selected.has(id);
  const label = getRowLabel(row);
  const href = getRowHref?.(row);
  const activation = useRowActivation({
    row,
    href,
    getRowHref,
    onRowClick,
    onRowDoubleClick,
    selectOnRowClick: selectOnRowClick && selectionColumn,
    disabled: isRowDisabled?.(row),
    detail: details?.onRowClick && details.canExpand(row) ? () => details.toggle(id) : undefined,
  });
  const identifyingColumn = columns.find((c) => c.id === rowHeaderId)?.id ?? columns[0]?.id;
  const tint = (l: TableLayout['lead'] | undefined) => stickyTint(l, { selected: selectionColumn && isSelected });
  return (
    <TableRow
      ref={reorder?.sortable.getItemProps(id).ref}
      data-dragging={reorder?.sortable.drag?.itemId === id ? '' : undefined}
      selected={selectionColumn && isSelected}
      aria-rowindex={ariaRowIndex}
      data-row-id={id}
      style={style}
      className={cn(
        activation.clickable && 'cursor-pointer',
        reorder?.sortable.drag?.itemId === id &&
          'relative bg-card shadow-sm transition-shadow motion-reduce:transition-none',
      )}
      onAuxClick={activation.onAuxClick}
      onClick={activation.onClick}
      onDoubleClick={activation.onDoubleClick}
    >
      {selectionColumn && (
        <TableCell className={cn('w-10 pe-0', layout?.lead.className, tint(layout?.lead))} style={layout?.lead.style}>
          {singleSelection ? (
            <span {...singleSelection.entryProps(row)} className="inline-flex">
              <input
                {...singleSelection.inputProps(row)}
                className="size-4 accent-primary focus-ring disabled:cursor-not-allowed"
              />
            </span>
          ) : (
            <Checkbox
              aria-label={labels?.selectRow?.(label) ?? t('table.selectRow', { label })}
              checked={isSelected}
              disabled={isRowDisabled?.(row)}
              onCheckedChange={() => onToggleRow(id)}
            />
          )}
        </TableCell>
      )}
      {reorder && <ReorderCell row={row} id={id} label={label} reorder={reorder} layout={layout?.reorder} />}
      {details && (
        <TableCell
          className={cn('w-10 px-1 py-0', layout?.detail?.className, tint(layout?.detail))}
          style={layout?.detail?.style}
        >
          {details.canExpand(row) && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              id={details.ids(id).toggle}
              aria-label={labels?.rowDetails?.(label) ?? t('table.rowDetails', { label })}
              aria-expanded={details.isExpanded(id)}
              aria-controls={details.ids(id).panel}
              onClick={() => details.toggle(id)}
            >
              <ChevronRight
                size={14}
                aria-hidden
                className={cn(
                  'shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none',
                  details.isExpanded(id) ? 'rotate-90' : 'rtl:-scale-x-100',
                )}
              />
            </Button>
          )}
        </TableCell>
      )}
      {columns.map((c) => {
        const cl = layout?.columns.get(c.id);
        const content = c.cell
          ? c.cell(row)
          : formatCell(c.accessor?.(row), {
              locale,
              booleanLabels: [labels?.booleanTrue ?? t('common.yes'), labels?.booleanFalse ?? t('common.no')],
            });
        const editable = onCellEdit && editHintId && isCellEditable(c, row);
        return (
          <TableCell
            key={c.id}
            rowHeader={c.id === rowHeaderId}
            data-detail-interactive={details && (editable || (rowEdits && isCellEditable(c, row))) ? '' : undefined}
            align={columnAlign(c)}
            style={cl?.style}
            className={cn(
              'whitespace-nowrap',
              cl?.style && 'overflow-hidden text-ellipsis',
              COLUMN_VARIANT_CLASSES[c.variant ?? 'default'],
              c.className,
              cl?.className,
              tint(cl),
            )}
          >
            {rowEdits?.ids.includes(id) && isCellEditable(c, row) ? (
              <RowEditor
                row={row}
                rowLabel={label}
                column={c}
                edits={rowEdits}
                labels={labels}
                autoFocus={
                  rowEdits.focusRequestedId === id && columns.find((column) => isCellEditable(column, row))?.id === c.id
                }
              />
            ) : editable ? (
              <EditableCell
                labels={labels}
                row={row}
                rowId={id}
                rowLabel={label}
                column={c}
                onCellEdit={onCellEdit}
                hintId={editHintId}
              >
                {content}
              </EditableCell>
            ) : c.id === identifyingColumn && href ? (
              <Link href={href} tone="inherit" underline="hover" data-row-link onClick={activation.onHeaderClick}>
                {content}
              </Link>
            ) : c.id === identifyingColumn && !getRowHref && onRowClick ? (
              <Link
                render={<button type="button" />}
                tone="inherit"
                underline="hover"
                onClick={activation.onHeaderClick}
              >
                {content}
              </Link>
            ) : (
              content
            )}
          </TableCell>
        );
      })}
      {(hasRowActions || rowActions || rowEdits) && (
        <TableCell
          align="right"
          className={cn('w-12 py-0', layout?.trail.className, tint(layout?.trail))}
          style={layout?.trail.style}
        >
          {rowEdits && <RowEditActions row={row} rowId={id} label={label} edits={rowEdits} labels={labels} />}
          {rowActions && (
            <MoreMenu
              items={rowActions(row)}
              label={labels?.rowActions?.(label) ?? t('table.rowActions', { label })}
              variant="ghost"
              size="sm"
            />
          )}
        </TableCell>
      )}
    </TableRow>
  );
}

export const groupHeadClass =
  'h-9 bg-secondary/50 text-[12.5px] font-semibold tracking-normal normal-case text-foreground';

export interface GroupHeaderRowProps<T> {
  labels?: Partial<DataTableLabels>;
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
export function GroupHeaderRow<T>({
  labels,
  group,
  open,
  selectable,
  selected,
  span,
  collapsible,
  onToggle,
  onToggleRows,
  ariaRowIndex,
  style,
}: GroupHeaderRowProps<T>) {
  const { t } = useI18n();
  const state = selectionState(group.selectableIds, selected);
  const count = group.ids.length;
  const heading = (
    <>
      <span className="truncate">{group.label}</span>{' '}
      <span className="rounded-full bg-secondary px-1.5 font-mono text-[11px] font-medium text-muted-foreground tabular-nums">
        {count}
      </span>{' '}
      <span className="sr-only">{labels?.groupRows?.(count) ?? (count === 1 ? 'row' : 'rows')}</span>
    </>
  );
  return (
    <TableRow className="hover:bg-transparent" aria-rowindex={ariaRowIndex} style={style} data-group-header={group.key}>
      {selectable && (
        <TableCell className={cn('w-10 pe-0', groupHeadClass)}>
          <Checkbox
            aria-label={labels?.selectGroup?.(group.name) ?? t('table.selectRow', { label: `all in ${group.name}` })}
            checked={state.checked}
            indeterminate={state.indeterminate}
            disabled={group.selectableIds.length === 0}
            onCheckedChange={() => onToggleRows?.(group.selectableIds)}
          />
        </TableCell>
      )}
      <TableHead scope="rowgroup" colSpan={span} className={cn(groupHeadClass, collapsible && 'ps-2')}>
        {collapsible ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => onToggle?.(group.key)}
            className="inline-flex max-w-full items-center gap-1.5 rounded-sm px-1 py-0.5 hover:bg-secondary focus-ring"
          >
            <ChevronRight
              size={14}
              aria-hidden
              className={cn(
                'shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none',
                open ? 'rotate-90' : 'rtl:-scale-x-100',
              )}
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
