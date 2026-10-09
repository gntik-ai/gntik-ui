import { ThemeProvider } from '@gntik-ai/ui';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import type { ForgotPasswordFormRef } from '@gntik-ai/blocks';
import { expectNoAxeViolations } from '../test/a11y';
import ForgotPasswordPage from './Page';

describe('ForgotPasswordPage', () => {
  it('suppresses headings beside a page heading in request and sent states and hides optional regions', () => {
    const { container, rerender } = render(
      <>
        <h1>Account recovery</h1>
        <ForgotPasswordPage suppressAllHeadings footer={null} />
      </>,
    );
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(screen.getByRole('main').querySelector('h1,h2,h3,h4,h5,h6,[role="heading"]')).toBeNull();
    expect(screen.getByRole('form', { name: 'Reset password request' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Contact support' })).not.toBeInTheDocument();
    rerender(
      <>
        <h1>Account recovery</h1>
        <ForgotPasswordPage key="sent" defaultSent suppressAllHeadings footer={null} sentTitle={null} sentDescription={null} sentStatus={null} resendActions={null} />
      </>,
    );
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(screen.getByRole('main').querySelector('h1,h2,h3,h4,h5,h6,[role="heading"]')).toBeNull();
    expect(screen.queryByText('Check your email')).not.toBeInTheDocument();
    expect(screen.queryByText(/If an account exists/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Resend link' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Use a different email' })).not.toBeInTheDocument();
    rerender(<ForgotPasswordPage key="request" title="Recover access" description="Enter your account name." headingLevel="h2" footer="Account support" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Recover access' })).toBeInTheDocument();
    expect(screen.getByText('Enter your account name.')).toBeInTheDocument();
    expect(screen.getByText('Account support')).toBeInTheDocument();
    rerender(
      <>
        <h1 id="page-title">Account recovery</h1>
        <ForgotPasswordPage headingLevel={null} aria-labelledby="page-title" />
      </>,
    );
    expect(screen.getByRole('form', { name: 'Account recovery' })).toHaveAttribute('aria-labelledby', 'page-title');
  });

  it('forwards identifier, validation, focus and server feedback to recovery', async () => {
    const onSubmit = vi.fn();
    const ref = createRef<ForgotPasswordFormRef>();
    const props = {
      ref,
      onSubmit,
      identifier: {
        type: 'text' as const,
        autoComplete: 'username',
        label: 'Username or email',
        help: 'Account name or email',
        helpId: 'recovery-help',
        minLength: 3,
        maxLength: 255,
      },
      messages: { identifierRequired: 'Identifier is required.', identifierInvalid: 'Use three characters.' },
      'aria-describedby': 'form-feedback',
    };
    const { rerender } = render(<ForgotPasswordPage {...props} />);
    const input = screen.getByLabelText('Username or email');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('autocomplete', 'username');
    expect(input).toHaveAttribute('maxlength', '255');
    expect(screen.getByRole('form', { name: 'Reset password request' })).toHaveAttribute('novalidate');
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(input).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
    const error = screen.getByText('Identifier is required.').closest('[role="alert"]');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')?.split(' ')).toEqual(expect.arrayContaining(['recovery-help', error?.id]));
    await userEvent.type(input, 'ab');
    expect(screen.getByText('Use three characters.')).toBeInTheDocument();
    await userEvent.type(input, 'c');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAccessibleDescription('Account name or email');
    rerender(<ForgotPasswordPage {...props} fieldInvalid={{ identifier: true }} feedbackId="recovery-feedback" error="Request could not be completed." />);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')?.split(' ')).toEqual(expect.arrayContaining(['recovery-help', 'recovery-feedback']));
    expect(screen.getByRole('form', { name: 'Reset password request' })).toHaveAttribute('aria-describedby', 'form-feedback');
    screen.getByRole('button', { name: 'Send reset link' }).focus();
    ref.current?.focus('identifier');
    expect(input).toHaveFocus();
    rerender(<ForgotPasswordPage {...props} />);
    await userEvent.clear(input);
    await userEvent.type(input, '  avery  ');
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(onSubmit).toHaveBeenCalledWith('avery');
  });

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

// Public rendering seams: identifier mode, theme, heading policy and validation/recovery state.
describe('ForgotPasswordPage accessibility matrix', () => {
  for (const theme of ['dark', 'light', 'high_contrast'] as const) {
    for (const mode of ['email', 'username'] as const) {
      for (const suppressed of [false, true]) {
        for (const state of ['initial', 'errors', 'sent'] as const) {
          it(`${theme} / ${mode} / headings ${!suppressed} / ${state}`, async () => {
            const onSubmit = vi.fn();
            const { container } = render(
              <ThemeProvider defaultMode={theme} storageKey={null}>
                <h1>Account access</h1>
                <ForgotPasswordPage
                  identifier={
                    mode === 'username' ? { type: 'text', autoComplete: 'username', label: 'Username', help: 'Use your account name.', minLength: 3, maxLength: 255 } : undefined
                  }
                  suppressAllHeadings={suppressed}
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
