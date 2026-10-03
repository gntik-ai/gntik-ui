import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import NotificationInboxPage from './Page';

describe('NotificationInboxPage', () => {
  it('renders the console, the inbox list and the empty detail', { timeout: 15000 }, async () => {
    render(<NotificationInboxPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Notifications' })).toBeInTheDocument();
    const list = screen.getByRole('list', { name: 'Notifications' });
    expect(within(list).getAllByRole('button')).toHaveLength(6);
    expect(screen.getByRole('heading', { name: 'Select a notification' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('opens a notification, marks it read and filters by unread', { timeout: 15000 }, async () => {
    const onReadChange = vi.fn();
    render(<NotificationInboxPage onReadChange={onReadChange} />);
    const list = screen.getByRole('list', { name: 'Notifications' });
    await userEvent.click(within(list).getByRole('button', { name: /Budget alert/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'Budget alert: api-gateway at 97%' })).toBeInTheDocument();
    expect(onReadChange).toHaveBeenCalledWith('ntf_01', true);

    await userEvent.click(screen.getByRole('button', { name: /^Unread/ }));
    const unread = screen.getByRole('list', { name: 'Notifications' });
    expect(within(unread).getAllByRole('button')).toHaveLength(2);

    await userEvent.click(screen.getAllByRole('button', { name: 'Mark all as read' })[0]!);
    expect(screen.getByRole('heading', { name: 'You’re all caught up' })).toBeInTheDocument();
  });
});
