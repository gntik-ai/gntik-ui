import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import SsoLoginPage from './Page';

describe('SsoLoginPage', () => {
  it('renders the work email step', async () => {
    const { container } = render(<SsoLoginPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in with SSO' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('looks up the email and shows the redirecting state', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const { container } = render(<SsoLoginPage onSubmit={onSubmit} onCancel={onCancel} providerName="Acme Identity" />);
    await userEvent.click(screen.getByRole('button', { name: 'Continue with SSO' }));
    expect(screen.getByText('Enter a valid work email.')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Work email'), 'dana@acme.example');
    await userEvent.click(screen.getByRole('button', { name: 'Continue with SSO' }));
    expect(onSubmit).toHaveBeenCalledWith('dana@acme.example');
    expect(await screen.findByRole('heading', { level: 1, name: 'Redirecting to Acme Identity' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Waiting for Acme Identity');
    await expectNoAxeViolations(container);
    await userEvent.click(screen.getByRole('button', { name: 'Use a different email' }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in with SSO' })).toBeInTheDocument();
  });

  it('shows a lookup failure', async () => {
    render(<SsoLoginPage defaultEmail="dana@unknown.example" onSubmit={() => Promise.reject(new Error('No SSO connection for this domain.'))} />);
    await userEvent.click(screen.getByRole('button', { name: 'Continue with SSO' }));
    expect(await screen.findByText('No SSO connection for this domain.')).toBeInTheDocument();
  });
});
