import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, es } from '@gntik-ai/ui';
import { CredentialDisclosureDialog, type CredentialDisclosureDialogLabels } from './CredentialDisclosureDialog';
import { storedDisclosure } from './fixtures';
import { expectNoAxeViolations } from '../../test/a11y';
it('preserves English and translates every default including copy feedback', async () => {
  const user = userEvent.setup();
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  const { rerender } = render(<CredentialDisclosureDialog disclosure={storedDisclosure} onClose={() => {}} />);
  expect(await screen.findByRole('dialog', { name: 'Credential secret' })).toHaveAccessibleDescription(
    'Copy this value and store it securely.',
  );
  for (const text of ['Credential ID', 'Expires']) expect(screen.getByText(text)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Show secret' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Copy secret' })).toBeVisible();
  rerender(
    <I18nProvider locale="es">
      <CredentialDisclosureDialog disclosure={{ ...storedDisclosure, variant: 'fresh' }} maskFresh onClose={() => {}} />
    </I18nProvider>,
  );
  const dialog = await screen.findByRole('dialog', { name: es['credentialDisclosure.title'] });
  expect(dialog).toHaveAccessibleDescription(es['credentialDisclosure.description']);
  for (const key of ['credentialId', 'expiry', 'warningTitle', 'warningText'] as const)
    expect(screen.getByText(es[`credentialDisclosure.${key}`])).toBeVisible();
  await user.click(screen.getByRole('button', { name: es['credentialDisclosure.show'] }));
  expect(screen.getByRole('button', { name: es['credentialDisclosure.hide'] })).toBeVisible();
  expect(screen.getByRole('textbox', { name: es['credentialDisclosure.secret'] })).toHaveValue(storedDisclosure.secret);
  await user.click(screen.getByRole('button', { name: es['credentialDisclosure.copy'] }));
  expect(screen.getByRole('button', { name: es['credentialDisclosure.copied'] })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(es['credentialDisclosure.success']);
  expect(screen.getByRole('button', { name: es['credentialDisclosure.close'] })).toBeVisible();
  await expectNoAxeViolations(dialog);
});
it.each(['en', 'es'])('honours all label overrides and explicit props under %s', async (locale) => {
  const user = userEvent.setup();
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  const labels: CredentialDisclosureDialogLabels = {
    title: 'Custom title',
    description: 'Custom help',
    credentialIdLabel: 'Custom ID',
    expiryLabel: 'Custom expiry',
    secretLabel: 'Custom secret',
    showLabel: 'Custom show',
    hideLabel: 'Custom hide',
    copyLabel: 'Custom copy',
    copiedLabel: 'Custom copied',
    successAnnouncement: 'Custom success',
    failureAnnouncement: 'Custom failure',
    warningTitle: 'Custom warning',
    warningText: 'Custom caution',
    closeLabel: 'Custom close',
    copiedAnnouncementFor: (label, copied) => `Custom ${label} ${copied}`,
  };
  const props = { disclosure: { ...storedDisclosure, variant: 'fresh' as const }, maskFresh: true, onClose: () => {} };
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <CredentialDisclosureDialog {...props} labels={labels} />
    </I18nProvider>,
  );
  expect(await screen.findByRole('dialog', { name: labels.title })).toHaveAccessibleDescription(labels.description);
  for (const text of [labels.credentialIdLabel, labels.expiryLabel, labels.warningTitle, labels.warningText])
    expect(screen.getByText(text)).toBeVisible();
  await user.click(screen.getByRole('button', { name: labels.showLabel }));
  expect(screen.getByRole('textbox', { name: labels.secretLabel })).toHaveValue(storedDisclosure.secret);
  expect(screen.getByRole('button', { name: labels.hideLabel })).toBeVisible();
  await user.click(screen.getByRole('button', { name: labels.copyLabel }));
  expect(screen.getByRole('button', { name: labels.copiedLabel })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(labels.successAnnouncement);
  rerender(
    <I18nProvider locale={locale}>
      <CredentialDisclosureDialog
        {...props}
        labels={labels}
        title="Explicit title"
        description="Explicit description"
        secretLabel="Explicit secret"
        showLabel="Explicit show"
        hideLabel="Explicit hide"
        credentialIdLabel="Explicit ID"
        expiryLabel="Explicit expiry"
        warningTitle="Explicit warning"
        warningText="Explicit caution"
        copiedLabel="Explicit copied"
        copyLabel="Explicit copy"
        successAnnouncement="Explicit success"
        failureAnnouncement="Explicit failure"
        closeLabel="Explicit close"
      />
    </I18nProvider>,
  );
  expect(screen.getByRole('dialog', { name: 'Explicit title' })).toHaveAccessibleDescription('Explicit description');
  for (const text of ['Explicit ID', 'Explicit expiry', 'Explicit warning', 'Explicit caution'])
    expect(screen.getByText(text)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Explicit hide' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Explicit hide' }));
  expect(screen.getByRole('button', { name: 'Explicit show' })).toBeVisible();
  expect(screen.getByRole('textbox', { name: 'Explicit secret' })).toBeVisible();
  writeText.mockRejectedValueOnce(new Error('Clipboard denied'));
  await user.click(screen.getByRole('button', { name: 'Explicit copied' }));
  expect(screen.getByRole('status')).toHaveTextContent('Explicit failure');
  expect(screen.getByRole('button', { name: 'Explicit failure' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Explicit close' })).toBeVisible();
});
it('uses a hand-written Spanish label-only announcement for multiple secrets', async () => {
  const user = userEvent.setup();
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  });
  render(
    <I18nProvider locale="es">
      <CredentialDisclosureDialog
        disclosure={storedDisclosure}
        onClose={() => {}}
        additionalSecrets={[{ id: 'other', label: 'Otro', value: 'synthetic_other' }]}
      />
    </I18nProvider>,
  );
  await screen.findByRole('dialog');
  await user.click(screen.getAllByRole('button', { name: es['credentialDisclosure.copy'] })[0]!);
  expect(screen.getAllByRole('status')[0]).toHaveTextContent('Secreto: Copiado');
});

