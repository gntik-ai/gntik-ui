import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useI18n, type MoreMenuAction } from '@gntik-ai/ui';
import { ConfirmDestructive } from '../../feedback/ConfirmDestructive/ConfirmDestructive';
import type { DataTableLabels } from './labels';

export function useRowDeletion<T>({
  rows,
  getRowId,
  getRowLabel,
  rowActions,
  onRowDelete,
  tableRef,
  labels,
}: {
  rows: readonly T[];
  getRowId: (row: T) => string;
  getRowLabel: (row: T) => string;
  rowActions?: (row: T) => Array<MoreMenuAction | 'separator'>;
  onRowDelete?: (row: T) => void | Promise<void>;
  tableRef: RefObject<HTMLTableElement | null>;
  labels?: Partial<DataTableLabels>;
}) {
  const { t } = useI18n();
  const [target, setTarget] = useState<{ row: T; label: string } | null>(null);
  const [open, setOpen] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const focusCandidates = useRef<string[]>([]);
  const waitingForRemoval = useRef<string | null>(null);
  const trigger = (id: string) =>
    [...(tableRef.current?.querySelectorAll<HTMLElement>('[data-row-id]') ?? [])]
      .find((element) => element.dataset.rowId === id)
      ?.querySelector<HTMLElement>('button[aria-haspopup="menu"]') ?? null;
  useLayoutEffect(() => {
    const deleted = waitingForRemoval.current;
    if (deleted === null || rows.some((row) => getRowId(row) === deleted)) return;
    const next =
      focusCandidates.current.map(trigger).find(Boolean) ?? rows.map((row) => trigger(getRowId(row))).find(Boolean);
    if (next) {
      returnFocusRef.current = next;
      next.focus();
      waitingForRemoval.current = null;
    }
  });
  const actions = onRowDelete
    ? (row: T): Array<MoreMenuAction | 'separator'> => [
        ...(rowActions?.(row) ?? []),
        {
          label: labels?.deleteRow ?? t('common.delete'),
          destructive: true,
          onSelect: () => {
            const id = getRowId(row);
            returnFocusRef.current = trigger(id);
            setTarget({ row, label: getRowLabel(row) });
            setOpen(true);
          },
        },
      ]
    : rowActions;
  const dialog = target && (
    <div onSubmit={(event) => event.stopPropagation()}>
      <ConfirmDestructive
        triggerLabel={null}
        open={open}
        onOpenChange={setOpen}
        resourceName={target.label}
        title={labels?.deleteRowTitle?.(target.label) ?? t('table.deleteRowTitle', { label: target.label })}
        description={
          labels?.deleteRowDescription?.(target.label) ?? t('table.deleteRowDescription', { label: target.label })
        }
        consequences={[]}
        confirmLabel={labels?.deleteRow ?? t('common.delete')}
        returnFocusRef={returnFocusRef}
        onConfirm={async () => {
          const id = getRowId(target.row);
          const index = rows.findIndex((row) => getRowId(row) === id);
          const candidates = [...rows.slice(index + 1), ...rows.slice(0, index).reverse()].map(getRowId);
          await onRowDelete?.(target.row);
          focusCandidates.current = candidates;
          waitingForRemoval.current = id;
          returnFocusRef.current = candidates.map(trigger).find(Boolean) ?? tableRef.current;
        }}
      />
    </div>
  );
  return { actions, dialog };
}
