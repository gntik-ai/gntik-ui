import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, en, es } from '@gntik-ai/ui';
import { SignUpForm, type SignUpFormLabels } from './SignUpForm';
import { expectNoAxeViolations } from '../../test/a11y';
it('preserves English text and accessible names without a provider', () => {
  render(<SignUpForm />);
  expect(screen.getByText('Get started')).toBeVisible();
  expect(screen.getByText('Create your account')).toBeVisible();
  expect(screen.getByText('Set up a workspace for your team in a couple of minutes.')).toBeVisible();
  expect(screen.getByText('Full name')).toBeVisible();
  expect(screen.getByText('Work email')).toBeVisible();
  expect(screen.getByText('Password')).toBeVisible();
  expect(screen.getByText('Terms')).toBeVisible();
  expect(screen.getByText('Privacy Policy')).toBeVisible();
  expect(screen.getByText('Or sign up with')).toBeVisible();
  expect(screen.getByText('Already have an account?')).toBeVisible();
  expect(screen.getByText('Sign in')).toBeVisible();
  expect(screen.getByRole('form', { name: 'Create account' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Create account' })).toBeVisible();
  expect(screen.getByRole('checkbox', { name: 'I agree to the Terms and Privacy Policy.' })).toBeVisible();
  expect(screen.getByPlaceholderText('Avery Collins')).toBeVisible();
  expect(screen.getByPlaceholderText('name@company.com')).toBeVisible();
});
it('translates every static default, validation, async fallback and policy loading state', async () => {
  const { rerender } = render(
    <I18nProvider locale="es">
      <SignUpForm onSubmit={() => Promise.reject(null)} />
    </I18nProvider>,
  );
  expect(screen.getByText(es['signUp.eyebrow'])).toBeVisible();
  expect(screen.getByText(es['signUp.title'])).toBeVisible();
  expect(screen.getByText(es['signUp.description'])).toBeVisible();
  expect(screen.getByText(es['signUp.name'])).toBeVisible();
  expect(screen.getByText(es['signUp.email'])).toBeVisible();
  expect(screen.getByText(es['signUp.password'])).toBeVisible();
  expect(screen.getByText(es['signUp.terms'])).toBeVisible();
  expect(screen.getByText(es['signUp.privacy'])).toBeVisible();
  expect(screen.getByText(es['signUp.divider'])).toBeVisible();
  expect(screen.getByText(es['signUp.signInPrompt'])).toBeVisible();
  expect(screen.getByText(es['signUp.signIn'])).toBeVisible();
  expect(screen.getByPlaceholderText(es['signUp.namePlaceholder'])).toHaveAccessibleName(es['signUp.name']);
  expect(screen.getByPlaceholderText(es['signUp.emailPlaceholder'])).toHaveAccessibleName(es['signUp.email']);
  expect(screen.getByRole('checkbox', { name: 'Acepto los Términos y la Política de privacidad.' })).toBeVisible();
  fireEvent.submit(screen.getByRole('form', { name: es['signUp.submit'] }));
  expect(screen.getByText(es['signUp.nameRequired'])).toBeVisible();
  expect(screen.getByText('Introduce una dirección de correo válida.')).toBeVisible();
  expect(screen.getByText('Usa al menos 8 caracteres.')).toBeVisible();
  expect(screen.getByText(es['signUp.termsRequired'])).toBeVisible();
  await expectNoAxeViolations(screen.getByRole('form'));
  fireEvent.change(screen.getByLabelText(es['signUp.name']), { target: { value: 'Avery' } });
  fireEvent.change(screen.getByLabelText(es['signUp.email']), { target: { value: 'a@example.com' } });
  fireEvent.change(screen.getByLabelText(es['signUp.password']), { target: { value: 'password123' } });
  await userEvent.click(screen.getByRole('checkbox'));
  await userEvent.click(screen.getByRole('button', { name: es['signUp.submit'] }));
  expect(await screen.findByText(es['signUp.fallbackError'])).toBeVisible();
  rerender(
    <I18nProvider locale="es">
      <SignUpForm policyLoading />
    </I18nProvider>,
  );
  expect(screen.getByRole('status')).toHaveTextContent(es['signUp.policyLoading']);
});
it('uses hand-written Spanish parameterised field validation through configured forms', () => {
  render(
    <I18nProvider locale="es">
      <SignUpForm
        fields={[
          { id: 'name', label: 'Nombre', required: true },
          { id: 'email', label: 'Correo', type: 'email', required: true },
        ]}
        minPasswordLength={12}
      />
    </I18nProvider>,
  );
  fireEvent.submit(screen.getByRole('form'));
  expect(screen.getByText('Introduce Nombre.')).toBeVisible();
  expect(screen.getByText('Introduce Correo.')).toBeVisible();
  expect(screen.getByText('Usa al menos 12 caracteres.')).toBeVisible();
  expect(screen.getByRole('link', { name: 'Nombre: Introduce Nombre.' })).toBeVisible();
  expect(screen.getByRole('link', { name: 'Contraseña: Usa al menos 12 caracteres.' })).toBeVisible();
  fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'invalid' } });
  fireEvent.submit(screen.getByRole('form'));
  expect(screen.getByText('Introduce una dirección de correo válida.')).toBeVisible();
});
it.each(['en', 'es'])('honours every label override and explicit validation under %s', async (locale) => {
  const labels: SignUpFormLabels = {
    eyebrow: 'Custom eyebrow',
    title: 'Custom title',
    description: 'Custom description',
    name: 'Custom name',
    namePlaceholder: 'Custom namePlaceholder',
    nameRequired: 'Custom nameRequired',
    email: 'Custom email',
    emailPlaceholder: 'Custom emailPlaceholder',
    password: 'Custom password',
    termsRequired: 'Custom termsRequired',
    terms: 'Custom terms',
    privacy: 'Custom privacy',
    submit: 'Custom submit',
    divider: 'Custom divider',
    signInPrompt: 'Custom signInPrompt',
    signIn: 'Custom signIn',
    policyLoading: 'Custom policyLoading',
    fallbackError: 'Custom fallbackError',
    emailInvalid: 'Custom email error',
    fieldRequired: (label) => `Custom required ${label}`,
    fieldInvalid: 'Custom field invalid',
    passwordTooShort: (minimum) => `Custom minimum ${minimum}`,
    termsConsent: (terms, privacy) => (
      <>
        Custom consent {terms} {privacy}
      </>
    ),
  };
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <SignUpForm labels={labels} />
    </I18nProvider>,
  );
  expect(screen.getByText(labels.eyebrow)).toBeVisible();
  expect(screen.getByText(labels.title)).toBeVisible();
  expect(screen.getByText(labels.description)).toBeVisible();
  expect(screen.getByText(labels.name)).toBeVisible();
  expect(screen.getByText(labels.email)).toBeVisible();
  expect(screen.getByText(labels.password)).toBeVisible();
  expect(screen.getByText(labels.terms)).toBeVisible();
  expect(screen.getByText(labels.privacy)).toBeVisible();
  expect(screen.getByText(labels.divider)).toBeVisible();
  expect(screen.getByText(labels.signInPrompt)).toBeVisible();
  expect(screen.getByText(labels.signIn)).toBeVisible();
  expect(screen.getByRole('checkbox', { name: 'Custom consent Custom terms Custom privacy' })).toBeVisible();
  expect(screen.getByPlaceholderText(labels.namePlaceholder)).toBeVisible();
  expect(screen.getByPlaceholderText(labels.emailPlaceholder)).toBeVisible();
  fireEvent.submit(screen.getByRole('form', { name: labels.submit }));
  for (const text of [labels.nameRequired, labels.emailInvalid, 'Custom minimum 8', labels.termsRequired])
    expect(screen.getByText(text)).toBeVisible();
  fireEvent.change(screen.getByLabelText(labels.name), { target: { value: 'Avery' } });
  fireEvent.change(screen.getByLabelText(labels.email), { target: { value: 'a@example.com' } });
  fireEvent.change(screen.getByLabelText(labels.password), { target: { value: 'password123' } });
  await userEvent.click(screen.getByRole('checkbox'));
  rerender(
    <I18nProvider locale={locale}>
      <SignUpForm labels={labels} onSubmit={() => Promise.reject(null)} />
    </I18nProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: labels.submit }));
  expect(await screen.findByText(labels.fallbackError)).toBeVisible();
  rerender(
    <I18nProvider locale={locale}>
      <SignUpForm
        key="configured"
        labels={labels}
        fields={[
          { id: 'name', label: 'Consumer field', required: true },
          { id: 'email', label: 'Consumer email', type: 'email' },
        ]}
      />
    </I18nProvider>,
  );
  fireEvent.submit(screen.getByRole('form'));
  expect(screen.getByText('Custom required Consumer field')).toBeVisible();
  fireEvent.change(screen.getByLabelText('Consumer email'), { target: { value: 'invalid' } });
  fireEvent.submit(screen.getByRole('form'));
  expect(screen.getByText('Custom field invalid')).toBeVisible();
  rerender(
    <I18nProvider locale={locale}>
      <SignUpForm
        key="configured"
        labels={labels}
        title="Explicit title"
        description="Explicit description"
        eyebrow="Explicit eyebrow"
        fields={[{ id: 'name', label: 'Consumer field', required: true, messages: { required: 'Explicit field' } }]}
        messages={{ passwordTooShort: (minimum) => `Explicit minimum ${minimum}`, termsRequired: 'Explicit terms' }}
      />
    </I18nProvider>,
  );
  fireEvent.submit(screen.getByRole('form'));
  for (const text of [
    'Explicit title',
    'Explicit description',
    'Explicit eyebrow',
    'Explicit field',
    'Explicit minimum 8',
    'Explicit terms',
  ])
    expect(screen.getByText(text)).toBeVisible();
  rerender(
    <I18nProvider locale={locale}>
      <SignUpForm labels={labels} policyLoading />
    </I18nProvider>,
  );
  expect(screen.getByRole('status')).toHaveTextContent(labels.policyLoading);
});
it('freezes every original English message', () => {
  expect(en['signUp.eyebrow']).toBe('Get started');
  expect(en['signUp.title']).toBe('Create your account');
  expect(en['signUp.description']).toBe('Set up a workspace for your team in a couple of minutes.');
  expect(en['signUp.name']).toBe('Full name');
  expect(en['signUp.namePlaceholder']).toBe('Avery Collins');
  expect(en['signUp.nameRequired']).toBe('Enter your name.');
  expect(en['signUp.email']).toBe('Work email');
  expect(en['signUp.emailPlaceholder']).toBe('name@company.com');
  expect(en['signUp.password']).toBe('Password');
  expect(en['signUp.passwordTooShort']).toBe('Use at least {minimum} characters.');
  expect(en['signUp.termsRequired']).toBe('Accept the terms to continue.');
  expect(en['signUp.terms']).toBe('Terms');
  expect(en['signUp.privacy']).toBe('Privacy Policy');
  expect(en['signUp.termsConsent']).toBe('I agree to the {terms} and {privacy}.');
  expect(en['signUp.submit']).toBe('Create account');
  expect(en['signUp.divider']).toBe('Or sign up with');
  expect(en['signUp.signInPrompt']).toBe('Already have an account?');
  expect(en['signUp.signIn']).toBe('Sign in');
  expect(en['signUp.policyLoading']).toBe('Loading sign-up policy\u2026');
  expect(en['signUp.fallbackError']).toBe('The account could not be created.');
});
