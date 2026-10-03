import { DataTable, NoResultsEmpty, PageHeader, PageToolbar, ResourceCardGrid, type ResourceAction, type ResourceCard } from '@gntik-ai/blocks';
import { Plus } from '@gntik-ai/icons';
import { Page, Section, Stack, type BreadcrumbItem } from '@gntik-ai/ui';
import { useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import { galleryBreadcrumbs, galleryColumns, galleryItems, galleryViews, searchResources } from './data';

export type GalleryView = 'grid' | 'table';

export interface ResourceGalleryProps {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  /** Initial cards; the page keeps its own copy so the demo Delete takes effect. */
  items: readonly ResourceCard[];
  defaultView: GalleryView;
  onViewChange: (view: GalleryView) => void;
  createLabel: string;
  onCreate: () => void;
  /** Card menu actions. Without it, Delete removes the card locally. */
  onAction: (action: ResourceAction, item: ResourceCard) => void;
  shell: Omit<ConsoleShellProps, 'children'>;
}

/** Resource gallery: toolbar with search and a grid/table view toggle over the same resources. */
export default function ResourceGalleryPage({
  title = 'Resources',
  description = 'Services, databases and jobs that make up this project.',
  breadcrumbs = galleryBreadcrumbs,
  items: initialItems = galleryItems,
  defaultView = 'grid',
  onViewChange,
  createLabel = 'New resource',
  onCreate,
  onAction,
  shell,
}: Partial<ResourceGalleryProps>) {
  const [items, setItems] = useState<readonly ResourceCard[]>(initialItems);
  const [view, setView] = useState<GalleryView>(defaultView);
  const [query, setQuery] = useState('');
  const visible = searchResources(items, query);

  const handleAction = (action: ResourceAction, item: ResourceCard) => {
    if (onAction) onAction(action, item);
    else if (action === 'delete') setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  return (
    <ConsoleShell currentHref="/projects" breadcrumbs={breadcrumbs} {...shell}>
      <Page
        width="wide"
        header={<PageHeader breadcrumbs={null} title={title} description={description} status="" meta={[]} tabs={null} actions={[]} />}
      >
        <Stack gap={5}>
          <PageToolbar
            aria-label="Resources toolbar"
            search={query}
            onSearchChange={setQuery}
            searchLabel="Search resources"
            searchPlaceholder="Search resources…"
            // PageToolbar falls back to a "Filters" button for null/undefined; an empty fragment hides it.
            filters={<></>}
            views={galleryViews}
            view={view}
            onViewChange={(next) => {
              const v: GalleryView = next === 'table' ? 'table' : 'grid';
              setView(v);
              onViewChange?.(v);
            }}
            primaryAction={{ label: createLabel, icon: Plus, onClick: onCreate }}
          />
          <Section title="All resources" description={`${visible.length} of ${items.length} shown`}>
            {visible.length === 0 ? (
              <NoResultsEmpty entity="resources" query={query} filterCount={0} onClearSearch={() => setQuery('')} titleAs="h3" bordered />
            ) : view === 'grid' ? (
              <ResourceCardGrid items={visible} label="Resources" onAction={handleAction} />
            ) : (
              <DataTable<ResourceCard>
                rows={visible}
                columns={galleryColumns}
                caption="Resources"
                selectable={false}
                paginated={false}
                showDensityToggle={false}
                rowActions={(item) => [
                  { label: 'Open', onSelect: () => handleAction('open', item) },
                  'separator',
                  { label: 'Delete', destructive: true, onSelect: () => handleAction('delete', item) },
                ]}
              />
            )}
          </Section>
        </Stack>
      </Page>
    </ConsoleShell>
  );
}
