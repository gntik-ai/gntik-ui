import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import ForgotPasswordPage from './Page';

describe('ForgotPasswordPage', () => {
  it('renders the request step', async () => {
    const { container } = render(<ForgotPasswordPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Forgot your password?' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('sends the link and shows the check-your-email state', async () => {
    const onSubmit = vi.fn();
    const { container } = render(<ForgotPasswordPage onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Email'), 'dana@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(onSubmit).toHaveBeenCalledWith('dana@example.com');
    expect(await screen.findByRole('heading', { level: 1, name: 'Check your email' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resend link' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
