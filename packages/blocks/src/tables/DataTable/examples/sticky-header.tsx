import { SidebarLayout, useI18n } from '@gntik-ai/ui';
import { DataTable } from '../DataTable';
import { generateDeployments } from '../fixtures';

const runs = generateDeployments(60);
const recent = generateDeployments(40);

/**
 * Two ways to keep the header in view. In a SidebarLayout, `stickyHeader` pins it under the topbar
 * (offset 0) while main scrolls. Below it, `maxHeight` bounds the body of a card to 320 px, with the
 * first column pinned.
 */
export default function StickyHeaderExample() {
  const { t } = useI18n();
  return (
    <div className="space-y-8">
      <div role="group" aria-label={t('table.example.stickySidebarTitle')} className="space-y-2">
        <p className="text-[13px] font-medium text-foreground">{t('table.example.stickySidebarTitle')}</p>
        <div className="h-[420px] overflow-hidden rounded-lg border border-border">
          <SidebarLayout
            collapsible={false}
            sidebar={<p className="text-[13px]">{t('table.example.stickyNavigation')}</p>}
            topbar={<span className="text-[13px] font-medium">{t('table.example.stickyBrand')}</span>}
            mainLabel={t('table.example.stickySidebarMain')}
          >
            <div className="p-4">
              <DataTable
                rows={runs}
                paginated={false}
                caption={t('table.example.stickyRuns')}
                showCaption
                stickyHeader
              />
            </div>
          </SidebarLayout>
        </div>
      </div>
      <div role="group" aria-label={t('table.example.stickyBoundedTitle')} className="space-y-2">
        <p className="text-[13px] font-medium text-foreground">{t('table.example.stickyBoundedTitle')}</p>
        <DataTable
          rows={recent}
          paginated={false}
          caption={t('table.example.stickyRecent')}
          showCaption
          maxHeight={320}
          defaultPinnedColumns={{ left: ['name'] }}
        />
      </div>
    </div>
  );
}
