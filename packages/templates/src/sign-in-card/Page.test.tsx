import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import SignInCardPage from './Page';

describe('SignInCardPage', () => {
  it('renders the card form without SSO', async () => {
    const { container } = render(<SignInCardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Single sign-on' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('shows a server error and runs forgot password', async () => {
    const onForgotPassword = vi.fn();
    render(<SignInCardPage error="Incorrect email or password." onForgotPassword={onForgotPassword} />);
    expect(screen.getByText('Incorrect email or password.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'Forgot password?' }));
    expect(onForgotPassword).toHaveBeenCalledOnce();
  });
});
