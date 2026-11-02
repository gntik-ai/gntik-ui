import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { MfaChallenge } from './MfaChallenge';

describe('MfaChallenge', () => {
  it('uses 44px OTP slots and a large backup field', async () => {
    render(<MfaChallenge fieldSize="lg" />);
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
    screen.getAllByRole('textbox').forEach((slot) => expect(slot).toHaveClass('h-11'));
    await userEvent.click(screen.getByRole('button', { name: 'Use a backup code' }));
    expect(screen.getByLabelText('Backup code').parentElement).toHaveClass('h-11');
    expect(screen.getByRole('button', { name: 'Verify' })).toHaveClass('h-11');
  });

  it('renders the code step with a resend countdown', async () => {
    const { container } = render(<MfaChallenge destination="a•••@example.com" onResend={() => {}} />);
    expect(screen.getByText(/sent a 6-digit code to a•••@example.com/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resend code in 30s' })).toBeDisabled();
    await expectNoAxeViolations(container);
  });

  it('auto-submits a complete code', async () => {
    const onVerify = vi.fn();
    render(<MfaChallenge onVerify={onVerify} />);
    await userEvent.click(screen.getAllByRole('textbox')[0]!);
    await userEvent.keyboard('123456');
    expect(onVerify).toHaveBeenCalledWith('123456', 'code');
  });

  it('switches to a backup code and resends with a new countdown', async () => {
    const onVerify = vi.fn();
    const onResend = vi.fn();
    const { container } = render(<MfaChallenge onVerify={onVerify} onResend={onResend} initialCooldown={0} />);
    await userEvent.click(screen.getByRole('button', { name: 'Resend code' }));
    expect(onResend).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Resend code in 30s' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Use a backup code' }));
    await userEvent.type(screen.getByLabelText('Backup code'), 'abcd-efgh');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    expect(onVerify).toHaveBeenCalledWith('abcd-efgh', 'backup');
    await expectNoAxeViolations(container);
  });
});
