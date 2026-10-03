import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import SettingsSecurityPage from './Page';

describe('SettingsSecurityPage', () => {
  it('renders the password, MFA and sessions sections', () => {
    render(<SettingsSecurityPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Security' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Security/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: 'Password' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sessions and devices' })).toBeInTheDocument();
  }, 15000);

  it('validates the password change', async () => {
    const onPasswordChange = vi.fn();
    render(<SettingsSecurityPage onPasswordChange={onPasswordChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Update password' }));
    expect(onPasswordChange).not.toHaveBeenCalled();
    expect(screen.getByText('Enter your current password.')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Current password'), 'old-password');
    await userEvent.type(screen.getByLabelText('New password'), 'a-much-longer-secret');
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'a-much-longer-secret');
    await userEvent.click(screen.getByRole('button', { name: 'Update password' }));
    expect(onPasswordChange).toHaveBeenCalledWith({ current: 'old-password', next: 'a-much-longer-secret' });
  }, 15000);

  it('enables MFA through the setup dialog', async () => {
    const onMfaChange = vi.fn();
    render(<SettingsSecurityPage onMfaChange={onMfaChange} />);
    await userEvent.click(screen.getByRole('switch', { name: 'Authenticator app' }));
    const dialog = await screen.findByRole('dialog', { name: 'Set up two-factor authentication' });
    expect(dialog).toBeInTheDocument();
    await userEvent.keyboard('123456');
    expect(onMfaChange).toHaveBeenCalledWith(true);
    expect(await screen.findByText('Enabled')).toBeInTheDocument();
  }, 15000);

  it('has no axe violations', async () => {
    const { container } = render(<SettingsSecurityPage />);
    await expectNoAxeViolations(container);
  }, 15000);
});
