import { Checkbox, cn, TableHead, TableHeader, TableRow, useI18n } from '@gntik-ai/ui';
import type { ReactNode, Ref } from 'react';
import { stickyTint, type CellLayout, type TableLayout } from './column-sizing';
import { ReorderHeader } from './row-reorder';
import type { DataTableLabels } from './labels';
import { useStickyHeadClass } from './use-sticky-header';

/** Shared sticky treatment for the selection, detail and actions headers. */
export function SpecialHead({
  layout,
  className,
  children,
}: {
  layout?: CellLayout;
  className: string;
  children: ReactNode;
}) {
  const stickyClass = useStickyHeadClass(layout);
  return (
    <TableHead
      className={cn(
        className,
        layout?.className,
        layout?.pinned && 'z-sticky-pinned bg-card',
        stickyTint(layout, { head: true }),
        stickyClass,
      )}
      style={layout?.style}
    >
      {children}
    </TableHead>
  );
}

export interface SelectionHeadProps {
  /** Single selection, or select-all hidden: no checkbox, only a screen reader name. */
  named: boolean;
  checkbox?: {
    checked: boolean;
    indeterminate: boolean;
    disabled: boolean;
    onToggle: () => void;
  };
}

/** The header row: optional selection, reorder, detail and actions columns around the data column heads. */
export function DataTableHeaderRow({
  layout,
  labels,
  selection,
  checkboxRef,
  reorder,
  detail,
  actions,
  rowIndex,
  children,
}: {
  layout: TableLayout;
  labels?: Partial<DataTableLabels>;
  selection?: SelectionHeadProps;
  /** The select-all checkbox, which the table focuses after clearing a selection. */
  checkboxRef: Ref<HTMLElement>;
  reorder: boolean;
  detail: boolean;
  actions: boolean;
  rowIndex?: number;
  children: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent" aria-rowindex={rowIndex}>
        {selection && (
          <SpecialHead layout={layout.lead} className="w-10 pe-0">
            {selection.named && <span className="sr-only">{labels?.selection ?? t('table.selection')}</span>}
            {selection.checkbox && (
              <Checkbox
                ref={checkboxRef}
                aria-label={labels?.selectAll ?? t('table.selectAllPage')}
                checked={selection.checkbox.checked}
                indeterminate={selection.checkbox.indeterminate}
                disabled={selection.checkbox.disabled}
                onCheckedChange={selection.checkbox.onToggle}
              />
            )}
          </SpecialHead>
        )}
        {reorder && <ReorderHeader layout={layout.reorder} />}
        {detail && (
          <SpecialHead layout={layout.detail} className="w-10">
            <span className="sr-only">{labels?.details ?? t('table.details')}</span>
          </SpecialHead>
        )}
        {children}
        {actions && (
          <SpecialHead layout={layout.trail} className="w-12">
            <span className="sr-only">{labels?.actions ?? t('table.actions')}</span>
          </SpecialHead>
        )}
      </TableRow>
    </TableHeader>
  );
}
