import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import { LinkProvider } from '@gntik-ai/ui';
import type { ComponentPropsWithRef } from 'react';
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

  it('Open goes through the LinkProvider router link', { timeout: 15000 }, async () => {
    const RouterLink = ({ href, ...props }: ComponentPropsWithRef<'a'>) => <a data-router="" href={href} {...props} />;
    render(
      <LinkProvider component={RouterLink}>
        <NotificationInboxPage defaultSelectedId="ntf_01" />
      </LinkProvider>,
    );
    const list = screen.getByRole('list', { name: 'Notifications' });
    await userEvent.click(within(list).getByRole('button', { name: /Budget alert/ }));
    const open = screen.getByRole('button', { name: 'Open' });
    expect(open.tagName).toBe('A');
    expect(open).toHaveAttribute('data-router');
    expect(open.getAttribute('href')).toBeTruthy();
  });
});
