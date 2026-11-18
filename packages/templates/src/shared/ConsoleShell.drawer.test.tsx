import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NavGroup, NavItem } from '@gntik-ai/ui';
import { useState } from 'react';
import { expectNoAxeViolations } from '../test/a11y';
import { ConsoleShell } from './ConsoleShell';

const nav: NavGroup[] = [
  {
    items: [
      { label: 'Overview', href: '/overview' },
      { label: 'Projects', href: '/projects' },
      { label: 'Billing', href: '/billing', disabled: true },
    ],
  },
];

function Stateful({ onNavigate }: { onNavigate?: (item: NavItem) => void }) {
  const [href, setHref] = useState('/overview');
  return (
    <ConsoleShell
      nav={nav}
      currentHref={href}
      onNavigate={(item) => {
        setHref(item.href ?? '');
        onNavigate?.(item);
      }}
    >
      Content
    </ConsoleShell>
  );
}

async function openDrawer(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Open navigation' }));
  return screen.findByRole('dialog', { name: 'Sidebar' });
}

describe('ConsoleShell navigation clicks', () => {
  it('closes the mobile drawer and reports the clicked item once', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <ConsoleShell nav={nav} onNavigate={onNavigate}>
        Content
      </ConsoleShell>,
    );
    const drawer = await openDrawer(user);
    await expectNoAxeViolations();
    await user.click(within(drawer).getByRole('link', { name: 'Projects' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Sidebar' })).toBeNull());
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ label: 'Projects', href: '/projects' }));
  });

  it('marks the clicked item current in the desktop sidebar after the drawer closes', async () => {
    const user = userEvent.setup();
    render(<Stateful />);
    const drawer = await openDrawer(user);
    await user.click(within(drawer).getByRole('link', { name: 'Projects' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Sidebar' })).toBeNull());
    const sidebar = screen.getByRole('complementary');
    expect(within(sidebar).getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page');
    expect(within(sidebar).getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current');
  });

  it('reports desktop sidebar clicks once without opening a drawer or changing the rail', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <ConsoleShell nav={nav} onNavigate={onNavigate}>
        Content
      </ConsoleShell>,
    );
    const sidebar = screen.getByRole('complementary');
    await user.click(within(sidebar).getByRole('link', { name: 'Projects' }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ label: 'Projects', href: '/projects' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(within(sidebar).getByRole('link', { name: 'Projects' })).toBeInTheDocument();
  });

  it('closes the drawer without an onNavigate prop', async () => {
    const user = userEvent.setup();
    render(<ConsoleShell nav={nav}>Content</ConsoleShell>);
    const drawer = await openDrawer(user);
    await user.click(within(drawer).getByRole('link', { name: 'Overview' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Sidebar' })).toBeNull());
  });

  it('keeps the drawer open and skips onNavigate for a disabled item', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <ConsoleShell nav={nav} onNavigate={onNavigate}>
        Content
      </ConsoleShell>,
    );
    const drawer = await openDrawer(user);
    await user.click(within(drawer).getByRole('link', { name: 'Billing' }));
    expect(onNavigate).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Sidebar' })).toBeInTheDocument();
  });
});
