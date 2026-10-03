import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ConfirmDestructive } from './ConfirmDestructive';

describe('ConfirmDestructive', () => {
  it('renders the trigger and an accessible dialog', async () => {
    const { container } = render(<ConfirmDestructive />);
    await expectNoAxeViolations(container);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Delete project' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete project?' });
    expect(dialog).toBeInTheDocument();
    await expectNoAxeViolations(document.body);
  });

  it('unlocks only on an exact name match, then confirms and closes', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(() => Promise.resolve());
    render(<ConfirmDestructive defaultOpen triggerLabel={null} onConfirm={onConfirm} />);
    const dialog = await screen.findByRole('alertdialog');
    const confirm = screen.getAllByRole('button', { name: 'Delete project' }).at(-1)!;
    expect(confirm).toBeDisabled();
    const input = screen.getByRole('textbox', { name: 'Type acme-web to confirm' });
    await user.type(input, 'acme-we');
    expect(confirm).toBeDisabled();
    await user.type(input, 'b');
    expect(confirm).toBeEnabled();
    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  });

  it('shows the error when confirm rejects', async () => {
    const user = userEvent.setup();
    render(<ConfirmDestructive defaultOpen triggerLabel={null} resourceName="db" onConfirm={() => Promise.reject(new Error('Project is locked'))} />);
    await user.type(await screen.findByRole('textbox'), 'db{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Project is locked');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});
