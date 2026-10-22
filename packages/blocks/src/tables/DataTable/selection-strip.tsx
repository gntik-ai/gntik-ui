import { Button, useI18n } from '@gntik-ai/ui';
import type { DataTableLabels } from './labels';

/** The same button stays mounted as the announcement and action change. */
export function SelectionStrip({
  all,
  pageCount,
  total,
  selectedCount = total,
  onSelectAll,
  onClear,
  labels,
}: {
  all: boolean;
  pageCount: number;
  total: number;
  selectedCount?: number;
  onSelectAll: () => void;
  onClear: () => void;
  labels?: Partial<DataTableLabels>;
}) {
  const { t, formatNumber } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/30 px-3 py-2 text-sm text-foreground">
      <span aria-live="polite">
        {all
          ? (labels?.allMatchingSelected?.(selectedCount) ??
            t('table.allMatchingSelected', { count: formatNumber(selectedCount) }))
          : (labels?.pageSelected?.(pageCount) ?? t('table.pageSelected', { count: formatNumber(pageCount) }))}
      </span>
      <Button variant="soft" size="sm" onClick={all ? onClear : onSelectAll}>
        {all
          ? (labels?.clearSelection ?? t('common.clearSelection'))
          : (labels?.selectAllMatching?.(total) ?? t('table.selectAllMatching', { count: formatNumber(total) }))}
      </Button>
    </div>
  );
}
