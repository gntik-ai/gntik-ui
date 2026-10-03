import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import ModelProvidersPage from './Page';

describe('ModelProvidersPage', () => {
  it('renders the settings nav item, provider keys and usage limits', { timeout: 15000 }, async () => {
    render(<ModelProvidersPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Model providers' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Model providers/ }).some((b) => b.getAttribute('aria-current') === 'page')).toBe(true);
    expect(screen.getByRole('heading', { level: 2, name: 'Provider keys' })).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'Spend this month' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('tests a connection through onTest', { timeout: 15000 }, async () => {
    const onTest = vi.fn(() => Promise.resolve(false));
    render(<ModelProvidersPage onTest={onTest} />);
    const list = screen.getByRole('region', { name: 'Provider keys' });
    const row = within(list).getByText('Gateway').closest('li')!;
    await userEvent.click(within(row).getByRole('button', { name: /Test/ }));
    expect(onTest).toHaveBeenCalledWith(expect.objectContaining({ id: 'k3' }));
    await waitFor(() => expect(within(row).getByText('Failing')).toBeInTheDocument());
  });

  it('adds a key from the dialog after validation', { timeout: 15000 }, async () => {
    const onAddKey = vi.fn((input: { name: string; provider: string }) => ({ id: 'new', name: input.name, provider: input.provider, maskedKey: 'pa-…wxyz', status: 'untested' as const }));
    render(<ModelProvidersPage onAddKey={onAddKey} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Add provider key' })[0]!);
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add key' }));
    expect(onAddKey).not.toHaveBeenCalled();
    expect(within(dialog).getByText('Choose a provider.')).toBeInTheDocument();
    await userEvent.type(within(dialog).getByRole('textbox', { name: /Name/ }), 'Staging');
    await userEvent.click(within(dialog).getByRole('combobox', { name: 'Provider' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Provider B' }));
    await userEvent.type(within(dialog).getByLabelText(/API key/), 'pb-secret-1234');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add key' }));
    await waitFor(() => expect(onAddKey).toHaveBeenCalledWith({ name: 'Staging', provider: 'Provider B', endpoint: '', secret: 'pb-secret-1234' }));
    expect(await screen.findByText('Staging')).toBeInTheDocument();
  });
});
