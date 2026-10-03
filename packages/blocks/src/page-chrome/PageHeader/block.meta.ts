import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Page header',
  family: 'page-chrome',
  status: 'beta',
  description:
    'Screen header with breadcrumb, title and status, description, meta row, actions that fold into a MoreMenu on small screens, and optional navigation tabs.',
  uses: ['Breadcrumbs', 'Button', 'MoreMenu', 'StatusTag', 'Tabs'],
};
