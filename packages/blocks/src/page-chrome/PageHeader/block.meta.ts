import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Page header',
  family: 'page-chrome',
  status: 'beta',
  description:
    'Screen header with breadcrumb, title and status, description, meta row, actions that fold into a MoreMenu on small screens, and optional navigation tabs. titleRef targets the h1 for titleRef.current.focus(), adding tabIndex=-1 only when supplied so the title stays outside the Tab order. In a StatusLayout heading slot use as="div" and disable breadcrumb, meta, tabs, actions, status and description fixtures; the slot supplies the page’s only h1.',
  uses: ['Breadcrumbs', 'Button', 'MoreMenu', 'StatusTag', 'Tabs'],
};
