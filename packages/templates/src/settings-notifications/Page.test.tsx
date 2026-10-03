import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import SettingsNotificationsPage from './Page';

describe('SettingsNotificationsPage', () => {
  it('renders the matrix', () => {
    render(<SettingsNotificationsPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Notification preferences' })).toBeInTheDocument();
  }, 15000);

  it('saves a changed preference and can discard', async () => {
    const onSave = vi.fn();
    render(<SettingsNotificationsPage onSave={onSave} />);
    const cell = screen.getByRole('checkbox', { name: 'Member joined by Push' });
    await userEvent.click(cell);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Discard' }));
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    await userEvent.click(cell);
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ 'member-joined': ['push'] }));
  }, 15000);

  it('has no axe violations', async () => {
    const { container } = render(<SettingsNotificationsPage />);
    await expectNoAxeViolations(container);
  }, 15000);
});
