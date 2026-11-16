import { useI18n } from '@gntik-ai/ui';
import { StickyActionBar } from '../../page-chrome/StickyActionBar/StickyActionBar';
import type { DataTableLabels } from './labels';
import type { RowEdits } from './use-row-edits';

export function RowEditBar<T>({ edits, labels }: { edits: RowEdits<T>; labels?: Partial<DataTableLabels> }) {
  const { t, formatNumber } = useI18n();
  return (
    <StickyActionBar
      dirty={edits.changedCount > 0}
      hideWhenClean
      saving={edits.savingAll}
      dirtyMessage={
        labels?.rowsChanged?.(edits.changedCount) ?? t('table.rowsChanged', { count: formatNumber(edits.changedCount) })
      }
      saveLabel={labels?.saveAll ?? t('table.saveAll')}
      cancelLabel={labels?.discardAll ?? t('table.discardAll')}
      onSave={() => {
        void edits.saveAll();
      }}
      onCancel={edits.discardAll}
    />
  );
}
