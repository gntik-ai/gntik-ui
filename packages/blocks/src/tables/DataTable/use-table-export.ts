import { copyToClipboard, downloadFile, toCsv, useI18n } from '@gntik-ai/ui';
import { useRef, useState, type KeyboardEvent } from 'react';
import type { DataTableCsvExportOptions, DataTableExportRequest } from './data-table-props';
import type { DataTableColumn, SortState } from './data-table-utils';
import type { DataTableLabels } from './labels';

export function useTableExport<T>(options: {
  csvExport: boolean | DataTableCsvExportOptions;
  onExport?: (request: DataTableExportRequest) => void | Promise<void>;
  serverMode: boolean;
  caption: string;
  columns: ReadonlyArray<DataTableColumn<T>>;
  sortedRows: readonly T[];
  pageRows: readonly T[];
  selectedIds: readonly string[];
  getRowId: (row: T) => string;
  sort: SortState | null;
  filters: unknown;
  labels?: Partial<DataTableLabels>;
}) {
  const { t } = useI18n();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const enabled = !!options.csvExport && (!options.serverMode || !!options.onExport);
  const config = typeof options.csvExport === 'object' ? options.csvExport : {};
  const columns = enabled
    ? options.columns.filter((column) => column.exportable !== false && (column.accessor || column.exportValue))
    : [];
  const fileName =
    config.fileName ??
    `${
      options.caption
        .toLowerCase()
        .normalize('NFKD')
        .replace(/\p{M}/gu, '')
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-|-$/g, '') || 'table'
    }.csv`;
  const selected = new Set(enabled && !options.serverMode ? options.selectedIds : []);
  const selectedRows = selected.size ? options.sortedRows.filter((row) => selected.has(options.getRowId(row))) : [];
  const csvColumns = columns.map((column) => ({
    header: column.header,
    value: (row: T) => column.exportValue?.(row) ?? column.accessor?.(row),
  }));
  const scopes = config.scopes ?? ['rows', 'page', 'selected'];
  const copySelected = async () => {
    if (!enabled || options.serverMode) return;
    setAnnouncement('');
    try {
      await copyToClipboard(toCsv(selectedRows, csvColumns, { delimiter: '\t' }));
      setAnnouncement(options.labels?.copiedToClipboard ?? t('common.copiedToClipboard'));
    } catch {
      setAnnouncement(options.labels?.copyFailed ?? t('common.copyFailed'));
    }
  };
  const onCopyKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      !enabled ||
      options.serverMode ||
      !scopes.includes('selected') ||
      selectedRows.length === 0 ||
      pending.current ||
      event.defaultPrevented ||
      event.altKey ||
      !(event.ctrlKey || event.metaKey) ||
      event.key.toLowerCase() !== 'c'
    )
      return;
    const target = event.target;
    if (
      !(target instanceof HTMLElement) ||
      !target.closest('table') ||
      target.closest('input, textarea, select') ||
      target.isContentEditable
    )
      return;
    const editable = target.closest('[contenteditable]');
    if (editable && editable.getAttribute('contenteditable') !== 'false') return;
    if (window.getSelection()?.isCollapsed === false) return;
    event.preventDefault();
    void copySelected();
  };
  return {
    busy,
    selectedRowCount: selectedRows.length,
    announcement,
    copySelected,
    onCopyKeyDown,
    enabled,
    scopes,
    exportRows: async (scope: DataTableExportRequest['scope']) => {
      if (pending.current) return;
      if (options.onExport) {
        pending.current = true;
        setBusy(true);
        try {
          await options.onExport({
            scope,
            columns: columns.map((column) => column.id),
            selectedIds: [...options.selectedIds],
            sort: options.sort,
            filters: options.filters,
          });
        } catch {
          // Delegated exports own their error feedback; always release the menu for retry.
        } finally {
          pending.current = false;
          setBusy(false);
        }
        return;
      }
      const rows = scope === 'rows' ? options.sortedRows : scope === 'page' ? options.pageRows : selectedRows;
      downloadFile(toCsv(rows, csvColumns, { bom: true }), fileName, 'text/csv;charset=utf-8');
    },
  };
}
