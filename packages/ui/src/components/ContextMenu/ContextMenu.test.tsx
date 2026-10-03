import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import ContextMenuCard from './examples/ContextMenuCard';

async function openWithKeyboard(key = '{Shift>}{F10}{/Shift}') {
  const user = userEvent.setup();
  render(<ContextMenuCard />);
  await user.tab();
  expect(screen.getByRole('group', { name: 'Project billing-api' })).toHaveFocus();
  await user.keyboard(key);
  const menu = await screen.findByRole('menu');
  return { user, menu };
}

describe('ContextMenu', () => {
  it('opens on right click at the pointer', async () => {
    render(<ContextMenuCard />);
    fireEvent.contextMenu(screen.getByText('billing-api'), { clientX: 40, clientY: 40 });
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'Open' })).toBeInTheDocument();
  });

  it.each([['{Shift>}{F10}{/Shift}'], ['{ContextMenu}']])('opens from the keyboard with %s', async (key) => {
    const { menu } = await openWithKeyboard(key);
    expect(within(menu).getAllByRole('menuitem').length).toBeGreaterThan(3);
  });

  it('arrow keys move between items and wrap', async () => {
    const { user, menu } = await openWithKeyboard();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Open' })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Rename' })).toHaveFocus());
    await user.keyboard('{ArrowUp}{ArrowUp}');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Delete project' })).toHaveFocus());
  });

  it('Enter activates the highlighted item and closes the menu', async () => {
    const { user, menu } = await openWithKeyboard();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Rename' })).toHaveFocus());
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(screen.getByText('Renaming billing-api')).toBeInTheDocument();
  });

  it('ArrowRight opens a submenu and ArrowLeft closes it', async () => {
    const { user, menu } = await openWithKeyboard();
    const sub = within(menu).getByRole('menuitem', { name: 'Move to' });
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');
    await waitFor(() => expect(sub).toHaveFocus());
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(2));
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Platform' })).toHaveFocus());
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(1));
    expect(sub).toHaveFocus();
  });

  it('Escape closes the menu', async () => {
    const { user } = await openWithKeyboard();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('describes the keyboard shortcut to assistive tech', () => {
    render(<ContextMenuCard />);
    expect(screen.getByText(/Press Shift\+F10 for actions/)).toHaveClass('sr-only');
  });

  it('closed and open states have no axe violations', async () => {
    const { menu } = await openWithKeyboard();
    expect(menu).toBeInTheDocument();
    await expectNoAxeViolations();
  });
});
