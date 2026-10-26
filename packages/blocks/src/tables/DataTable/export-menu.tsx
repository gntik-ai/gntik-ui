import { Download } from 'lucide-react';
import { Button, Menu, MenuTrigger, MenuContent, MenuItem, useI18n } from '@gntik-ai/ui';
import type { DataTableExportRequest } from './data-table-props';
import type { DataTableLabels } from './labels';

export function ExportMenu({
  count,
  selectedCount,
  scopes,
  busy,
  onExport,
  onCopy,
  labels,
}: {
  count: number;
  selectedCount: number;
  scopes: readonly string[];
  busy: boolean;
  onExport: (scope: DataTableExportRequest['scope']) => void;
  onCopy?: () => void;
  labels?: Partial<DataTableLabels>;
}) {
  const { t, formatNumber } = useI18n();
  return (
    <Menu>
      <MenuTrigger
        disabled={busy}
        aria-busy={busy || undefined}
        render={<Button variant="secondary" size="sm" icon={Download} loading={busy} />}
      >
        {labels?.export ?? t('table.export')}
      </MenuTrigger>
      <MenuContent align="end">
        {scopes.includes('rows') && (
          <MenuItem disabled={busy} onClick={() => onExport('rows')}>
            {labels?.exportAll?.(count) ?? t('table.exportAll', { count: formatNumber(count) })}
          </MenuItem>
        )}
        {scopes.includes('page') && (
          <MenuItem disabled={busy} onClick={() => onExport('page')}>
            {labels?.exportPage ?? t('table.exportPage')}
          </MenuItem>
        )}
        {scopes.includes('selected') && selectedCount > 0 && (
          <MenuItem disabled={busy} onClick={() => onExport('selected')}>
            {labels?.exportSelected?.(selectedCount) ??
              t('table.exportSelected', { count: formatNumber(selectedCount) })}
          </MenuItem>
        )}
        {scopes.includes('selected') && selectedCount > 0 && onCopy && (
          <MenuItem disabled={busy} onClick={onCopy}>
            {labels?.copySelected ?? t('table.copySelected')}
          </MenuItem>
        )}
      </MenuContent>
    </Menu>
  );
}
