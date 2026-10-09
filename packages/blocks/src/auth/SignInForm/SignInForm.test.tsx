import { ThemeProvider } from '@gntik-ai/ui';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import { SignInForm, type SignInFormRef } from './SignInForm';

describe('SignInForm', () => {
  it('can hide or replace the sign-up prompt alongside the SSO slot', () => {
    const { rerender } = render(<SignInForm sso={null} signUpPrompt={null} />);
    expect(screen.queryByText(/New here/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Create an account' })).not.toBeInTheDocument();
    expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
    rerender(<SignInForm signUpPrompt="Ask your administrator for access." />);
    expect(screen.getByText('Ask your administrator for access.')).toBeInTheDocument();
    expect(screen.queryByText(/New here/)).not.toBeInTheDocument();
  });

  it('suppresses or changes the heading level while retaining an accessible form name', () => {
    const { container, rerender } = render(<SignInForm headingLevel={null} />);
    expect(container.querySelector('h1,h2,h3,h4,h5,h6,[role="heading"]')).toBeNull();
    expect(screen.getByRole('form', { name: 'Sign in' })).toBeInTheDocument();
    rerender(<SignInForm headingLevel="h2" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Sign in to your workspace');
    rerender(<SignInForm headingLevel={null} aria-label="Account access" />);
    expect(screen.getByRole('form', { name: 'Account access' })).toBeInTheDocument();
    rerender(
      <>
        <h1 id="page-title">Account access</h1>
        <SignInForm headingLevel={null} aria-labelledby="page-title" />
      </>,
    );
    expect(screen.getByRole('form', { name: 'Account access' })).toHaveAttribute('aria-labelledby', 'page-title');
  });

  it('associates server feedback with both invalid fields and exposes password focus', () => {
    const ref = createRef<SignInFormRef>();
    const { rerender } = render(
      <SignInForm
        ref={ref}
        identifier={{ help: 'Account email', helpId: 'email-help' }}
        passwordHelp="Account password"
        passwordHelpId="password-help"
        fieldInvalid={{ identifier: true, password: true }}
        feedbackId="credential-feedback"
        aria-describedby="form-feedback"
        error="Credentials were not accepted."
      />,
    );
    expect(screen.getByRole('form', { name: 'Sign in' })).toHaveAttribute('aria-describedby', 'form-feedback');
    for (const label of ['Email', 'Password']) {
      const input = screen.getByLabelText(label);
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input.getAttribute('aria-describedby')?.split(' ')).toEqual(expect.arrayContaining([label === 'Email' ? 'email-help' : 'password-help', 'credential-feedback']));
    }
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'credential-feedback');
    ref.current?.focus('password');
    expect(screen.getByLabelText('Password')).toHaveFocus();
    ref.current?.focus('identifier');
    expect(screen.getByLabelText('Email')).toHaveFocus();
    rerender(<SignInForm ref={ref} />);
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText('Password')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText('Password')).not.toHaveAttribute('aria-describedby');
  });

  it('validates with consumer messages, focuses the first invalid field and clears error associations', async () => {
    const onSubmit = vi.fn();
    render(
      <SignInForm
        identifier={{ type: 'text', label: 'Username', help: 'Account name', helpId: 'username-help', minLength: 3 }}
        passwordHelp="Account password"
        passwordHelpId="password-help"
        messages={{ identifierRequired: 'Username is required.', identifierInvalid: 'Use at least three characters.', passwordRequired: 'Password is required.' }}
        onSubmit={onSubmit}
        sso={null}
      />,
    );
    const input = screen.getByLabelText('Username');
    const password = screen.getByLabelText('Password');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(password).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('form', { name: 'Sign in' })).toHaveAttribute('novalidate');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(input).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
    for (const [field, message, helpId] of [
      [input, 'Username is required.', 'username-help'],
      [password, 'Password is required.', 'password-help'],
    ] as const) {
      const error = screen.getByText(message).closest('[role="alert"]');
      expect(error).toBeInTheDocument();
      expect(field).toHaveAttribute('aria-invalid', 'true');
      expect(field.getAttribute('aria-describedby')?.split(' ')).toEqual(expect.arrayContaining([helpId, error?.id]));
    }
    await userEvent.type(input, 'ab');
    expect(screen.getByText('Use at least three characters.')).toBeInTheDocument();
    await userEvent.type(input, 'c');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAccessibleDescription('Account name');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(password).toHaveFocus();
    await userEvent.type(password, 'secret');
    expect(password).not.toHaveAttribute('aria-invalid');
    expect(password).toHaveAccessibleDescription('Account password');
  });

  it('accepts a username configuration and submits the trimmed identifier without changing email payloads', async () => {
    const onSubmit = vi.fn();
    render(
      <SignInForm
        identifier={{ type: 'text', autoComplete: 'username', label: 'Username', help: 'Use your account name.', minLength: 3, maxLength: 120 }}
        onSubmit={onSubmit}
        sso={null}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Username' });
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('autocomplete', 'username');
    expect(input).toHaveAttribute('minlength', '3');
    expect(input).toHaveAttribute('maxlength', '120');
    expect(input).toHaveAccessibleDescription('Use your account name.');
    await userEvent.type(input, '  avery  ');
    await userEvent.type(screen.getByLabelText('Password'), 'hunter22');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(onSubmit).toHaveBeenCalledWith({ email: 'avery', identifier: 'avery', password: 'hunter22', remember: true });
  });

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

// Public rendering seams: identifier mode, theme, heading policy and validation/recovery state.
describe('SignInForm accessibility matrix', () => {
  for (const theme of ['dark', 'light', 'high_contrast'] as const) {
    for (const mode of ['email', 'username'] as const) {
      for (const suppressed of [false, true]) {
        for (const state of ['initial', 'errors'] as const) {
          it(`${theme} / ${mode} / headings ${!suppressed} / ${state}`, async () => {
            const onSubmit = vi.fn();
            const { container } = render(
              <ThemeProvider defaultMode={theme} storageKey={null}>
                <h1>Account access</h1>
                <SignInForm
                  identifier={
                    mode === 'username' ? { type: 'text', autoComplete: 'username', label: 'Username', help: 'Use your account name.', minLength: 3, maxLength: 120 } : undefined
                  }
                  headingLevel={suppressed ? null : undefined}
                  messages={{ identifierRequired: 'Account name is required.', passwordRequired: 'Password is required.' }}
                  onSubmit={onSubmit}
                />
              </ThemeProvider>,
            );
            if (state === 'initial' || state === 'errors') {
              const input = screen.getByRole('textbox', { name: mode === 'username' ? 'Username' : 'Email' });
              expect(input).toHaveAttribute('type', mode === 'username' ? 'text' : 'email');
              expect(input).toHaveAttribute('autocomplete', mode === 'username' ? 'username' : 'email');
              expect(screen.getByRole('form', { name: 'Sign in' })).toHaveAttribute('novalidate');
              if (state === 'errors') {
                await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
                expect(input).toHaveFocus();
                expect(input).toHaveAttribute('aria-invalid', 'true');
                expect(onSubmit).not.toHaveBeenCalled();
                expect(screen.getByText('Account name is required.')).toBeInTheDocument();
                expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
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
