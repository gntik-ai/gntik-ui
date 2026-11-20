import type { ReactNode } from 'react';
import { GripVertical } from '@gntik-ai/icons';
import {
  LiveAnnouncer,
  useHasLiveAnnouncer,
  cn,
  IconButton,
  TableCell,
  useI18n,
  type UseSortableResult,
} from '@gntik-ai/ui';
import type { CellLayout } from './column-sizing';
import { stickyTint } from './column-sizing';
import { SpecialHead } from './special-head';

export interface RowReorder<T> {
  sortable: UseSortableResult;
  disabled: boolean;
  isRowReorderable?: (row: T) => boolean;
  hintId: string;
}

export function ReorderHeader({ layout }: { layout?: CellLayout }) {
  const { t } = useI18n();
  return (
    <SpecialHead layout={layout} className="w-10 px-1">
      <span className="sr-only">{t('table.reorder')}</span>
    </SpecialHead>
  );
}

export function ReorderCell<T>({
  row,
  id,
  label,
  reorder,
  layout,
  selected,
}: {
  row: T;
  id: string;
  label: string;
  reorder: RowReorder<T>;
  layout?: CellLayout;
  selected: boolean;
}) {
  const { t } = useI18n();
  const disabled = reorder.disabled || reorder.isRowReorderable?.(row) === false;
  const props = reorder.sortable.getHandleProps(id);
  return (
    <TableCell
      className={cn('w-10 px-1 py-0', layout?.className, stickyTint(layout, { selected }))}
      style={layout?.style}
    >
      <IconButton
        {...props}
        icon={GripVertical}
        label={t('table.reorderRow', { label })}
        size="sm"
        variant="ghost"
        disabled={disabled}
        focusableWhenDisabled={reorder.disabled}
        onKeyDown={disabled ? undefined : props.onKeyDown}
        onPointerDown={disabled ? undefined : props.onPointerDown}
        aria-describedby={reorder.hintId}
        className="cursor-grab touch-pan-y"
      />
    </TableCell>
  );
}

export function ReorderAnnouncer({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const hasAnnouncer = useHasLiveAnnouncer();
  return hasAnnouncer ? children : <LiveAnnouncer enabled={enabled}>{children}</LiveAnnouncer>;
}
