import { StackedLayout, useI18n } from '@gntik-ai/ui';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../data-table-utils';
import { generateDeployments } from '../fixtures';

const COLUMNS = 12;
const runs = generateDeployments(30);
type Reading = { id: string } & Record<`m${number}`, number>;
const readings: Reading[] = Array.from({ length: 40 }, (_, row) => ({
  id: `event-${row + 1}`,
  ...Object.fromEntries(Array.from({ length: COLUMNS }, (_, col) => [`m${col}`, (row + 1) * (col + 3)])),
}));
const WIDTHS = Object.fromEntries(Array.from({ length: COLUMNS }, (_, col) => [`m${col}`, 160]));

/**
 * StackedLayout scrolls its root under a 60 px sticky header, so its tables use `stickyHeaderOffset={60}`.
 * The first fits the page and pins under the header. The second has twelve 160 px columns, wider than
 * the frame: it scrolls in a bounded, focusable region whose horizontal scrollbar stays on screen.
 */
export default function StickyHeaderStackedExample() {
  const { t } = useI18n();
  const columns: Array<DataTableColumn<Reading>> = Array.from({ length: COLUMNS }, (_, col) => ({
    id: `m${col}`,
    header: t('table.example.stickyMetric', { number: col + 1 }),
    accessor: (row) => row[`m${col}`],
    align: 'right',
    width: 160,
  }));
  return (
    <div className="h-[480px] overflow-hidden rounded-lg border border-border">
      <StackedLayout
        width="full"
        brand={<span className="px-2 text-[13px] font-semibold">{t('table.example.stickyBrand')}</span>}
        navLabel={t('table.example.stickyNavigation')}
      >
        <div className="space-y-8">
          <DataTable
            rows={runs}
            paginated={false}
            caption={t('table.example.stickyRuns')}
            showCaption
            stickyHeader
            stickyHeaderOffset={60}
          />
          <DataTable
            rows={readings}
            columns={columns}
            defaultColumnWidths={WIDTHS}
            selectionMode="none"
            paginated={false}
            caption={t('table.example.stickyAudit')}
            showCaption
            stickyHeader
            stickyHeaderOffset={60}
          />
        </div>
      </StackedLayout>
    </div>
  );
}
