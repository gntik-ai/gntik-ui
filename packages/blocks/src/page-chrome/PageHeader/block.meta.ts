import type { BlockMeta } from '../../meta';
import type { PageHeaderLabels } from './PageHeader';

export const meta: BlockMeta = {
  name: 'Page header',
  family: 'page-chrome',
  status: 'beta',
  description:
    'Screen header with breadcrumb, title and status, description, meta row, actions that fold into a MoreMenu on small screens, and optional navigation tabs. titleRef targets the h1 for titleRef.current.focus(), adding tabIndex=-1 only when supplied so the title stays outside the Tab order. In a StatusLayout heading slot use as="div" and disable breadcrumb, meta, tabs, actions, status and description fixtures; the slot supplies the page’s only h1. The tablist name follows I18nProvider (en/es); the Spanish preview keeps caller content unchanged. Optional labels?: Partial<PageHeaderLabels> overrides each built-in label. Explicit content props win over labels, then I18nProvider (en/es); no provider keeps English. Imported fixtures and machine data stay unchanged. See the Catalog labels live preview.',
  labels: [
    { key: 'title', type: 'string', state: 'Heading; explicit title prop wins, including null' },
    { key: 'description', type: 'string', state: 'Description; explicit description prop wins, including null' },
    { key: 'moreActions', type: 'string', state: 'Compact actions menu name' },
    { key: 'sections', type: 'string', state: 'Tablist name' },
  ] satisfies Array<{ key: keyof PageHeaderLabels; type: string; state: string }>,
  uses: ['Breadcrumbs', 'Button', 'MoreMenu', 'StatusTag', 'Tabs'],
};
