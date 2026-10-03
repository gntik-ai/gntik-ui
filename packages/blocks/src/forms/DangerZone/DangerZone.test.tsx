import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { DangerZone } from './DangerZone';

describe('DangerZone', () => {
  it('renders the default actions', async () => {
    const { container } = render(<DangerZone />);
    expect(screen.getByRole('region', { name: 'Danger zone' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete project' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('requires typing the name before confirming', async () => {
    const onConfirm = vi.fn();
    render(<DangerZone onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete project' }));
    const dialog = await screen.findByRole('alertdialog');
    const confirm = screen.getAllByRole('button', { name: 'Delete project' }).at(-1)!;
    expect(confirm).toBeDisabled();
    await expectNoAxeViolations(dialog);
    await userEvent.type(screen.getByLabelText(/to confirm/), 'billing-dashboard');
    expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith('delete');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });
});
