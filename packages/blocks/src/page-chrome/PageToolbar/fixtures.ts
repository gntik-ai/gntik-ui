import { LayoutGrid, List, Table2 } from '@gntik-ai/icons';
import type { PageToolbarView } from './PageToolbar';

export const pageToolbarViews: PageToolbarView[] = [
  { value: 'table', label: 'Table view', icon: Table2 },
  { value: 'list', label: 'List view', icon: List },
  { value: 'grid', label: 'Grid view', icon: LayoutGrid },
];
