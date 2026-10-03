import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import NotificationsEmpty from './examples/NotificationsEmpty';
import NotificationsInbox from './examples/NotificationsInbox';
import { formatRelativeShort } from './relative-time';

async function openInbox() {
  const user = userEvent.setup();
  render(<NotificationsInbox />);
  const bell = screen.getByRole('button', { name: 'Notifications, 3 unread' });
  await user.tab();
  expect(bell).toHaveFocus();
  await user.keyboard('{Enter}');
  const dialog = await screen.findByRole('dialog');
  return { user, bell, dialog };
}

describe('NotificationsPopover', () => {
  it('formats short relative times', () => {
    const now = new Date('2026-10-03T12:00:00Z');
    expect(formatRelativeShort(new Date('2026-10-03T11:59:40Z'), now)).toBe('just now');
    expect(formatRelativeShort(new Date('2026-10-03T11:55:00Z'), now)).toBe('5m ago');
    expect(formatRelativeShort(new Date('2026-10-03T09:00:00Z'), now)).toBe('3h ago');
    expect(formatRelativeShort('2026-10-01T12:00:00Z', now)).toBe('2d ago');
    expect(formatRelativeShort(new Date('2026-10-03T12:10:00Z'), now)).toBe('in 10m');
    expect(formatRelativeShort(new Date('2026-08-01T12:00:00Z'), now)).toBe('Aug 1');
  });

  it('Enter on the bell opens the panel with the list and relative times', async () => {
    const { dialog } = await openInbox();
    expect(within(dialog).getByText('Notifications')).toBeInTheDocument();
    const list = within(dialog).getByRole('list', { name: 'Notifications' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    expect(within(list).getByText('2m ago')).toBeInTheDocument();
    expect(within(list).getByText('1d ago')).toBeInTheDocument();
  });

  it('Tab reaches rows; Enter on a row marks it read', async () => {
    const { user, dialog } = await openInbox();
    const markAll = within(dialog).getByRole('button', { name: 'Mark all as read' });
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    markAll.focus();
    await user.tab();
    const first = within(dialog).getByRole('button', { name: /api-gateway reached/ });
    expect(first).toHaveFocus();
    expect(first).toHaveTextContent('Unread:');
    await user.keyboard('{Enter}');
    expect(first).not.toHaveTextContent('Unread:');
    expect(screen.getByRole('button', { name: 'Notifications, 2 unread' })).toBeInTheDocument();
  });

  it('mark all as read clears the badge and hides the action', async () => {
    const { user, dialog } = await openInbox();
    await user.click(within(dialog).getByRole('button', { name: 'Mark all as read' }));
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Mark all as read' })).not.toBeInTheDocument();
  });

  it('Escape closes the panel and returns focus to the bell', async () => {
    const { user, bell } = await openInbox();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(bell).toHaveFocus();
  });

  it('shows the empty state', async () => {
    const user = userEvent.setup();
    render(<NotificationsEmpty />);
    await user.click(screen.getByRole('button', { name: 'Notifications' }));
    expect(await screen.findByText("You're all caught up")).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('open inbox has no axe violations', async () => {
    await openInbox();
    await expectNoAxeViolations();
  });
});
