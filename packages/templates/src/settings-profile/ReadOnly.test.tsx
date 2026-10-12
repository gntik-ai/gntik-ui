import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import SettingsProfilePage from './Page';
import ReadOnlyExample from './examples/ReadOnly';

describe('SettingsProfilePage read-only', () => {
  it('Tab visits section navigation and caller links without content actions', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SettingsProfilePage
        mode="read-only"
        identity={[{ id: 'contact', label: 'Contact', value: <a href="/contact">Contact support</a> }]}
        roles={[]}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Settings' });
    within(nav)
      .getByRole('button', { name: /^Profile/ })
      .focus();
    for (const name of [
      'Security',
      'Notifications',
      'Appearance',
      'Workspace',
      'Members',
      'Billing',
      'API keys',
      'Integrations',
    ]) {
      await user.tab();
      expect(within(nav).getByRole('button', { name: new RegExp(`^${name}`) })).toHaveFocus();
    }
    // jsdom has no responsive CSS, so both nav variants are present. The browser
    // composition test verifies the desktop path, where this select is hidden.
    await user.tab();
    expect(screen.getByRole('combobox', { name: 'Settings section' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Contact support' })).toHaveFocus();
    await user.tab();
    expect(container.querySelector('#settings-content')).not.toContainElement(document.activeElement as HTMLElement);
  }, 15000);

  it.each(['dark', 'light', 'high_contrast'])(
    'has no axe violations in %s',
    async (theme) => {
      document.documentElement.className = theme;
      const { container } = render(<ReadOnlyExample />);
      await expectNoAxeViolations(container);
    },
    15000,
  );

  it('has no axe violations with an empty roles state', async () => {
    const { container } = render(
      <SettingsProfilePage mode="read-only" roles={[]} emptyRolesMessage="No permissions assigned yet" />,
    );
    await expectNoAxeViolations(container);
  }, 15000);

  it('shows caller empty-state copy when roles are empty', () => {
    render(<SettingsProfilePage mode="read-only" roles={[]} emptyRolesMessage="No permissions assigned yet" />);
    const roles = screen.getByRole('region', { name: 'Roles' });
    expect(within(roles).getByRole('heading', { name: 'No permissions assigned yet', level: 3 })).toBeInTheDocument();
    expect(within(roles).queryByRole('list')).not.toBeInTheDocument();
    expect(within(roles).queryByRole('button')).not.toBeInTheDocument();
  });

  it('omits optional roles and active-context sections when their props are omitted', () => {
    render(<SettingsProfilePage mode="read-only" />);
    expect(screen.queryByRole('heading', { name: 'Roles' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Active context' })).not.toBeInTheDocument();
  });

  it('renders one role badge per assigned role, in caller order', () => {
    render(<SettingsProfilePage mode="read-only" roles={['Viewer', 'Editor', 'Auditor']} />);
    const roles = screen.getByRole('region', { name: 'Roles' });
    expect(
      within(roles)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['Viewer', 'Editor', 'Auditor']);
    expect(roles.querySelectorAll('li > span')).toHaveLength(3);
    expect(within(roles).queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders identity and context as description lists with caller fallback and links', () => {
    const { container } = render(
      <SettingsProfilePage
        mode="read-only"
        identity={[
          { id: 'username', label: 'Username', value: 'avery' },
          { id: 'email', label: 'Email', value: <a href="mailto:avery@example.com">Contact Avery</a> },
          { id: 'phone', label: 'Phone' },
        ]}
        context={[
          { id: 'organization', label: 'Active organization', value: 'Example organization' },
          { id: 'workspace', label: 'Active workspace', value: null },
          { id: 'project', label: 'Active project', value: '' },
        ]}
        contextFallback="Nothing selected"
      />,
    );
    const lists = container.querySelectorAll('dl');
    expect(lists).toHaveLength(2);
    expect(Array.from(lists[0]!.querySelectorAll('dt'), (el) => el.textContent)).toEqual([
      'Username',
      'Email',
      'Phone',
    ]);
    expect(Array.from(lists[0]!.querySelectorAll('dd'), (el) => el.textContent)).toEqual([
      'avery',
      'Contact Avery',
      'Nothing selected',
    ]);
    expect(Array.from(lists[1]!.querySelectorAll('dt'), (el) => el.textContent)).toEqual([
      'Active organization',
      'Active workspace',
      'Active project',
    ]);
    expect(Array.from(lists[1]!.querySelectorAll('dd'), (el) => el.textContent)).toEqual([
      'Example organization',
      'Nothing selected',
      'Nothing selected',
    ]);
    expect(screen.getByRole('link', { name: 'Contact Avery' })).toHaveAttribute('href', 'mailto:avery@example.com');
    expect(screen.queryByRole('button', { name: /copy|edit/i })).not.toBeInTheDocument();
  });

  it('fixture (f): shows the profile without editing controls or a save bar', () => {
    const { container } = render(<SettingsProfilePage mode="read-only" />);
    const content = container.querySelector<HTMLElement>('#settings-content')!;
    expect(screen.getByRole('heading', { level: 1, name: 'Profile' })).toBeInTheDocument();
    expect(within(content).getByRole('heading', { name: 'Avery Collins' })).toBeInTheDocument();
    expect(within(content).queryByRole('textbox')).not.toBeInTheDocument();
    expect(within(content).queryByRole('combobox')).not.toBeInTheDocument();
    expect(content.querySelector('input')).toBeNull();
    expect(within(content).queryByRole('button')).not.toBeInTheDocument();
    expect(content.querySelector('.sticky')).toBeNull();
    expect(content.children).toHaveLength(1);
  });
});
