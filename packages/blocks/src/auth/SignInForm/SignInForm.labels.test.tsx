import { fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider, es } from '@gntik-ai/ui';
import { SignInForm, type SignInFormLabels } from './SignInForm';
import { expectNoAxeViolations } from '../../test/a11y';
it('preserves every English default and translates the Spanish form and validation', async () => {
  const { rerender } = render(<SignInForm />);
  expect(screen.getByText('Secure access')).toBeVisible();
  expect(screen.getByText('Sign in to your workspace')).toBeVisible();
  expect(screen.getByText('Use your work email to continue.')).toBeVisible();
  expect(screen.getByText('Email')).toBeVisible();
  expect(screen.getByText('Password')).toBeVisible();
  expect(screen.getByText('Forgot password?')).toBeVisible();
  expect(screen.getByText('Keep me signed in')).toBeVisible();
  expect(screen.getByText('Or continue with')).toBeVisible();
  expect(screen.getByText('New here?')).toBeVisible();
  expect(screen.getByText('Create an account')).toBeVisible();
  expect(screen.getByRole('form', { name: 'Sign in' })).toBeVisible();
  expect(screen.getByPlaceholderText('name@company.com')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeVisible();
  rerender(
    <I18nProvider locale="es">
      <SignInForm />
    </I18nProvider>,
  );
  expect(screen.getByText(es['signIn.eyebrow'])).toBeVisible();
  expect(screen.getByText(es['signIn.title'])).toBeVisible();
  expect(screen.getByText(es['signIn.description'])).toBeVisible();
  expect(screen.getByText(es['signIn.identifierLabel'])).toBeVisible();
  expect(screen.getByText(es['signIn.password'])).toBeVisible();
  expect(screen.getByText(es['signIn.forgotPassword'])).toBeVisible();
  expect(screen.getByText(es['signIn.remember'])).toBeVisible();
  expect(screen.getByText(es['signIn.divider'])).toBeVisible();
  expect(screen.getByText(es['signIn.signUpPrompt'])).toBeVisible();
  expect(screen.getByText(es['signIn.signUp'])).toBeVisible();
  expect(screen.getByPlaceholderText(es['signIn.identifierPlaceholder'])).toBeVisible();
  const form = screen.getByRole('form', { name: es['signIn.formLabel'] });
  fireEvent.submit(form);
  expect(screen.getByText('Introduce una dirección de correo válida.')).toBeVisible();
  expect(screen.getByText(es['signIn.passwordRequired'])).toBeVisible();
  await expectNoAxeViolations(form);
});
it.each(['en', 'es'])('honours all label overrides and existing explicit props under %s', (locale) => {
  const labels: SignInFormLabels = {
    eyebrow: 'Custom eyebrow',
    title: 'Custom title',
    description: 'Custom description',
    formLabel: 'Custom formLabel',
    identifierLabel: 'Custom identifierLabel',
    identifierPlaceholder: 'Custom identifierPlaceholder',
    password: 'Custom password',
    forgotPassword: 'Custom forgotPassword',
    passwordRequired: 'Custom passwordRequired',
    remember: 'Custom remember',
    submit: 'Custom submit',
    divider: 'Custom divider',
    signUpPrompt: 'Custom signUpPrompt',
    signUp: 'Custom signUp',
    fallbackError: 'Custom fallbackError',
    identifierRequired: 'Custom required',
    identifierInvalid: 'Custom invalid',
    identifierTooShort: 'Custom short',
  };
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <SignInForm labels={labels} />
    </I18nProvider>,
  );
  expect(screen.getByText(labels.eyebrow)).toBeVisible();
  expect(screen.getByText(labels.title)).toBeVisible();
  expect(screen.getByText(labels.description)).toBeVisible();
  expect(screen.getByText(labels.identifierLabel)).toBeVisible();
  expect(screen.getByText(labels.password)).toBeVisible();
  expect(screen.getByText(labels.forgotPassword)).toBeVisible();
  expect(screen.getByText(labels.remember)).toBeVisible();
  expect(screen.getByText(labels.divider)).toBeVisible();
  expect(screen.getByText(labels.signUpPrompt)).toBeVisible();
  expect(screen.getByText(labels.signUp)).toBeVisible();
  expect(screen.getByPlaceholderText(labels.identifierPlaceholder)).toBeVisible();
  fireEvent.submit(screen.getByRole('form', { name: labels.formLabel }));
  expect(screen.getByText(labels.identifierRequired)).toBeVisible();
  expect(screen.getByText(labels.passwordRequired)).toBeVisible();
  rerender(
    <I18nProvider locale={locale}>
      <SignInForm
        labels={labels}
        title="Explicit title"
        description="Explicit description"
        eyebrow="Explicit eyebrow"
        aria-label="Explicit form"
        identifier={{ label: 'Explicit identifier', placeholder: 'Explicit placeholder' }}
        messages={{ identifierRequired: 'Explicit required', passwordRequired: 'Explicit password' }}
        signUpPrompt="Explicit prompt"
      />
    </I18nProvider>,
  );
  for (const text of [
    'Explicit title',
    'Explicit description',
    'Explicit eyebrow',
    'Explicit identifier',
    'Explicit prompt',
  ])
    expect(screen.getByText(text)).toBeVisible();
  expect(screen.getByPlaceholderText('Explicit placeholder')).toBeVisible();
  fireEvent.submit(screen.getByRole('form', { name: 'Explicit form' }));
  expect(screen.getByText('Explicit required')).toBeVisible();
  expect(screen.getByText('Explicit password')).toBeVisible();
});
it('uses translated fallback on an async rejection and preserves server messages', async () => {
  render(
    <I18nProvider locale="es">
      <SignInForm defaultEmail="a@example.com" onSubmit={() => Promise.reject(null)} />
    </I18nProvider>,
  );
  fireEvent.change(screen.getByLabelText(es['signIn.password']), { target: { value: 'password' } });
  fireEvent.submit(screen.getByRole('form'));
  expect(await screen.findByText(es['signIn.fallbackError'])).toBeVisible();
});

it.each(['en', 'es'])('uses custom invalid and short identifier messages under %s', (locale) => {
  const labels = { identifierInvalid: 'Custom invalid identifier', identifierTooShort: 'Custom short identifier' };
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <SignInForm labels={labels} />
    </I18nProvider>,
  );
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'invalid' } });
  fireEvent.submit(screen.getByRole('form'));
  expect(screen.getByText('Custom invalid identifier')).toBeVisible();
  rerender(
    <I18nProvider locale={locale}>
      <SignInForm labels={labels} identifier={{ type: 'text', minLength: 10 }} />
    </I18nProvider>,
  );
  fireEvent.submit(screen.getByRole('form'));
  expect(screen.getByText('Custom short identifier')).toBeVisible();
});
