import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ForgotPasswordForm } from './ForgotPasswordForm';

describe('ForgotPasswordForm', () => {
  it('renders the request step', async () => {
    const { container } = render(<ForgotPasswordForm />);
    expect(screen.getByRole('heading', { name: 'Forgot your password?' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('sends the link and shows the sent state', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<ForgotPasswordForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Email'), 'avery@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(onSubmit).toHaveBeenCalledWith('avery@example.com');
    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
    expect(screen.getByText('avery@example.com')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Resend link' }));
    expect(onSubmit).toHaveBeenCalledTimes(2);
    await expectNoAxeViolations(container);
  });
});
