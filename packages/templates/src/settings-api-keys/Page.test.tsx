import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import SettingsApiKeysPage from './Page';

describe('SettingsApiKeysPage', () => {
  it('renders the key list', () => {
    render(<SettingsApiKeysPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'API keys' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'API keys' })).toBeInTheDocument();
    expect(screen.getByText('ci-deploy')).toBeInTheDocument();
  }, 15000);

  it('revokes a key after typing its name', async () => {
    const onRevoke = vi.fn();
    render(<SettingsApiKeysPage onRevoke={onRevoke} />);
    await userEvent.click(screen.getByRole('button', { name: 'Actions for ci-deploy' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Revoke key' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Revoke API key?' });
    const confirm = within(dialog).getByRole('button', { name: 'Revoke key' });
    expect(confirm).toBeDisabled();
    await userEvent.type(within(dialog).getByRole('textbox'), 'ci-deploy');
    await userEvent.click(confirm);
    expect(onRevoke).toHaveBeenCalledWith(expect.objectContaining({ id: 'k1' }));
    expect(within(screen.getByRole('table', { name: 'API keys' })).queryByText('ci-deploy')).not.toBeInTheDocument();
  }, 15000);

  it('opens the create dialog from the header', async () => {
    render(<SettingsApiKeysPage />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Create API key' })[0]!);
    expect(await screen.findByRole('dialog', { name: 'Create API key' })).toBeInTheDocument();
  }, 15000);

  it('has no axe violations', async () => {
    const { container } = render(<SettingsApiKeysPage />);
    await expectNoAxeViolations(container);
  }, 15000);
});
