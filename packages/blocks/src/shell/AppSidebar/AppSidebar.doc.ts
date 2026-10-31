import type { ComponentDoc } from '@gntik-ai/ui';
import { meta } from './block.meta';

export const doc: ComponentDoc = {
  name: 'AppSidebar',
  group: 'Navigation',
  status: 'beta',
  description:
    `${meta.description} Optional tenants render before the workspace control using the kit Select. ` +
    'tenantLabel and tenantEmptyText customize its name and empty placeholder; clearing reports null. ' +
    'workspaceLabel and workspaceEmptyText customize the workspace popup and search results. ' +
    'hideWorkspaceContext hides both controls, contextStatus and the region, preserving brand or Logo. ' +
    'contextRegionLabel opts into a named section; without it, controls and contextStatus have no extra wrapper. ' +
    'The consumer owns contextBusy and must reset it when loading completes. The collapsed rail hides context; ' +
    'expand the sidebar or open its mobile drawer to switch tenants. brand replaces Logo in either state. ' +
    'userMenuChildren adds popup content alongside userMenuItems; usage=null and helpHref="" hide usage and help. ' +
    'ConsoleShell forwards these props and also shows brand in the mobile topbar. See the five Sidebar shell examples.',
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
