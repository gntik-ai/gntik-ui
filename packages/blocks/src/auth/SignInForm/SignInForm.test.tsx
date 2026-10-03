import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { SignInForm } from './SignInForm';

describe('SignInForm', () => {
  it('renders with SSO by default', async () => {
    const { container } = render(<SignInForm />);
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in to your workspace' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Single sign-on' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('validates, submits and shows a rejection as an alert', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Incorrect email or password.'));
    render(<SignInForm onSubmit={onSubmit} sso={null} />);
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(screen.getByLabelText('Email'), 'avery@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'hunter22');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(onSubmit).toHaveBeenCalledWith({ email: 'avery@example.com', password: 'hunter22', remember: true });
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.');
  });
});
