import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import DialogForm from './examples/DialogForm';

describe('Dialog', () => {
  it('opens from the keyboard, labels itself and moves focus inside', async () => {
    const user = userEvent.setup();
    render(<DialogForm />);
    const trigger = screen.getByRole('button', { name: 'New project' });
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', { name: 'Create project' });
    expect(dialog).toHaveAccessibleDescription('Name it; you can change the settings later.');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  });

  it('traps Tab focus inside', async () => {
    const user = userEvent.setup();
    render(<DialogForm />);
    await user.click(screen.getByRole('button', { name: 'New project' }));
    const dialog = await screen.findByRole('dialog');
    for (let i = 0; i < 8; i++) {
      await user.tab();
      // Base UI wraps the popup in focus guards that redirect focus back inside.
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    }
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<DialogForm />);
    const trigger = screen.getByRole('button', { name: 'New project' });
    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('closes from the close button and the Cancel action', async () => {
    const user = userEvent.setup();
    render(<DialogForm />);
    await user.click(screen.getByRole('button', { name: 'New project' }));
    await user.click(await screen.findByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'New project' }));
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('open dialog has no axe violations', async () => {
    const user = userEvent.setup();
    render(<DialogForm />);
    await user.click(screen.getByRole('button', { name: 'New project' }));
    await screen.findByRole('dialog');
    await expectNoAxeViolations();
  });
});
