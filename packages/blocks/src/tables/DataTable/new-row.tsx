import { Button, TableBody, TableCell, TableRow, useI18n } from '@gntik-ai/ui';
import { useLayoutEffect, useRef, type RefObject } from 'react';
import type { DataTableColumn } from './data-table-utils';
import { isCellEditable } from './editable-cell';
import type { DataTableLabels } from './labels';
import { RowEditActions, RowEditor } from './row-editor';
import type { RowEdits } from './use-row-edits';

export function AddRowButton<T>({
  edits,
  labels,
  buttonRef,
}: {
  edits: RowEdits<T>;
  labels?: Partial<DataTableLabels>;
  buttonRef: RefObject<HTMLButtonElement | null>;
}) {
  const { t } = useI18n();
  const wasAdding = useRef(false);
  useLayoutEffect(() => {
    if (wasAdding.current && edits.newRow === null) buttonRef.current?.focus();
    wasAdding.current = edits.newRow !== null;
  }, [edits.newRow, buttonRef]);
  return (
    <Button ref={buttonRef} size="sm" disabled={edits.newRow !== null} onClick={edits.add}>
      {labels?.addRow ?? t('table.addRow')}
    </Button>
  );
}
export function NewRow<T>({
  edits,
  columns,
  selectionColumn,
  detailColumn = false,
  labels,
}: {
  edits: RowEdits<T>;
  columns: ReadonlyArray<DataTableColumn<T>>;
  selectionColumn: boolean;
  detailColumn?: boolean;
  labels?: Partial<DataTableLabels>;
}) {
  const { t } = useI18n();
  const row = edits.newRow;
  if (row === null) return null;
  const editable = columns.filter((column) => isCellEditable(column, row));
  const label = labels?.addRow ?? t('table.addRow');
  return (
    <TableBody>
      <TableRow data-row-id={edits.newId}>
        {selectionColumn && <TableCell />}
        {detailColumn && <TableCell />}
        {columns.map((column) => (
          <TableCell key={column.id}>
            {isCellEditable(column, row) && (
              <RowEditor
                row={row}
                rowLabel={label}
                column={column}
                edits={edits}
                autoFocus={edits.focusRequestedId === edits.newId && editable[0]?.id === column.id}
                labels={labels}
              />
            )}
          </TableCell>
        ))}
        <TableCell>
          <RowEditActions row={row} rowId={edits.newId} label={label} edits={edits} labels={labels} />
        </TableCell>
      </TableRow>
    </TableBody>
  );
}
