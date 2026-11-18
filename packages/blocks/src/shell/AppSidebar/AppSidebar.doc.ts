import type { ComponentDoc } from '@gntik-ai/ui';
import { meta } from './block.meta';

export const doc: ComponentDoc = {
  name: 'AppSidebar',
  group: 'Navigation',
  status: 'beta',
  description:
    `${meta.description} Optional tenants render before the workspace control using the kit Select. ` +
    'tenantLabel names it; tenantPlaceholder customizes the unselected placeholder (default Select tenant), ' +
    'while tenantEmptyText is used for an empty list; clearing reports null. ' +
    'workspaceLabel and workspaceEmptyText customize the workspace popup and search results. ' +
    'An empty workspaces array with workspaceEmptyText keeps the switcher instead of Logo; ' +
    'its empty message is disabled and Create workspace appears only with onCreateWorkspace. ' +
    'Without workspaceEmptyText, an empty array or null keeps the existing Logo/brand fallback. ' +
    'hideWorkspaceContext hides both controls, contextStatus and the region, preserving brand or Logo. ' +
    'contextRegionLabel opts into a named section; without it, controls and contextStatus have no extra wrapper. ' +
    'The consumer owns contextBusy and must reset it when loading completes. The collapsed rail hides context; ' +
    'expand the sidebar or open its mobile drawer to switch tenants. brand replaces Logo in either state. ' +
    'userMenuChildren adds popup content alongside userMenuItems; userMenuShowTheme=false hides the footer Theme item. ' +
    'usage=null and helpHref="" hide usage and help. navLabel names the navigation landmark (default Main). ' +
    'ConsoleShell forwards these props to both sidebar and mobile drawer and shows brand in the mobile topbar. ' +
    'Its topbar.user overrides the shared user only when defined; null hides that menu, while undefined shares user. ' +
    'A nav click in ConsoleShell closes the mobile drawer and calls its optional onNavigate with the clicked item. ' +
    'See the Sidebar shell examples for tenant placeholders, empty workspaces and a single account menu.',
  primitive: 'Select, WorkspaceSwitcher, NavList and UserMenu from @gntik-ai/ui',
  pattern: 'Optional named context region, select-only combobox, navigation and account menu',
  keyboard: [
    ['Tab', 'Tenant picker and its clear control, then workspace picker, then navigation'],
    ['Enter / Space', 'Open the focused tenant or workspace picker, or account menu'],
    ['ArrowDown / ArrowUp', 'Move through the open picker or menu'],
    ['Enter', 'Select the highlighted item'],
    ['Escape', 'Close the popup and return focus to its trigger'],
    ['Delete / Backspace', 'On a selected tenant trigger, clear to the platform-wide context'],
  ],
  tokens: ['chrome', 'card', 'border', 'foreground', 'muted-foreground', 'focus-ring'],
};
