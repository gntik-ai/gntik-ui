import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ResetPasswordForm } from './ResetPasswordForm';

describe('ResetPasswordForm', () => {
  it('renders the form', async () => {
    const { container } = render(<ResetPasswordForm />);
    expect(screen.getByRole('form', { name: 'Set a new password' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('flags a mismatch, then saves and shows the success state', async () => {
    const onSubmit = vi.fn();
    const { container } = render(<ResetPasswordForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('New password'), 'correct-horse-42');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'correct-horse');
    await userEvent.click(screen.getByRole('button', { name: 'Update password' }));
    expect(screen.getByText("Passwords don't match.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    await expectNoAxeViolations(container);
    await userEvent.type(screen.getByLabelText('Confirm password'), '-42');
    await userEvent.click(screen.getByRole('button', { name: 'Update password' }));
    expect(onSubmit).toHaveBeenCalledWith('correct-horse-42');
    expect(await screen.findByRole('heading', { name: 'Password updated' })).toBeInTheDocument();
  });
});
