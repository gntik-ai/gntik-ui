import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import AlertDialogDelete from './examples/AlertDialogDelete';
import AlertDialogTones from './examples/AlertDialogTones';

describe('AlertDialog', () => {
  it('opens from the keyboard as a labelled alertdialog and moves focus inside', async () => {
    const user = userEvent.setup();
    render(<AlertDialogDelete />);
    const trigger = screen.getByRole('button', { name: 'Delete project' });
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete “support-triage”?' });
    expect(dialog).toHaveAccessibleDescription(/cannot be undone/);
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  });

  it('opens with Space too', async () => {
    const user = userEvent.setup();
    render(<AlertDialogDelete />);
    await user.tab();
    await user.keyboard(' ');
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
  });

  it('traps Tab and Shift+Tab focus inside', async () => {
    const user = userEvent.setup();
    render(<AlertDialogDelete />);
    await user.click(screen.getByRole('button', { name: 'Delete project' }));
    const dialog = await screen.findByRole('alertdialog');
    for (let i = 0; i < 4; i++) {
      await user.tab();
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
      await user.tab({ shift: true });
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    }
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<AlertDialogDelete />);
    const trigger = screen.getByRole('button', { name: 'Delete project' });
    await user.click(trigger);
    await screen.findByRole('alertdialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('Cancel closes without acting; the action runs and closes', async () => {
    const user = userEvent.setup();
    render(<AlertDialogDelete />);
    await user.click(screen.getByRole('button', { name: 'Delete project' }));
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.queryByText('Project deleted')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete project' }));
    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.getByText('Project deleted')).toBeInTheDocument();
  });

  it('open destructive dialog has no axe violations', async () => {
    const user = userEvent.setup();
    render(<AlertDialogDelete />);
    await user.click(screen.getByRole('button', { name: 'Delete project' }));
    await screen.findByRole('alertdialog');
    await expectNoAxeViolations();
  });

  it('open warning and info dialogs have no axe violations', async () => {
    const user = userEvent.setup();
    render(<AlertDialogTones />);
    await user.click(screen.getByRole('button', { name: 'Downgrade plan' }));
    await screen.findByRole('alertdialog', { name: 'Downgrade to the Starter plan?' });
    await expectNoAxeViolations();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Transfer ownership' }));
    await screen.findByRole('alertdialog', { name: 'Transfer ownership?' });
    await expectNoAxeViolations();
  });
});
