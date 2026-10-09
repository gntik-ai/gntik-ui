import { ThemeProvider } from '@gntik-ai/ui';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import type { SignInFormRef } from '@gntik-ai/blocks';
import { expectNoAxeViolations } from '../test/a11y';
import SignInCardPage from './Page';

describe('SignInCardPage', () => {
  it('suppresses every internal heading beside a page heading and hides or replaces optional regions', () => {
    const { container, rerender } = render(
      <>
        <h1>Account access</h1>
        <SignInCardPage suppressAllHeadings footer={null} signUpPrompt={null} sso={null} />
      </>,
    );
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(screen.getByRole('main').querySelector('h1,h2,h3,h4,h5,h6,[role="heading"]')).toBeNull();
    expect(screen.getByRole('form', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Terms' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Privacy Policy' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Create an account' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Single sign-on' })).not.toBeInTheDocument();
    rerender(<SignInCardPage headingLevel="h2" footer="Account support" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText('Account support')).toBeInTheDocument();
    rerender(<SignInCardPage headingLevel={null} aria-label="Account access" />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'Account access' })).toBeInTheDocument();
  });

  it('forwards identifier, validation, field help, focus and server ARIA props unchanged', async () => {
    const onSubmit = vi.fn();
    const ref = createRef<SignInFormRef>();
    const props = {
      ref,
      onSubmit,
      identifier: { type: 'text' as const, autoComplete: 'username', label: 'Username', help: 'Account name', helpId: 'username-help', minLength: 3, maxLength: 120 },
      passwordHelp: 'Account password',
      passwordHelpId: 'password-help',
      messages: { identifierRequired: 'Username is required.', identifierInvalid: 'Use three characters.', passwordRequired: 'Password is required.' },
      'aria-describedby': 'form-feedback',
    };
    const { rerender } = render(<SignInCardPage {...props} />);
    const input = screen.getByLabelText('Username');
    const password = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('autocomplete', 'username');
    expect(input).toHaveAttribute('minlength', '3');
    expect(input).toHaveAttribute('maxlength', '120');
    expect(screen.getByRole('form', { name: 'Sign in' })).toHaveAttribute('novalidate');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(input).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
    for (const [field, message, helpId] of [
      [input, 'Username is required.', 'username-help'],
      [password, 'Password is required.', 'password-help'],
    ] as const) {
      const error = screen.getByText(message).closest('[role="alert"]');
      expect(field).toHaveAttribute('aria-invalid', 'true');
      expect(field.getAttribute('aria-describedby')?.split(' ')).toEqual(expect.arrayContaining([helpId, error?.id]));
    }
    await userEvent.type(input, 'ab');
    expect(screen.getByText('Use three characters.')).toBeInTheDocument();
    await userEvent.type(input, 'c');
    await userEvent.type(password, 'secret');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(password).not.toHaveAttribute('aria-invalid');
    rerender(<SignInCardPage {...props} fieldInvalid={{ identifier: true, password: true }} feedbackId="credential-feedback" error="Credentials were not accepted." />);
    for (const [field, helpId] of [
      [input, 'username-help'],
      [password, 'password-help'],
    ] as const) {
      expect(field).toHaveAttribute('aria-invalid', 'true');
      expect(field.getAttribute('aria-describedby')?.split(' ')).toEqual(expect.arrayContaining([helpId, 'credential-feedback']));
    }
    expect(screen.getByRole('form', { name: 'Sign in' })).toHaveAttribute('aria-describedby', 'form-feedback');
    input.focus();
    ref.current?.focus('password');
    expect(password).toHaveFocus();
  });

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

  it('takes the heading copy from props', () => {
    render(<SignInCardPage title="Welcome back to the console" description="Sign in with your tenant account." />);
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome back to the console' })).toBeInTheDocument();
    expect(screen.getByText('Sign in with your tenant account.')).toBeInTheDocument();
  });
});

// Public rendering seams: identifier mode, theme, heading policy and validation/recovery state.
describe('SignInCardPage accessibility matrix', () => {
  for (const theme of ['dark', 'light', 'high_contrast'] as const) {
    for (const mode of ['email', 'username'] as const) {
      for (const suppressed of [false, true]) {
        for (const state of ['initial', 'errors'] as const) {
          it(`${theme} / ${mode} / headings ${!suppressed} / ${state}`, async () => {
            const onSubmit = vi.fn();
            const { container } = render(
              <ThemeProvider defaultMode={theme} storageKey={null}>
                <h1>Account access</h1>
                <SignInCardPage
                  identifier={
                    mode === 'username' ? { type: 'text', autoComplete: 'username', label: 'Username', help: 'Use your account name.', minLength: 3, maxLength: 120 } : undefined
                  }
                  suppressAllHeadings={suppressed}
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
