import { ThemeProvider } from '@gntik-ai/ui';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import { ForgotPasswordForm, type ForgotPasswordFormRef } from './ForgotPasswordForm';

describe('ForgotPasswordForm', () => {
  it('can hide or replace inbox copy and both resend actions', () => {
    const { rerender } = render(<ForgotPasswordForm defaultSent sentTitle={null} sentDescription={null} sentStatus={null} resendActions={null} />);
    expect(screen.queryByText('Check your email')).not.toBeInTheDocument();
    expect(screen.queryByText(/If an account exists/)).not.toBeInTheDocument();
    expect(screen.queryByText('Reset link sent.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Resend link' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Use a different email' })).not.toBeInTheDocument();
    rerender(
      <ForgotPasswordForm
        sentTitle="Request received"
        sentDescription="If eligible, instructions will arrive."
        sentStatus="Request received."
        resendActions={<a href="#help">Get help</a>}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Request received' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Request received.');
    expect(screen.getByRole('link', { name: 'Get help' })).toBeInTheDocument();
  });

  it('configures request and sent copy and heading levels, including suppression', () => {
    const { container, rerender } = render(<ForgotPasswordForm title="Recover access" description="Enter your account name." headingLevel="h2" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Recover access' })).toBeInTheDocument();
    expect(screen.getByText('Enter your account name.')).toBeInTheDocument();
    rerender(<ForgotPasswordForm headingLevel={null} aria-label="Recover access" />);
    expect(container.querySelector('h1,h2,h3,h4,h5,h6,[role="heading"]')).toBeNull();
    expect(screen.getByRole('form', { name: 'Recover access' })).toBeInTheDocument();
    rerender(<ForgotPasswordForm key="sent" defaultSent sentTitle="Request received" sentDescription="If eligible, you will receive instructions." headingLevel="h2" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Request received' })).toBeInTheDocument();
    expect(screen.getByText('If eligible, you will receive instructions.')).toBeInTheDocument();
    rerender(<ForgotPasswordForm key="sent" headingLevel={null} />);
    expect(container.querySelector('h1,h2,h3,h4,h5,h6,[role="heading"]')).toBeNull();
  });

  it('exposes identifier focus and preserves server feedback and help associations', () => {
    const ref = createRef<ForgotPasswordFormRef>();
    render(
      <ForgotPasswordForm
        ref={ref}
        identifier={{ help: 'Account email', helpId: 'email-help' }}
        fieldInvalid={{ identifier: true }}
        feedbackId="recovery-feedback"
        aria-describedby="form-feedback"
        error="Request could not be completed."
      />,
    );
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')?.split(' ')).toEqual(expect.arrayContaining(['email-help', 'recovery-feedback']));
    expect(screen.getByRole('form', { name: 'Reset password request' })).toHaveAttribute('aria-describedby', 'form-feedback');
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'recovery-feedback');
    ref.current?.focus('identifier');
    expect(input).toHaveFocus();
  });

  it('uses consumer validation messages, focuses the identifier and chains help and errors', async () => {
    const onSubmit = vi.fn();
    render(
      <ForgotPasswordForm
        identifier={{ type: 'text', label: 'Username', help: 'Account name', helpId: 'recovery-help', minLength: 3 }}
        messages={{ identifierRequired: 'Username is required.', identifierTooShort: 'Username is too short.' }}
        onSubmit={onSubmit}
      />,
    );
    const input = screen.getByLabelText('Username');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('form', { name: 'Reset password request' })).toHaveAttribute('novalidate');
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(input).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
    const error = screen.getByText('Username is required.').closest('[role="alert"]');
    expect(error).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')?.split(' ')).toEqual(expect.arrayContaining(['recovery-help', error?.id]));
    await userEvent.type(input, 'ab');
    expect(screen.getByText('Username is too short.')).toBeInTheDocument();
    await userEvent.type(input, 'c');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAccessibleDescription('Account name');
  });

  it('accepts a username-or-email configuration and submits the trimmed value', async () => {
    const onSubmit = vi.fn();
    render(
      <ForgotPasswordForm
        identifier={{ type: 'text', autoComplete: 'username', label: 'Username or email', help: 'Use your account name or email.', placeholder: 'Account name', maxLength: 255 }}
        onSubmit={onSubmit}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Username or email' });
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('autocomplete', 'username');
    expect(input).toHaveAttribute('maxlength', '255');
    expect(input).toHaveAttribute('placeholder', 'Account name');
    expect(input).toHaveAccessibleDescription('Use your account name or email.');
    await userEvent.type(input, '  avery  ');
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(onSubmit).toHaveBeenCalledWith('avery');
  });

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

// Public rendering seams: identifier mode, theme, heading policy and validation/recovery state.
describe('ForgotPasswordForm accessibility matrix', () => {
  for (const theme of ['dark', 'light', 'high_contrast'] as const) {
    for (const mode of ['email', 'username'] as const) {
      for (const suppressed of [false, true]) {
        for (const state of ['initial', 'errors', 'sent'] as const) {
          it(`${theme} / ${mode} / headings ${!suppressed} / ${state}`, async () => {
            const onSubmit = vi.fn();
            const { container } = render(
              <ThemeProvider defaultMode={theme} storageKey={null}>
                <h1>Account access</h1>
                <ForgotPasswordForm
                  identifier={
                    mode === 'username' ? { type: 'text', autoComplete: 'username', label: 'Username', help: 'Use your account name.', minLength: 3, maxLength: 255 } : undefined
                  }
                  headingLevel={suppressed ? null : undefined}
                  defaultSent={state === 'sent'}
                  messages={{ identifierRequired: 'Account name is required.', passwordRequired: 'Password is required.' }}
                  onSubmit={onSubmit}
                />
              </ThemeProvider>,
            );
            if (state === 'initial' || state === 'errors') {
              const input = screen.getByRole('textbox', { name: mode === 'username' ? 'Username' : 'Email' });
              expect(input).toHaveAttribute('type', mode === 'username' ? 'text' : 'email');
              expect(input).toHaveAttribute('autocomplete', mode === 'username' ? 'username' : 'email');
              expect(screen.getByRole('form', { name: 'Reset password request' })).toHaveAttribute('novalidate');
              if (state === 'errors') {
                await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
                expect(input).toHaveFocus();
                expect(input).toHaveAttribute('aria-invalid', 'true');
                expect(onSubmit).not.toHaveBeenCalled();
                expect(screen.getByText('Account name is required.')).toBeInTheDocument();
              }
            }
            if (suppressed) expect(container.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="heading"]')).toHaveLength(1);
            await expectNoAxeViolations(container);
          });
        }
      }
    }
  }
});
