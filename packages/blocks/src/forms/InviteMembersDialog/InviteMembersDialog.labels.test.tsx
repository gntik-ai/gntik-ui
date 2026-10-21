import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, en, es } from '@gntik-ai/ui';
import { InviteMembersDialog, type InviteMembersDialogLabels } from './InviteMembersDialog';
import { expectNoAxeViolations } from '../../test/a11y';
it.each(['none', 'es'])('translates every default and validates through email chips under %s', async (locale) => {
  const m = locale === 'es' ? es : en;
  const block = <InviteMembersDialog onInvite={() => Promise.reject(null)} />;
  render(locale === 'es' ? <I18nProvider locale="es">{block}</I18nProvider> : block);
  await userEvent.click(screen.getByRole('button', { name: m['inviteMembers.title'] }));
  const dialog = await screen.findByRole('dialog', { name: m['inviteMembers.title'] });
  expect(dialog).toHaveAccessibleDescription(m['inviteMembers.description']);
  const input = screen.getByPlaceholderText(m['inviteMembers.placeholder']);
  expect(input).toHaveAccessibleName(m['inviteMembers.emails']);
  for (const key of ['role', 'message'] as const) expect(screen.getByText(m[`inviteMembers.${key}`])).toBeVisible();
  expect(screen.getByPlaceholderText(m['inviteMembers.messagePlaceholder'])).toBeVisible();
  expect(screen.getByRole('button', { name: m['inviteMembers.cancel'] })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: m['inviteMembers.submit'] }));
  expect(screen.getByText(m['inviteMembers.emailRequired'])).toBeVisible();
  await userEvent.type(input, 'bad{Enter}');
  await userEvent.click(screen.getByRole('button', { name: m['inviteMembers.submit'] }));
  expect(screen.getByText(locale === 'es' ? 'Corrige 1 dirección no válida.' : 'Fix 1 invalid address.')).toBeVisible();
  expect(screen.getByRole('list', { name: m['inviteMembers.listLabel'] })).toBeVisible();
  expect(
    screen.getByTitle(
      locale === 'es' ? 'bad no es una dirección de correo válida' : 'bad is not a valid email address',
    ),
  ).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: locale === 'es' ? 'Quitar bad' : 'Remove bad' }));
  await userEvent.type(input, 'a@example.com, b@example.com,');
  await userEvent.click(
    screen.getByRole('button', { name: locale === 'es' ? 'Enviar 2 invitaciones' : 'Send 2 invitations' }),
  );
  expect(await screen.findByText(m['inviteMembers.fallbackError'])).toBeVisible();
  expect(screen.getByText(m['inviteMembers.errorTitle'])).toBeVisible();
  if (locale === 'es') await expectNoAxeViolations(dialog);
});
it.each(['en', 'es'])('honours overrides below existing title and description props under %s', async (locale) => {
  const labels: InviteMembersDialogLabels = {
    title: 'Custom title',
    description: 'Custom description',
    emails: 'Custom emails',
    placeholder: 'Custom placeholder',
    listLabel: 'Custom listLabel',
    role: 'Custom role',
    message: 'Custom message',
    messagePlaceholder: 'Custom messagePlaceholder',
    emailRequired: 'Custom emailRequired',
    errorTitle: 'Custom errorTitle',
    fallbackError: 'Custom fallbackError',
    cancel: 'Custom cancel',
    submit: 'Custom submit',
    emailInvalid: (email) => `Custom invalid ${email}`,
    fixInvalid: (count) => `Custom fix ${count}`,
    submitMany: (count) => `Custom send ${count}`,
  };
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <InviteMembersDialog labels={labels} onInvite={() => Promise.reject(null)} />
    </I18nProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: labels.title }));
  expect(await screen.findByRole('dialog', { name: labels.title })).toHaveAccessibleDescription(labels.description);
  const input = screen.getByPlaceholderText(labels.placeholder);
  expect(input).toHaveAccessibleName(labels.emails);
  for (const text of [labels.role, labels.message]) expect(screen.getByText(text)).toBeVisible();
  expect(screen.getByPlaceholderText(labels.messagePlaceholder)).toBeVisible();
  expect(screen.getByRole('button', { name: labels.cancel })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: labels.submit }));
  expect(screen.getByText(labels.emailRequired)).toBeVisible();
  await userEvent.type(input, 'bad{Enter}');
  await userEvent.click(screen.getByRole('button', { name: labels.submit }));
  expect(screen.getByText('Custom fix 1')).toBeVisible();
  expect(screen.getByTitle('Custom invalid bad')).toBeInTheDocument();
  expect(screen.getByRole('list', { name: labels.listLabel })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: locale === 'es' ? 'Quitar bad' : 'Remove bad' }));
  await userEvent.type(input, 'a@example.com, b@example.com,');
  await userEvent.click(screen.getByRole('button', { name: 'Custom send 2' }));
  expect(await screen.findByText(labels.fallbackError)).toBeVisible();
  expect(screen.getByText(labels.errorTitle)).toBeVisible();
  rerender(
    <I18nProvider locale={locale}>
      <InviteMembersDialog labels={labels} title="Explicit title" description="Explicit description" />
    </I18nProvider>,
  );
  expect(screen.getByRole('dialog', { name: 'Explicit title' })).toHaveAccessibleDescription('Explicit description');
});
