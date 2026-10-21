import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, en, es } from '@gntik-ai/ui';
import { ResetPasswordForm, type ResetPasswordFormLabels } from './ResetPasswordForm';
import { expectNoAxeViolations } from '../../test/a11y';
it('preserves English defaults without a provider', () => {
  render(<ResetPasswordForm />);
  expect(screen.getByRole('heading', { name: 'Set a new password' })).toBeVisible();
  expect(screen.getByRole('form', { name: 'Set a new password' })).toBeVisible();
  expect(screen.getByText('Account recovery')).toBeVisible();
  expect(screen.getByText('Use at least 8 characters. Avoid passwords you use elsewhere.')).toBeVisible();
  expect(screen.getByLabelText('New password')).toBeVisible();
  expect(screen.getByLabelText('Confirm password')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Update password' })).toBeVisible();
});
it('translates every label, parameterised validation and success state', async () => {
  let fails = true;
  render(
    <I18nProvider locale="es">
      <ResetPasswordForm onSubmit={() => (fails ? Promise.reject(null) : undefined)} minPasswordLength={10} />
    </I18nProvider>,
  );
  expect(screen.getByText(es['resetPassword.eyebrow'])).toBeVisible();
  expect(screen.getByRole('heading', { name: es['resetPassword.title'] })).toBeVisible();
  expect(screen.getByText('Usa al menos 10 caracteres. Evita contraseñas que uses en otros sitios.')).toBeVisible();
  fireEvent.submit(screen.getByRole('form', { name: es['resetPassword.title'] }));
  expect(screen.getByText('Usa al menos 10 caracteres.')).toBeVisible();
  fireEvent.change(screen.getByLabelText(es['resetPassword.newPassword']), { target: { value: 'password123' } });
  await userEvent.click(screen.getByRole('button', { name: es['resetPassword.submit'] }));
  expect(screen.getByText(es['resetPassword.passwordMismatch'])).toBeVisible();
  fireEvent.change(screen.getByLabelText(es['resetPassword.confirmPassword']), { target: { value: 'password123' } });
  await userEvent.click(screen.getByRole('button', { name: es['resetPassword.submit'] }));
  expect(await screen.findByText(es['resetPassword.fallbackError'])).toBeVisible();
  await expectNoAxeViolations(screen.getByRole('form'));
  fails = false;
  await userEvent.click(screen.getByRole('button', { name: es['resetPassword.submit'] }));
  expect(await screen.findByRole('heading', { name: es['resetPassword.successTitle'] })).toBeVisible();
  expect(screen.getByText(es['resetPassword.successDescription'])).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(es['resetPassword.successStatus']);
  expect(screen.getByRole('button', { name: es['resetPassword.continue'] })).toBeVisible();
});
it.each(['en', 'es'])('honours all label overrides under %s', async (locale) => {
  const labels: ResetPasswordFormLabels = {
    eyebrow: 'Custom eyebrow',
    title: 'Custom title',
    description: (minimum) => `Custom description ${minimum}`,
    newPassword: 'Custom newPassword',
    confirmPassword: 'Custom confirmPassword',
    passwordTooShort: (minimum) => `Custom passwordTooShort ${minimum}`,
    passwordMismatch: 'Custom passwordMismatch',
    submit: 'Custom submit',
    successTitle: 'Custom successTitle',
    successDescription: 'Custom successDescription',
    successStatus: 'Custom successStatus',
    continue: 'Custom continue',
    fallbackError: 'Custom fallbackError',
  };
  let fails = true;
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <ResetPasswordForm labels={labels} onSubmit={() => (fails ? Promise.reject(null) : undefined)} />
    </I18nProvider>,
  );
  expect(screen.getByText(labels.eyebrow)).toBeVisible();
  expect(screen.getByRole('heading', { name: labels.title })).toBeVisible();
  expect(screen.getByText('Custom description 8')).toBeVisible();
  fireEvent.submit(screen.getByRole('form', { name: labels.title }));
  expect(screen.getByText('Custom passwordTooShort 8')).toBeVisible();
  fireEvent.change(screen.getByLabelText(labels.newPassword), { target: { value: 'password123' } });
  await userEvent.click(screen.getByRole('button', { name: labels.submit }));
  expect(screen.getByText(labels.passwordMismatch)).toBeVisible();
  fireEvent.change(screen.getByLabelText(labels.confirmPassword), { target: { value: 'password123' } });
  await userEvent.click(screen.getByRole('button', { name: labels.submit }));
  expect(await screen.findByText(labels.fallbackError)).toBeVisible();
  fails = false;
  await userEvent.click(screen.getByRole('button', { name: labels.submit }));
  expect(await screen.findByRole('heading', { name: labels.successTitle })).toBeVisible();
  expect(screen.getByText(labels.successDescription)).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(labels.successStatus);
  expect(screen.getByRole('button', { name: labels.continue })).toBeVisible();
  rerender(
    <I18nProvider locale={locale}>
      <ResetPasswordForm labels={labels} eyebrow="Explicit eyebrow" />
    </I18nProvider>,
  );
  expect(screen.getByText('Explicit eyebrow')).toBeVisible();
});
it('freezes the original English catalog values', () => {
  expect(en['resetPassword.eyebrow']).toBe('Account recovery');
  expect(en['resetPassword.title']).toBe('Set a new password');
  expect(en['resetPassword.description']).toBe('Use at least {minimum} characters. Avoid passwords you use elsewhere.');
  expect(en['resetPassword.newPassword']).toBe('New password');
  expect(en['resetPassword.confirmPassword']).toBe('Confirm password');
  expect(en['resetPassword.passwordTooShort']).toBe('Use at least {minimum} characters.');
  expect(en['resetPassword.passwordMismatch']).toBe("Passwords don't match.");
  expect(en['resetPassword.submit']).toBe('Update password');
  expect(en['resetPassword.successTitle']).toBe('Password updated');
  expect(en['resetPassword.successDescription']).toBe(
    'You can now sign in with your new password. Other sessions were signed out.',
  );
  expect(en['resetPassword.successStatus']).toBe('Password updated.');
  expect(en['resetPassword.continue']).toBe('Continue to sign in');
  expect(en['resetPassword.fallbackError']).toBe('Your password could not be updated.');
});
