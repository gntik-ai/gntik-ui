import { RESOURCE_CARDS, type DataTableColumn, type PageToolbarView, type ResourceCard } from '@gntik-ai/blocks';
import { LayoutGrid, Table2 } from '@gntik-ai/icons';
import { StatusTag, type BreadcrumbItem } from '@gntik-ai/ui';
import { createElement } from 'react';

export const galleryItems: ResourceCard[] = RESOURCE_CARDS;

export const galleryBreadcrumbs: BreadcrumbItem[] = [{ label: 'Overview', href: '/overview' }, { label: 'Projects', href: '/projects' }, { label: 'Resources' }];

export const galleryViews: PageToolbarView[] = [
  { value: 'grid', label: 'Grid view', icon: LayoutGrid },
  { value: 'table', label: 'Table view', icon: Table2 },
];

/** Table columns for the same cards (the alternate view). */
export const galleryColumns: DataTableColumn<ResourceCard>[] = [
  { id: 'name', header: 'Name', accessor: (r) => r.name, sortable: true, hideable: false, className: 'font-semibold' },
  { id: 'description', header: 'Description', accessor: (r) => r.description, className: 'text-muted-foreground' },
  { id: 'status', header: 'Status', accessor: (r) => r.status, cell: (r) => (r.status ? createElement(StatusTag, { status: r.status }) : null), sortable: true },
  { id: 'cost', header: 'Cost 30d', accessor: (r) => r.meta?.find((m) => m.label === 'Cost 30d')?.value, align: 'right', className: 'font-mono text-[12.5px]' },
];

/** Case-insensitive search over name and description. */
export function searchResources(items: readonly ResourceCard[], query: string): ResourceCard[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...items];
  return items.filter((i) => i.name.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q));
}
