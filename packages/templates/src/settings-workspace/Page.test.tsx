import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import SettingsWorkspacePage from './Page';

describe('SettingsWorkspacePage', () => {
  it('renders the general, logo, region and danger zone sections', () => {
    render(<SettingsWorkspacePage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Workspace/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('group', { name: 'Workspace logo' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Danger zone' })).toBeInTheDocument();
  }, 15000);

  it('saves an edited name', async () => {
    const onSave = vi.fn();
    render(<SettingsWorkspacePage onSave={onSave} />);
    const name = screen.getByLabelText('Workspace name');
    await userEvent.clear(name);
    await userEvent.type(name, 'Northwind');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Northwind', slug: 'northwind-labs' }));
  }, 15000);

  it('asks to type the slug before deleting', async () => {
    const onDangerAction = vi.fn();
    render(<SettingsWorkspacePage onDangerAction={onDangerAction} />);
    const zone = screen.getByRole('region', { name: 'Danger zone' });
    await userEvent.click(within(zone).getByRole('button', { name: 'Delete workspace' }));
    const dialog = await screen.findByRole('alertdialog');
    const confirm = within(dialog).getByRole('button', { name: 'Delete workspace' });
    expect(confirm).toBeDisabled();
    await userEvent.type(within(dialog).getByRole('textbox'), 'northwind-labs');
    expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    expect(onDangerAction).toHaveBeenCalledWith('delete');
  }, 15000);

  it('has no axe violations', async () => {
    const { container } = render(<SettingsWorkspacePage />);
    await expectNoAxeViolations(container);
  }, 15000);
});
