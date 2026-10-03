import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import ToastTones from './examples/ToastTones';
import ToastUndo from './examples/ToastUndo';

describe('Toast', () => {
  it('adds a labelled toast inside the Notifications region', async () => {
    const user = userEvent.setup();
    render(<ToastTones />);
    await user.click(screen.getByRole('button', { name: 'Success' }));
    const region = await screen.findByRole('region', { name: 'Notifications' });
    const toast = await within(region).findByRole('dialog', { name: 'Deployment complete' });
    expect(toast).toHaveAccessibleDescription('support-triage is serving traffic in eu-west-1.');
    expect(toast).toHaveAttribute('data-type', 'success');
  });

  it('F6 moves focus into the notifications region', async () => {
    const user = userEvent.setup();
    render(<ToastTones />);
    await user.click(screen.getByRole('button', { name: 'Warning' }));
    const region = await screen.findByRole('region', { name: 'Notifications' });
    await within(region).findByRole('dialog', { name: 'Budget at 92%' });
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'F6' });
    await waitFor(() => expect(region).toHaveFocus());
  });

  it('Tab reaches the action and close button', async () => {
    const user = userEvent.setup();
    render(<ToastUndo />);
    await user.click(screen.getByRole('button', { name: 'Archive project' }));
    const region = await screen.findByRole('region', { name: 'Notifications' });
    await within(region).findByRole('dialog', { name: 'Project archived' });
    fireEvent.keyDown(document.body, { key: 'F6' });
    await waitFor(() => expect(region).toHaveFocus());
    const reached: string[] = [];
    for (let i = 0; i < 3; i++) {
      await user.tab();
      const el = document.activeElement;
      reached.push(el?.getAttribute('aria-label') ?? el?.textContent ?? '');
    }
    expect(reached).toEqual(expect.arrayContaining(['Undo', 'Dismiss notification']));
    // Base UI hides the close button from assistive tech until the stack is focused or hovered.
    expect(screen.getByRole('button', { name: 'Dismiss notification' })).toHaveFocus();
  });

  it('Enter on the close button dismisses the toast', async () => {
    const user = userEvent.setup();
    render(<ToastTones />);
    await user.click(screen.getByRole('button', { name: 'Neutral' }));
    const region = await screen.findByRole('region', { name: 'Notifications' });
    await within(region).findByRole('dialog', { name: 'Settings saved' });
    fireEvent.keyDown(document.body, { key: 'F6' });
    await waitFor(() => expect(region).toHaveFocus());
    await user.tab();
    await user.tab();
    const close = screen.getByRole('button', { name: 'Dismiss notification' });
    expect(close).toHaveFocus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Settings saved' })).not.toBeInTheDocument());
  });

  it('the action runs its handler and closes the toast', async () => {
    const user = userEvent.setup();
    render(<ToastUndo />);
    await user.click(screen.getByRole('button', { name: 'Archive project' }));
    expect(screen.getByText('Archived')).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    expect(screen.getByText('Active')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Project archived' })).not.toBeInTheDocument());
  });

  it('all tones shown at once have no axe violations', async () => {
    const user = userEvent.setup();
    render(<ToastTones />);
    for (const name of ['Success', 'Info', 'Warning', 'Error']) {
      await user.click(screen.getByRole('button', { name }));
    }
    await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(4));
    await expectNoAxeViolations();
  });

  it('toast with action has no axe violations', async () => {
    const user = userEvent.setup();
    render(<ToastUndo />);
    await user.click(screen.getByRole('button', { name: 'Archive project' }));
    await screen.findByRole('button', { name: 'Undo' });
    await expectNoAxeViolations();
  });
});
