import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'App sidebar',
  family: 'shell',
  status: 'beta',
  description:
    'Application sidebar: workspace switcher (or logo) header, NavList body with icon-rail support, and a footer with plan usage, help link and user menu. Exposes header / nav / footer parts for the SidebarLayout slots.',
  uses: ['WorkspaceSwitcher', 'Logo', 'NavList', 'Meter', 'Link', 'UserMenu'],
};
