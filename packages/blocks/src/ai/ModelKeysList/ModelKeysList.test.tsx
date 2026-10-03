import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ModelKeysList } from './ModelKeysList';

const row = (name: string) => screen.getByText(name).closest('li') as HTMLElement;

describe('ModelKeysList', () => {
  it('lists keys masked, with provider and status', async () => {
    render(<ModelKeysList onAdd={() => {}} />);
    expect(screen.getByRole('region', { name: 'Model provider keys' })).toBeInTheDocument();
    expect(within(row('Production')).getByText('pa-…4f2a')).toBeInTheDocument();
    expect(within(row('Gateway')).getByText('Untested')).toBeInTheDocument();
    expect(within(row('On-prem cluster')).getByText('Failing')).toBeInTheDocument();
    expect(screen.getByText(/openai-compatible/)).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('tests a connection with a spinner, then shows the result', async () => {
    const user = userEvent.setup();
    let resolve: (ok: boolean) => void = () => {};
    const onTest = vi.fn(() => new Promise<boolean>((r) => (resolve = r)));
    render(<ModelKeysList onTest={onTest} />);
    await user.click(screen.getByRole('button', { name: 'Test Gateway' }));
    const busy = screen.getByRole('button', { name: 'Testing Gateway' });
    expect(busy).toHaveAttribute('aria-busy', 'true');
    expect(busy.querySelector('svg.animate-spin')).not.toBeNull();
    await act(async () => resolve(true));
    expect(within(row('Gateway')).getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Gateway: connection OK')).toBeInTheDocument();
  });

  it('revokes a key after confirming in an alert dialog', async () => {
    const user = userEvent.setup();
    const onRevoke = vi.fn();
    render(<ModelKeysList onRevoke={onRevoke} />);
    await user.click(screen.getByRole('button', { name: 'Revoke Production' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Revoke “Production”?' });
    await user.click(within(dialog).getByRole('button', { name: 'Revoke key' }));
    expect(onRevoke).toHaveBeenCalledWith(expect.objectContaining({ id: 'k1' }));
    expect(within(row('Production')).getByText('Revoked')).toBeInTheDocument();
    expect(within(row('Production')).queryByRole('button')).not.toBeInTheDocument();
  });
});
