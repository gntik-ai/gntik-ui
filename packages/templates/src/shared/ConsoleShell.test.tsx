import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import AssistantChatPage from '../assistant-chat/Page';
import AuditLogPage from '../audit-log/Page';
import GettingStartedPage from '../getting-started/Page';
import NotificationInboxPage from '../notification-inbox/Page';
import SearchResultsPage from '../search-results/Page';
import ShellSidebarPage from '../shell-sidebar/Page';
import UpgradeRequiredPage from '../upgrade-required/Page';
import { ConsoleShell, type ConsoleShellProps } from './ConsoleShell';

const workspaces = [
  { id: 'ws_a', name: 'Alpha', plan: 'Pro' },
  { id: 'ws_b', name: 'Beta', plan: 'Free' },
];

describe('ConsoleShell', () => {
  it('shows the default usage meter and help link', () => {
    render(<ConsoleShell>content</ConsoleShell>);
    expect(screen.getByRole('meter')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Help & docs' })).toBeInTheDocument();
  });

  it('forwards the sidebar header, footer and layout options', { timeout: 15000 }, async () => {
    const onSignOut = vi.fn();
    const onWorkspaceChange = vi.fn();
    render(
      <ConsoleShell
        sidebarLabel="Product sidebar"
        workspaces={workspaces}
        currentWorkspaceId="ws_b"
        onWorkspaceChange={onWorkspaceChange}
        usage={{ label: 'Agent runs', value: 40, max: 100, valueLabel: '40 / 100' }}
        helpHref="/docs"
        helpLabel="Documentation"
        user={{ name: 'Ada Lovelace', email: 'ada@example.com' }}
        userMenuItems={[{ label: 'Billing portal', onSelect: () => {} }]}
        onSignOut={onSignOut}
      >
        content
      </ConsoleShell>,
    );
    expect(screen.getByRole('complementary', { name: 'Product sidebar' })).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'Agent runs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute('href', '/docs');
    expect(screen.getAllByText('Beta').length).toBeGreaterThan(0);
    const [trigger] = screen.getAllByRole('button', { name: /Ada Lovelace/ });
    await userEvent.click(trigger!);
    expect(await screen.findByRole('menuitem', { name: 'Billing portal' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: /Sign out/ }));
    expect(onSignOut).toHaveBeenCalled();
  });

  it('`null` hides the usage meter and the help link', () => {
    render(
      <ConsoleShell usage={null} helpHref={null}>
        content
      </ConsoleShell>,
    );
    expect(screen.queryByRole('meter')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Help & docs' })).toBeNull();
  });

  const pages: Array<[string, ComponentType<{ shell?: Omit<ConsoleShellProps, 'children'> }>]> = [
    ['AssistantChatPage', AssistantChatPage],
    ['AuditLogPage', AuditLogPage],
    ['GettingStartedPage', GettingStartedPage],
    ['NotificationInboxPage', NotificationInboxPage],
    ['SearchResultsPage', SearchResultsPage],
    ['ShellSidebarPage', ShellSidebarPage],
    ['UpgradeRequiredPage', UpgradeRequiredPage],
  ];

  it.each(pages)('%s forwards its `shell` prop', { timeout: 15000 }, (_, Page) => {
    render(<Page shell={{ sidebarLabel: 'Custom sidebar', usage: null, helpHref: null }} />);
    expect(screen.getByRole('complementary', { name: 'Custom sidebar' })).toBeInTheDocument();
    expect(screen.queryByRole('meter')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Help & docs' })).toBeNull();
  });
});
