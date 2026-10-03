import { Archive, Download, Trash2, X } from '@gntik-ai/icons';
import { Toolbar, ToolbarButton, ToolbarEnd, ToolbarSeparator, ToolbarStart, cn } from '@gntik-ai/ui';
import type { PageChromeAction } from '../types';

export interface BulkActionBarProps {
  /** Number of selected rows; the bar renders nothing at 0. */
  selectedCount?: number;
  /** Total rows, shown as "3 of 24 selected". */
  totalCount?: number;
  /** Noun for the count, singular and plural. */
  noun?: [singular: string, plural: string];
  actions?: PageChromeAction[];
  onClear?: () => void;
  clearLabel?: string;
  className?: string;
}

const bulkActionBarDefaultActions: PageChromeAction[] = [
  { label: 'Export', icon: Download },
  { label: 'Archive', icon: Archive },
  { label: 'Delete', icon: Trash2, variant: 'destructive' },
];

/** Contextual toolbar shown while rows are selected: count, bulk actions and clear selection. */
export function BulkActionBar({
  selectedCount = 3,
  totalCount,
  noun = ['item', 'items'],
  actions = bulkActionBarDefaultActions,
  onClear,
  clearLabel = 'Clear selection',
  className,
}: BulkActionBarProps) {
  if (selectedCount <= 0) return null;
  const word = selectedCount === 1 ? noun[0] : noun[1];
  return (
    <Toolbar
      variant="plain"
      aria-label="Bulk actions"
      className={cn('flex-wrap gap-y-2 rounded-lg border border-primary/30 bg-primary/8 px-3 py-2 shadow-sm', className)}
    >
      <ToolbarStart>
        <p role="status" className="text-[13px] font-medium text-foreground">
          <span className="font-mono tabular-nums">{selectedCount.toLocaleString('en-US')}</span>
          {totalCount != null && <span className="text-muted-foreground"> of {totalCount.toLocaleString('en-US')}</span>} {word} selected
        </p>
        <ToolbarSeparator />
        <ToolbarButton icon={X} onClick={onClear}>
          {clearLabel}
        </ToolbarButton>
      </ToolbarStart>
      <ToolbarEnd className="flex-wrap">
        {actions.map((a) => (
          <ToolbarButton
            key={a.id ?? a.label}
            variant={a.variant ?? 'secondary'}
            icon={a.icon}
            disabled={a.disabled}
            onClick={a.onClick}
          >
            {a.label}
          </ToolbarButton>
        ))}
      </ToolbarEnd>
    </Toolbar>
  );
}
