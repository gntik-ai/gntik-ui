import type { ReactNode } from 'react';
import { GripVertical } from '@gntik-ai/icons';
import {
  LiveAnnouncer,
  useHasLiveAnnouncer,
  cn,
  IconButton,
  TableCell,
  TableHead,
  useI18n,
  type UseSortableResult,
} from '@gntik-ai/ui';
import type { CellLayout } from './column-sizing';
import { stickyTint } from './column-sizing';

export interface RowReorder<T> {
  sortable: UseSortableResult;
  disabled: boolean;
  isRowReorderable?: (row: T) => boolean;
  hintId: string;
}

export function ReorderHeader({ layout }: { layout?: CellLayout }) {
  const { t } = useI18n();
  return (
    <TableHead
      className={cn(
        'w-10 px-1',
        layout?.className,
        layout?.pinned && 'z-sticky-pinned',
        stickyTint(layout, { head: true }),
      )}
      style={layout?.style}
    >
      <span className="sr-only">{t('table.reorder')}</span>
    </TableHead>
  );
}

export function ReorderCell<T>({
  row,
  id,
  label,
  reorder,
  layout,
}: {
  row: T;
  id: string;
  label: string;
  reorder: RowReorder<T>;
  layout?: CellLayout;
}) {
  const { t } = useI18n();
  const disabled = reorder.disabled || reorder.isRowReorderable?.(row) === false;
  const props = reorder.sortable.getHandleProps(id);
  return (
    <TableCell className={cn('w-10 px-1 py-0', layout?.className, stickyTint(layout))} style={layout?.style}>
      <IconButton
        {...props}
        icon={GripVertical}
        label={t('table.reorderRow', { label })}
        size="sm"
        variant="ghost"
        disabled={disabled}
        aria-describedby={reorder.hintId}
        className="cursor-grab touch-pan-y"
      />
    </TableCell>
  );
}

export function ReorderAnnouncer({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const hasAnnouncer = useHasLiveAnnouncer();
  return enabled && !hasAnnouncer ? <LiveAnnouncer>{children}</LiveAnnouncer> : children;
}
