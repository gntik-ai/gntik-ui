import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import WithQrCode from './examples/WithQrCode';
import { MfaSetupDialog } from './MfaSetupDialog';
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

  it('shows the QR code above the setup key and the verification code in the setup dialog', async () => {
    render(<SettingsSecurityPage mfaOtpauthUri="otpauth://totp/Acme:ana@example.com?secret=ABCDEFGH&issuer=Acme" />);
    await userEvent.click(screen.getByRole('switch', { name: 'Authenticator app' }));
    const dialog = await screen.findByRole('dialog', { name: 'Set up two-factor authentication' });
    const qr = within(dialog).getByRole('img', { name: 'QR code' });
    const key = within(dialog).getByText(/Setup key:/);
    const code = within(dialog).getByRole('group', { name: 'Verification code' });
    expect(qr.compareDocumentPosition(key) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(key.compareDocumentPosition(code) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(qr.compareDocumentPosition(code) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  }, 15000);

  it('shows no QR code on the page without mfaOtpauthUri and keeps the consumer setup key', async () => {
    render(<SettingsSecurityPage mfaSetupKey="ABCD EFGH IJKL MNOP" />);
    await userEvent.click(screen.getByRole('switch', { name: 'Authenticator app' }));
    const dialog = await screen.findByRole('dialog', { name: 'Set up two-factor authentication' });
    expect(within(dialog).queryByRole('img')).toBeNull();
    expect(within(dialog).getByText(/Setup key:/)).toHaveTextContent('Setup key: ABCD EFGH IJKL MNOP');
    expect(within(dialog).getByRole('group', { name: 'Verification code' })).toBeInTheDocument();
  }, 15000);

  it('shows the demo QR code in the docs example and keeps the setup key as the manual fallback', async () => {
    render(<WithQrCode />);
    await userEvent.click(screen.getByRole('switch', { name: 'Authenticator app' }));
    const dialog = await screen.findByRole('dialog', { name: 'Set up two-factor authentication' });
    expect(within(dialog).getByRole('img', { name: 'QR code' })).toBeInTheDocument();
    expect(within(dialog).getByText('JBSW Y3DP EHPK 3PXP')).toBeInTheDocument();
  }, 15000);

  it('renders no QR code in the setup dialog without otpauthUri', () => {
    render(<MfaSetupDialog open onOpenChange={() => undefined} setupKey="ABCD EFGH" onVerify={() => true} />);
    const dialog = screen.getByRole('dialog', { name: 'Set up two-factor authentication' });
    expect(within(dialog).queryByRole('img')).toBeNull();
    expect(within(dialog).getByText(/Setup key:/)).toHaveTextContent('Setup key: ABCD EFGH');
  }, 15000);

  it('has no axe violations', async () => {
    const { container } = render(<SettingsSecurityPage />);
    await expectNoAxeViolations(container);
  }, 15000);

  it('has no axe violations with the QR setup dialog open', async () => {
    render(<WithQrCode />);
    await userEvent.click(screen.getByRole('switch', { name: 'Authenticator app' }));
    const dialog = await screen.findByRole('dialog', { name: 'Set up two-factor authentication' });
    expect(within(dialog).getByRole('img', { name: 'QR code' })).toBeInTheDocument();
    await expectNoAxeViolations(document.body);
  }, 15000);
});
