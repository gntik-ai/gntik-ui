import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'App topbar',
  family: 'shell',
  status: 'beta',
  description:
    'Topbar contents for the application shell: breadcrumb and environment chip, ⌘K global search, notifications popover, theme control and user menu.',
  uses: ['Breadcrumbs', 'Badge', 'CommandPalette', 'CommandPaletteTrigger', 'NotificationsPopover', 'ThemeCycleButton', 'ThemeSwitcher', 'UserMenu'],
};
