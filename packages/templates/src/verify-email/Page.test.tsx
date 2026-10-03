import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import VerifyEmailPage from './Page';

describe('VerifyEmailPage', () => {
  it('renders the inbox step with a resend countdown', async () => {
    const { container } = render(<VerifyEmailPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Check your inbox' })).toBeInTheDocument();
    expect(screen.getByText('dana@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resend email in 1:00' })).toBeDisabled();
    await expectNoAxeViolations(container);
  });

  it('counts down, then resends and restarts the timer', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const onResend = vi.fn();
      render(<VerifyEmailPage onResend={onResend} resendCooldown={5} />);
      expect(screen.getByRole('button', { name: 'Resend email in 0:05' })).toBeDisabled();
      act(() => vi.advanceTimersByTime(5000));
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      await user.click(screen.getByRole('button', { name: 'Resend email' }));
      expect(onResend).toHaveBeenCalledOnce();
      expect(screen.getByRole('status')).toHaveTextContent('A new verification email was sent to dana@example.com.');
      expect(screen.getByRole('button', { name: /Resend email in 0:0[45]/ })).toBeDisabled();
    } finally {
      vi.useRealTimers();
    }
  });
});
