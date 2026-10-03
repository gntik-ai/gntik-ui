import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import SignInPage from './Page';

describe('SignInPage', () => {
  it('renders the form, SSO options and brand panel', async () => {
    const { container } = render(<SignInPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in to your workspace' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Single sign-on' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('validates, then submits the credentials', async () => {
    const onSubmit = vi.fn();
    render(<SignInPage onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(screen.getByLabelText('Email'), 'dana@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'correct horse');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(onSubmit).toHaveBeenCalledWith({ email: 'dana@example.com', password: 'correct horse', remember: true });
  });

  it('starts single sign-on with the chosen provider', async () => {
    const onSso = vi.fn();
    render(<SignInPage onSso={onSso} />);
    await userEvent.click(screen.getByRole('button', { name: 'Continue with SSO' }));
    expect(onSso).toHaveBeenCalledWith('sso');
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeDisabled();
  });
});
