import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import DrawerBottomSheet from './examples/DrawerBottomSheet';
import DrawerEditForm from './examples/DrawerEditForm';
import DrawerNavigation from './examples/DrawerNavigation';

describe('Drawer', () => {
  it('opens from the keyboard, labels itself and moves focus inside', async () => {
    const user = userEvent.setup();
    render(<DrawerEditForm />);
    const trigger = screen.getByRole('button', { name: 'Edit project' });
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    const drawer = await screen.findByRole('dialog', { name: 'Edit project' });
    expect(drawer).toHaveAccessibleDescription('support-triage · production');
    await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true));
  });

  it('opens with Space too', async () => {
    const user = userEvent.setup();
    render(<DrawerBottomSheet />);
    await user.tab();
    await user.keyboard(' ');
    expect(await screen.findByRole('dialog', { name: 'Share project' })).toBeInTheDocument();
  });

  it('traps Tab and Shift+Tab focus inside', async () => {
    const user = userEvent.setup();
    render(<DrawerEditForm />);
    await user.click(screen.getByRole('button', { name: 'Edit project' }));
    const drawer = await screen.findByRole('dialog');
    for (let i = 0; i < 8; i++) {
      await user.tab();
      await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true));
    }
    await user.tab({ shift: true });
    await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true));
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<DrawerNavigation />);
    const trigger = screen.getByRole('button', { name: 'Open menu' });
    await user.click(trigger);
    await screen.findByRole('dialog', { name: 'Workspace' });
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('slides from the requested side and closes from the close button and footer action', async () => {
    const user = userEvent.setup();
    render(<DrawerEditForm />);
    await user.click(screen.getByRole('button', { name: 'Edit project' }));
    const drawer = await screen.findByRole('dialog');
    expect(drawer).toHaveAttribute('data-swipe-direction', 'right');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Edit project' }));
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it.each([
    ['right form', DrawerEditForm, 'Edit project'],
    ['left navigation', DrawerNavigation, 'Open menu'],
    ['bottom sheet', DrawerBottomSheet, 'Share project'],
  ])('open %s drawer has no axe violations', async (_, Example, triggerName) => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole('button', { name: triggerName }));
    await screen.findByRole('dialog');
    await expectNoAxeViolations();
  });
});
