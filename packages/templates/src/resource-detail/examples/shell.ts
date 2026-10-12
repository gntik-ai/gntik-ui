import type { ConsoleShellProps } from '../../shared/ConsoleShell';

/** Explicit frame props prevent ConsoleShell's editable-demo fixtures from appearing. */
export const shell: Omit<ConsoleShellProps, 'children'> = {
  nav: [],
  breadcrumbs: [],
  workspaces: null,
  user: null,
  usage: null,
  helpHref: null,
  topbar: { environment: null, search: null, notifications: null, theme: null },
};
