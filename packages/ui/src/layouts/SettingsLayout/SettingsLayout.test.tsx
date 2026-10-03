import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import SettingsLayoutWorkspace from './examples/SettingsLayoutWorkspace';
import { SettingsLayout } from './SettingsLayout';

const GROUPS = [{ label: 'Account', items: [{ id: 'profile', label: 'Profile' }, { id: 'security', label: 'Security' }, { id: 'billing', label: 'Billing' }] }];

describe('SettingsLayout', () => {
  it('renders nav, title and save bar; the first section is current by default', () => {
    const { container } = render(
      <SettingsLayout groups={GROUPS} title="Profile" description="About you" saveBar={<button type="button">Save changes</button>}>
        form
      </SettingsLayout>,
    );
    expect(container.firstElementChild).toHaveClass('h-full');
    const nav = screen.getByRole('navigation', { name: 'Settings' });
    expect(within(nav).getByRole('button', { name: 'Profile' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { level: 1, name: 'Profile' })).toBeInTheDocument();
    expect(within(screen.getByRole('main')).getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('Tab reaches the section nav and Enter opens a section', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SettingsLayout groups={GROUPS} onValueChange={onValueChange} />);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveFocus();
    await user.tab();
    const nav = screen.getByRole('navigation', { name: 'Settings' });
    expect(within(nav).getByRole('button', { name: 'Profile' })).toHaveFocus();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('security', expect.objectContaining({ label: 'Security' }));
    expect(within(nav).getByRole('button', { name: 'Security' })).toHaveAttribute('aria-current', 'page');
  });

  it('the small-screen Select switches sections', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SettingsLayout groups={GROUPS} defaultValue="security" onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Settings section' });
    expect(trigger).toHaveTextContent('Security');
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Billing' }));
    expect(onValueChange).toHaveBeenCalledWith('billing', expect.objectContaining({ id: 'billing' }));
    expect(within(screen.getByRole('navigation', { name: 'Settings' })).getByRole('button', { name: 'Billing' })).toHaveAttribute('aria-current', 'page');
  });

  it('the example swaps content and tracks unsaved changes', async () => {
    const user = userEvent.setup();
    render(<SettingsLayoutWorkspace />);
    const nav = screen.getByRole('navigation', { name: 'Settings' });
    await user.click(within(nav).getByRole('button', { name: 'Notifications' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Notifications' })).toBeInTheDocument();
    await user.click(screen.getByRole('switch', { name: 'Weekly usage digest' }));
    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByText('All changes saved')).toBeInTheDocument();
  });

  it('the example has no axe violations', async () => {
    render(<SettingsLayoutWorkspace />);
    await expectNoAxeViolations();
  });
});

describe('SettingsLayout embedded', () => {
  it('renders no <main> and no skip link inside an app shell', async () => {
    const { container } = render(
      <main>
        <SettingsLayout embedded mainId="settings-content" groups={[{ label: 'Account', items: [{ id: 'profile', label: 'Profile' }] }]} title="Settings">
          <p>Content</p>
        </SettingsLayout>
      </main>,
    );
    expect(container.querySelectorAll('main')).toHaveLength(1);
    expect(screen.queryByRole('link', { name: /skip/i })).not.toBeInTheDocument();
    expect(container.querySelector('#settings-content')).toHaveTextContent('Content');
    await expectNoAxeViolations(container);
  });
});
