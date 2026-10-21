import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, en, es } from '@gntik-ai/ui';
import { ForgotPasswordForm, type ForgotPasswordFormLabels } from './ForgotPasswordForm';
import { expectNoAxeViolations } from '../../test/a11y';
it('preserves English request labels without a provider', () => {
  render(<ForgotPasswordForm />);
  expect(screen.getByText('Account recovery')).toBeVisible();
  expect(screen.getByText('Forgot your password?')).toBeVisible();
  expect(screen.getByText("Enter the email you sign in with and we'll send you a reset link.")).toBeVisible();
  expect(screen.getByText('Email')).toBeVisible();
  expect(screen.getByText('Back to sign in')).toBeVisible();
  expect(screen.getByRole('form', { name: 'Reset password request' })).toBeVisible();
  expect(screen.getByPlaceholderText('name@company.com')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Send reset link' })).toBeVisible();
});
it('translates every request and sent label and parameterised sent text', async () => {
  const { rerender } = render(
    <I18nProvider locale="es">
      <ForgotPasswordForm />
    </I18nProvider>,
  );
  expect(screen.getByText(es['forgotPassword.eyebrow'])).toBeVisible();
  expect(screen.getByText(es['forgotPassword.title'])).toBeVisible();
  expect(screen.getByText(es['forgotPassword.description'])).toBeVisible();
  expect(screen.getByText(es['forgotPassword.identifierLabel'])).toBeVisible();
  expect(screen.getByText(es['forgotPassword.backToSignIn'])).toBeVisible();
  expect(screen.getByPlaceholderText(es['forgotPassword.identifierPlaceholder'])).toBeVisible();
  fireEvent.submit(screen.getByRole('form', { name: es['forgotPassword.formLabel'] }));
  expect(screen.getByText('Introduce una dirección de correo válida.')).toBeVisible();
  fireEvent.change(screen.getByLabelText(es['forgotPassword.identifierLabel']), { target: { value: 'invalid' } });
  fireEvent.submit(screen.getByRole('form'));
  expect(screen.getByText('Introduce una dirección de correo válida.')).toBeVisible();
  await expectNoAxeViolations(screen.getByRole('form'));
  fireEvent.change(screen.getByLabelText(es['forgotPassword.identifierLabel']), { target: { value: 'a@example.com' } });
  await userEvent.click(screen.getByRole('button', { name: es['forgotPassword.submit'] }));
  expect(await screen.findByRole('heading', { name: es['forgotPassword.sentTitle'] })).toBeVisible();
  expect(
    screen.getByText(
      (_, element) =>
        element?.tagName === 'P' &&
        element.textContent ===
          'Si existe una cuenta para a@example.com, recibirás un enlace para restablecer tu contraseña. Caduca en 1 hora.',
    ),
  ).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(es['forgotPassword.sentStatus']);
  for (const key of ['resend', 'changeEmail'] as const)
    expect(screen.getByRole('button', { name: es[`forgotPassword.${key}`] })).toBeVisible();
  rerender(
    <I18nProvider locale="es">
      <ForgotPasswordForm key="sent" defaultSent onSubmit={() => Promise.reject(null)} />
    </I18nProvider>,
  );
  expect(screen.getByText(es['forgotPassword.addressFallback'])).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: es['forgotPassword.resend'] }));
  expect(await screen.findByText(es['forgotPassword.fallbackError'])).toBeVisible();
});
it.each(['en', 'es'])('honours labels and explicit props under %s', async (locale) => {
  const labels: ForgotPasswordFormLabels = {
    formLabel: 'Custom formLabel',
    eyebrow: 'Custom eyebrow',
    title: 'Custom title',
    description: 'Custom description',
    sentTitle: 'Custom sentTitle',
    sentDescription: (email) => `Custom sent ${email}`,
    addressFallback: 'Custom addressFallback',
    sentStatus: 'Custom sentStatus',
    fallbackError: 'Custom fallbackError',
    backToSignIn: 'Custom backToSignIn',
    resend: 'Custom resend',
    changeEmail: 'Custom changeEmail',
    identifierLabel: 'Custom identifierLabel',
    identifierPlaceholder: 'Custom identifierPlaceholder',
    submit: 'Custom submit',
    identifierRequired: 'Custom required',
    identifierInvalid: 'Custom invalid',
    identifierTooShort: 'Custom short',
  };
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <ForgotPasswordForm labels={labels} />
    </I18nProvider>,
  );
  expect(screen.getByText(labels.eyebrow)).toBeVisible();
  expect(screen.getByText(labels.title)).toBeVisible();
  expect(screen.getByText(labels.description)).toBeVisible();
  expect(screen.getByText(labels.identifierLabel)).toBeVisible();
  expect(screen.getByText(labels.backToSignIn)).toBeVisible();
  expect(screen.getByPlaceholderText(labels.identifierPlaceholder)).toBeVisible();
  fireEvent.submit(screen.getByRole('form', { name: labels.formLabel }));
  expect(screen.getByText(labels.identifierRequired)).toBeVisible();
  rerender(
    <I18nProvider locale={locale}>
      <ForgotPasswordForm
        labels={labels}
        aria-label="Explicit form"
        eyebrow="Explicit eyebrow"
        title="Explicit title"
        description="Explicit description"
        identifier={{ label: 'Explicit identifier', placeholder: 'Explicit placeholder' }}
        messages={{ identifierRequired: 'Explicit required' }}
      />
    </I18nProvider>,
  );
  for (const text of ['Explicit eyebrow', 'Explicit title', 'Explicit description', 'Explicit identifier'])
    expect(screen.getByText(text)).toBeVisible();
  expect(screen.getByPlaceholderText('Explicit placeholder')).toBeVisible();
  fireEvent.submit(screen.getByRole('form', { name: 'Explicit form' }));
  expect(screen.getByText('Explicit required')).toBeVisible();
  rerender(
    <I18nProvider locale={locale}>
      <ForgotPasswordForm key="sent" labels={labels} defaultSent onSubmit={() => Promise.reject(null)} />
    </I18nProvider>,
  );
  expect(screen.getByRole('heading', { name: labels.sentTitle })).toBeVisible();
  expect(screen.getByText('Custom sent Custom addressFallback')).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(labels.sentStatus);
  expect(screen.getByRole('button', { name: labels.changeEmail })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: labels.resend }));
  expect(await screen.findByText(labels.fallbackError)).toBeVisible();
  rerender(
    <I18nProvider locale={locale}>
      <ForgotPasswordForm
        key="sent"
        labels={labels}
        defaultSent
        sentTitle="Explicit sent"
        sentDescription="Explicit sent help"
        sentStatus="Explicit status"
      />
    </I18nProvider>,
  );
  expect(screen.getByRole('heading', { name: 'Explicit sent' })).toBeVisible();
  expect(screen.getByText('Explicit sent help')).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('Explicit status');
});
it('freezes the original English catalog copy', () => {
  expect(en['forgotPassword.formLabel']).toBe('Reset password request');
  expect(en['forgotPassword.eyebrow']).toBe('Account recovery');
  expect(en['forgotPassword.title']).toBe('Forgot your password?');
  expect(en['forgotPassword.description']).toBe("Enter the email you sign in with and we'll send you a reset link.");
  expect(en['forgotPassword.sentTitle']).toBe('Check your email');
  expect(en['forgotPassword.sentDescription']).toBe(
    'If an account exists for {email}, you will receive a link to reset your password. It expires in 1 hour.',
  );
  expect(en['forgotPassword.addressFallback']).toBe('that address');
  expect(en['forgotPassword.sentStatus']).toBe('Reset link sent.');
  expect(en['forgotPassword.fallbackError']).toBe('The reset link could not be sent.');
  expect(en['forgotPassword.backToSignIn']).toBe('Back to sign in');
  expect(en['forgotPassword.resend']).toBe('Resend link');
  expect(en['forgotPassword.changeEmail']).toBe('Use a different email');
  expect(en['forgotPassword.identifierLabel']).toBe('Email');
  expect(en['forgotPassword.identifierPlaceholder']).toBe('name@company.com');
  expect(en['forgotPassword.submit']).toBe('Send reset link');
});

it.each(['en', 'es'])('uses custom invalid and short identifier messages under %s', (locale) => {
  const labels = {
    submit: 'Custom send',
    identifierInvalid: 'Custom invalid identifier',
    identifierTooShort: 'Custom short identifier',
  };
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <ForgotPasswordForm labels={labels} />
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Custom send' })).toBeVisible();
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'invalid' } });
  fireEvent.submit(screen.getByRole('form'));
  expect(screen.getByText('Custom invalid identifier')).toBeVisible();
  rerender(
    <I18nProvider locale={locale}>
      <ForgotPasswordForm labels={labels} identifier={{ type: 'text', minLength: 10 }} />
    </I18nProvider>,
  );
  fireEvent.submit(screen.getByRole('form'));
  expect(screen.getByText('Custom short identifier')).toBeVisible();
});
