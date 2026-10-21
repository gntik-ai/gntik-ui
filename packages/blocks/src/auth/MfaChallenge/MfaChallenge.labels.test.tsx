import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, en, es } from '@gntik-ai/ui';
import { MfaChallenge, type MfaChallengeLabels } from './MfaChallenge';
import { expectNoAxeViolations } from '../../test/a11y';
it('preserves English defaults without a provider', () => {
  render(<MfaChallenge onResend={() => {}} onCancel={() => {}} />);
  for (const text of [
    'Two-step verification',
    'Enter your verification code',
    'Open your authenticator app and enter the 6-digit code.',
    'Verification code',
  ])
    expect(screen.getByText(text)).toBeVisible();
  expect(screen.getByRole('form', { name: 'Verify your identity' })).toBeVisible();
  for (const name of ['Verify', 'Use a backup code', 'Back to sign in', 'Resend code in 30s'])
    expect(screen.getByRole('button', { name })).toBeVisible();
});
it('translates all modes, validation, countdowns and resend feedback', async () => {
  const { rerender } = render(
    <I18nProvider locale="es">
      <MfaChallenge onResend={() => {}} onCancel={() => {}} initialCooldown={0} onVerify={() => Promise.reject(null)} />
    </I18nProvider>,
  );
  for (const key of ['eyebrow', 'title', 'codeLabel'] as const)
    expect(screen.getByText(es[`mfaChallenge.${key}`])).toBeVisible();
  expect(screen.getByText('Abre tu aplicación de autenticación e introduce el código de 6 dígitos.')).toBeVisible();
  fireEvent.submit(screen.getByRole('form', { name: es['mfaChallenge.formLabel'] }));
  expect(screen.getByText('Introduce los 6 dígitos.')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: es['mfaChallenge.resend'] }));
  expect(screen.getByRole('status')).toHaveTextContent(es['mfaChallenge.resent']);
  expect(screen.getByRole('button', { name: 'Reenviar código en 30s' })).toBeVisible();
  expect(screen.getByRole('button', { name: es['mfaChallenge.backToSignIn'] })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: es['mfaChallenge.backupTitle'] }));
  expect(screen.getByRole('heading', { name: es['mfaChallenge.backupTitle'] })).toBeVisible();
  expect(screen.getByText(es['mfaChallenge.backupDescription'])).toBeVisible();
  expect(screen.getByText(es['mfaChallenge.backupHint'])).toBeVisible();
  const input = screen.getByPlaceholderText(es['mfaChallenge.backupPlaceholder']);
  expect(input).toHaveAccessibleName(es['mfaChallenge.backupLabel']);
  await userEvent.click(screen.getByRole('button', { name: es['mfaChallenge.submit'] }));
  expect(screen.getByText(es['mfaChallenge.backupRequired'])).toBeVisible();
  fireEvent.change(input, { target: { value: 'abcd-efgh' } });
  await userEvent.click(screen.getByRole('button', { name: es['mfaChallenge.submit'] }));
  expect(await screen.findByText(es['mfaChallenge.fallbackError'])).toBeVisible();
  await expectNoAxeViolations(screen.getByRole('form'));
  await userEvent.click(screen.getByRole('button', { name: es['mfaChallenge.useCode'] }));
  rerender(
    <I18nProvider locale="es">
      <MfaChallenge destination="a@example.com" />
    </I18nProvider>,
  );
  expect(screen.getByText('Hemos enviado un código de 6 dígitos a a@example.com.')).toBeVisible();
});
it.each(['en', 'es'])('honours all label overrides and explicit heading props under %s', async (locale) => {
  const labels: MfaChallengeLabels = {
    eyebrow: 'Custom eyebrow',
    title: 'Custom title',
    backupTitle: 'Custom backupTitle',
    backupDescription: 'Custom backupDescription',
    formLabel: 'Custom formLabel',
    codeLabel: 'Custom codeLabel',
    backupLabel: 'Custom backupLabel',
    backupPlaceholder: 'Custom backupPlaceholder',
    backupHint: 'Custom backupHint',
    backupRequired: 'Custom backupRequired',
    submit: 'Custom submit',
    useCode: 'Custom useCode',
    resend: 'Custom resend',
    resent: 'Custom resent',
    backToSignIn: 'Custom backToSignIn',
    fallbackError: 'Custom fallbackError',
    destinationDescription: (length, destination) => `Custom destination ${length} ${destination}`,
    description: (length) => `Custom description ${length}`,
    codeRequired: (length) => `Custom digits ${length}`,
    resendIn: (remaining) => `Custom wait ${remaining}`,
  };
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <MfaChallenge
        labels={labels}
        onResend={() => {}}
        initialCooldown={0}
        onCancel={() => {}}
        onVerify={() => Promise.reject(null)}
      />
    </I18nProvider>,
  );
  for (const text of [labels.eyebrow, labels.title, labels.codeLabel, 'Custom description 6'])
    expect(screen.getByText(text)).toBeVisible();
  expect(screen.getByRole('button', { name: labels.backToSignIn })).toBeVisible();
  fireEvent.submit(screen.getByRole('form', { name: labels.formLabel }));
  expect(screen.getByText('Custom digits 6')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: labels.resend }));
  expect(screen.getByRole('button', { name: 'Custom wait 30' })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(labels.resent);
  await userEvent.click(screen.getByRole('button', { name: labels.backupTitle }));
  expect(screen.getByRole('heading', { name: labels.backupTitle })).toBeVisible();
  for (const text of [labels.backupDescription, labels.backupHint]) expect(screen.getByText(text)).toBeVisible();
  const input = screen.getByPlaceholderText(labels.backupPlaceholder);
  expect(input).toHaveAccessibleName(labels.backupLabel);
  await userEvent.click(screen.getByRole('button', { name: labels.submit }));
  expect(screen.getByText(labels.backupRequired)).toBeVisible();
  fireEvent.change(input, { target: { value: 'abcd-efgh' } });
  await userEvent.click(screen.getByRole('button', { name: labels.submit }));
  expect(await screen.findByText(labels.fallbackError)).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: labels.useCode }));
  rerender(
    <I18nProvider locale={locale}>
      <MfaChallenge labels={labels} eyebrow="Explicit eyebrow" title="Explicit title" destination="recipient" />
    </I18nProvider>,
  );
  expect(screen.getByText('Explicit eyebrow')).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Explicit title' })).toBeVisible();
  expect(screen.getByText('Custom destination 6 recipient')).toBeVisible();
});
it('freezes every original English message', () => {
  expect(en['mfaChallenge.eyebrow']).toBe('Two-step verification');
  expect(en['mfaChallenge.title']).toBe('Enter your verification code');
  expect(en['mfaChallenge.backupTitle']).toBe('Use a backup code');
  expect(en['mfaChallenge.backupDescription']).toBe(
    'Enter one of the backup codes you saved when you turned on two-step verification. Each code works once.',
  );
  expect(en['mfaChallenge.destinationDescription']).toBe('We sent a {length}-digit code to {destination}.');
  expect(en['mfaChallenge.description']).toBe('Open your authenticator app and enter the {length}-digit code.');
  expect(en['mfaChallenge.formLabel']).toBe('Verify your identity');
  expect(en['mfaChallenge.codeLabel']).toBe('Verification code');
  expect(en['mfaChallenge.codeRequired']).toBe('Enter all {length} digits.');
  expect(en['mfaChallenge.backupLabel']).toBe('Backup code');
  expect(en['mfaChallenge.backupPlaceholder']).toBe('xxxx-xxxx');
  expect(en['mfaChallenge.backupHint']).toBe('Backup codes are 8 characters, with or without the dash.');
  expect(en['mfaChallenge.backupRequired']).toBe('Enter a backup code.');
  expect(en['mfaChallenge.submit']).toBe('Verify');
  expect(en['mfaChallenge.useCode']).toBe('Use a verification code');
  expect(en['mfaChallenge.resendIn']).toBe('Resend code in {remaining}s');
  expect(en['mfaChallenge.resend']).toBe('Resend code');
  expect(en['mfaChallenge.resent']).toBe('A new code was sent.');
  expect(en['mfaChallenge.backToSignIn']).toBe('Back to sign in');
  expect(en['mfaChallenge.fallbackError']).toBe('That code did not work. Try again.');
});