it.each(['en', 'es'])('honours custom clipboard failure and group announcements under %s', async (locale) => {
  const user = userEvent.setup();
  const writeText = vi.fn().mockRejectedValueOnce(new Error('Clipboard denied')).mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  const props = {
    disclosure: storedDisclosure,
    onClose: () => {},
    additionalSecrets: [{ id: 'other', label: 'Other', value: 'synthetic_other' }],
  };
  const labels = {
    failureAnnouncement: 'Custom failure',
    copiedAnnouncementFor: (label: string, copied: string) => `Custom ${label} ${copied}`,
    copiedLabel: 'Custom saved',
  };
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <CredentialDisclosureDialog {...props} labels={labels} />
    </I18nProvider>,
  );
  await screen.findByRole('dialog');
  const copyName = locale === 'es' ? es['credentialDisclosure.copy'] : 'Copy secret';
  await user.click(screen.getAllByRole('button', { name: copyName })[0]!);
  expect(screen.getAllByRole('status')[0]).toHaveTextContent('Custom failure');
  await user.click(screen.getByRole('button', { name: 'Custom failure' }));
  expect(screen.getAllByRole('status')[0]).toHaveTextContent(
    locale === 'es' ? 'Custom Secreto Custom saved' : 'Custom Secret Custom saved',
  );
  rerender(
    <I18nProvider locale={locale}>
      <CredentialDisclosureDialog
        {...props}
        labels={labels}
        copiedAnnouncementFor={() => 'Explicit group announcement'}
      />
    </I18nProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'Custom saved' }));
  expect(screen.getAllByRole('status')[0]).toHaveTextContent('Explicit group announcement');
});
