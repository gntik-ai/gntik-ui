import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import ResetPasswordPage from './Page';

describe('ResetPasswordPage', () => {
  it('renders the new-password form', async () => {
    const { container } = render(<ResetPasswordPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Set a new password' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('saves the password and continues from the success state', async () => {
    const onSubmit = vi.fn();
    const onContinue = vi.fn();
    const { container } = render(<ResetPasswordPage onSubmit={onSubmit} onContinue={onContinue} />);
    await userEvent.type(screen.getByLabelText('New password'), 'a-much-longer-pass');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'a-much-longer-pass');
    await userEvent.click(screen.getByRole('button', { name: 'Update password' }));
    expect(onSubmit).toHaveBeenCalledWith('a-much-longer-pass');
    expect(await screen.findByRole('heading', { level: 1, name: 'Password updated' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Continue to sign in' }));
    expect(onContinue).toHaveBeenCalledOnce();
    await expectNoAxeViolations(container);
  });
});
