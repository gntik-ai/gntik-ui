import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import WorkspaceSwitcherMenu from './examples/WorkspaceSwitcherMenu';
import WorkspaceSwitcherSearch from './examples/WorkspaceSwitcherSearch';

describe('WorkspaceSwitcher (menu)', () => {
  async function open(key = '{Enter}') {
    const user = userEvent.setup();
    render(<WorkspaceSwitcherMenu />);
    const trigger = screen.getByRole('button', { name: 'Acme Industries, Switch workspace' });
    await user.tab();
    await user.keyboard(key);
    const menu = await screen.findByRole('menu');
    return { user, trigger, menu };
  }

  it.each([['{Enter}'], [' '], ['{ArrowDown}']])('opens with %s and marks the current workspace', async (key) => {
    const { menu, trigger } = await open(key);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(menu).getByRole('menuitemradio', { name: /Acme Industries/ })).toHaveAttribute('aria-checked', 'true');
    expect(within(menu).getByRole('menuitemradio', { name: /Design Team/ })).toHaveAttribute('aria-checked', 'false');
  });

  it('arrow keys move and Enter switches workspace and closes', async () => {
    const { user, menu, trigger } = await open();
    await waitFor(() => expect(within(menu).getByRole('menuitemradio', { name: /Acme Industries/ })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(within(menu).getByRole('menuitemradio', { name: /Design Team/ })).toHaveFocus());
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Design Team');
    expect(screen.getByText('Switched to Design Team')).toBeInTheDocument();
  });

  it('runs Create workspace; Escape closes and restores focus', async () => {
    const { user, menu, trigger } = await open();
    await waitFor(() => expect(within(menu).getByRole('menuitemradio', { name: /Acme Industries/ })).toHaveFocus());
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Create workspace' })).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(await screen.findByText('Create workspace', { selector: 'p' })).toBeInTheDocument();
    await user.click(trigger);
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('open menu has no axe violations', async () => {
    await open();
    await expectNoAxeViolations();
  });
});

describe('WorkspaceSwitcher (searchable)', () => {
  async function open() {
    const user = userEvent.setup();
    render(<WorkspaceSwitcherSearch />);
    const trigger = screen.getByRole('combobox', { name: 'Data Platform, Switch workspace' });
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    const listbox = await screen.findByRole('listbox');
    const input = screen.getByRole('combobox', { name: 'Find a workspace' });
    await waitFor(() => expect(input).toHaveFocus());
    return { user, trigger, listbox, input };
  }

  it('opens with a search field once the list is long', async () => {
    const { listbox } = await open();
    expect(within(listbox).getAllByRole('option')).toHaveLength(13);
    expect(within(listbox).getByRole('option', { name: /Data Platform/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('typing filters; arrows + Enter switch workspace and close', async () => {
    const { user, listbox, trigger } = await open();
    await user.keyboard('secu');
    await waitFor(() => expect(within(listbox).getAllByRole('option')).toHaveLength(2));
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Security');
    expect(screen.getByText('Switched to Security')).toBeInTheDocument();
  });

  it('the create action stays available while filtering', async () => {
    const { user, listbox } = await open();
    await user.keyboard('zzz');
    await waitFor(() => expect(within(listbox).getAllByRole('option')).toHaveLength(1));
    await user.keyboard('{ArrowDown}{Enter}');
    expect(await screen.findByText('Create workspace', { selector: 'p' })).toBeInTheDocument();
  });

  it('Escape closes and returns focus to the trigger', async () => {
    const { user, trigger } = await open();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('open list has no axe violations', async () => {
    await open();
    await expectNoAxeViolations();
  });
});
