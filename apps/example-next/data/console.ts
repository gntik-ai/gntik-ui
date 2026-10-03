import type { ConsoleShellProps } from '@gntik-ai/templates';
import { nav, user, workspaces } from './shell';

/** ConsoleShell props shared by every console route; `currentHref` marks the active nav item. */
export const shellFor = (currentHref: string): Omit<ConsoleShellProps, 'children'> => ({
  nav,
  user,
  workspaces,
  currentHref,
  storageKey: 'example-next-sidebar',
});
