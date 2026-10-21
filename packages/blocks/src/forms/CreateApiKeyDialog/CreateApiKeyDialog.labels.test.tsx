import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, en, es } from '@gntik-ai/ui';
import { CreateApiKeyDialog, type CreateApiKeyDialogLabels } from './CreateApiKeyDialog';
import { expectNoAxeViolations } from '../../test/a11y';
it.each(['none', 'es'])('renders every default through the dialog lifecycle under %s', async (locale) => {
  const messages = locale === 'es' ? es : en;
  let fails = true;
  const block = <CreateApiKeyDialog onCreate={() => (fails ? Promise.reject(null) : 'synthetic_api_key')} />;
  render(locale === 'es' ? <I18nProvider locale="es">{block}</I18nProvider> : block);
  await userEvent.click(screen.getByRole('button', { name: messages['createApiKey.title'] }));
  const dialog = await screen.findByRole('dialog', { name: messages['createApiKey.title'] });
  expect(dialog).toHaveAccessibleDescription(messages['createApiKey.description']);
  expect(screen.getByPlaceholderText(messages['createApiKey.namePlaceholder'])).toHaveAccessibleName(
    messages['createApiKey.name'],
  );
  expect(screen.getByText(messages['createApiKey.scopes'])).toBeVisible();
  expect(screen.getByText(messages['createApiKey.expiration'])).toBeVisible();
  expect(screen.getByRole('button', { name: messages['createApiKey.cancel'] })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: messages['createApiKey.submit'] }));
  expect(screen.getByText(messages['createApiKey.nameRequired'])).toBeVisible();
  expect(screen.getByText(messages['createApiKey.scopesRequired'])).toBeVisible();
  fireEvent.change(screen.getByPlaceholderText(messages['createApiKey.namePlaceholder']), {
    target: { value: 'automation' },
  });
  await userEvent.click(screen.getByRole('checkbox', { name: 'projects:read' }));
  await userEvent.click(screen.getByRole('button', { name: messages['createApiKey.submit'] }));
  expect(await screen.findByText(messages['createApiKey.fallbackError'])).toBeVisible();
  expect(screen.getByText(messages['createApiKey.errorTitle'])).toBeVisible();
  fails = false;
  await userEvent.click(screen.getByRole('button', { name: messages['createApiKey.submit'] }));
  expect(
    await screen.findByRole('dialog', { name: messages['createApiKey.successTitle'] }),
  ).toHaveAccessibleDescription(messages['createApiKey.successDescription']);
  expect(screen.getByText(messages['createApiKey.warningTitle'])).toBeVisible();
  expect(screen.getByText(messages['createApiKey.warningDescription'])).toBeVisible();
  expect(screen.getByRole('region', { name: messages['createApiKey.secretLabel'] })).toHaveTextContent(
    'synthetic_api_key',
  );
  expect(screen.getByRole('button', { name: messages['createApiKey.done'] })).toBeVisible();
  if (locale === 'es') await expectNoAxeViolations(dialog);
});
it.each(['en', 'es'])('honours all overrides under %s', async (locale) => {
  const labels: CreateApiKeyDialogLabels = {
    title: 'Custom title',
    description: 'Custom description',
    name: 'Custom name',
    namePlaceholder: 'Custom namePlaceholder',
    nameRequired: 'Custom nameRequired',
    scopes: 'Custom scopes',
    scopesRequired: 'Custom scopesRequired',
    expiration: 'Custom expiration',
    errorTitle: 'Custom errorTitle',
    fallbackError: 'Custom fallbackError',
    cancel: 'Custom cancel',
    submit: 'Custom submit',
    successTitle: 'Custom successTitle',
    successDescription: 'Custom successDescription',
    warningTitle: 'Custom warningTitle',
    warningDescription: 'Custom warningDescription',
    secretLabel: 'Custom secretLabel',
    done: 'Custom done',
  };
  let fails = true;
  render(
    <I18nProvider locale={locale}>
      <CreateApiKeyDialog labels={labels} onCreate={() => (fails ? Promise.reject(null) : 'synthetic_api_key')} />
    </I18nProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: labels.title }));
  expect(await screen.findByRole('dialog', { name: labels.title })).toHaveAccessibleDescription(labels.description);
  expect(screen.getByPlaceholderText(labels.namePlaceholder)).toHaveAccessibleName(labels.name);
  for (const text of [labels.scopes, labels.expiration]) expect(screen.getByText(text)).toBeVisible();
  expect(screen.getByRole('button', { name: labels.cancel })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: labels.submit }));
  for (const text of [labels.nameRequired, labels.scopesRequired]) expect(screen.getByText(text)).toBeVisible();
  fireEvent.change(screen.getByPlaceholderText(labels.namePlaceholder), { target: { value: 'automation' } });
  await userEvent.click(screen.getByRole('checkbox', { name: 'projects:read' }));
  await userEvent.click(screen.getByRole('button', { name: labels.submit }));
  expect(await screen.findByText(labels.fallbackError)).toBeVisible();
  expect(screen.getByText(labels.errorTitle)).toBeVisible();
  fails = false;
  await userEvent.click(screen.getByRole('button', { name: labels.submit }));
  expect(await screen.findByRole('dialog', { name: labels.successTitle })).toHaveAccessibleDescription(
    labels.successDescription,
  );
  expect(screen.getByText(labels.warningTitle)).toBeVisible();
  expect(screen.getByText(labels.warningDescription)).toBeVisible();
  expect(screen.getByRole('region', { name: labels.secretLabel })).toHaveTextContent('synthetic_api_key');
  expect(screen.getByRole('button', { name: labels.done })).toBeVisible();
});
it('keeps the original English copy byte for byte', () => {
  expect(en['createApiKey.title']).toBe('Create API key');
  expect(en['createApiKey.description']).toBe(
    'Keys act on behalf of this workspace. Grant only the scopes the integration needs.',
  );
  expect(en['createApiKey.name']).toBe('Name');
  expect(en['createApiKey.namePlaceholder']).toBe('ci-deployments');
  expect(en['createApiKey.nameRequired']).toBe('Give the key a name.');
  expect(en['createApiKey.scopes']).toBe('Scopes');
  expect(en['createApiKey.scopesRequired']).toBe('Select at least one scope.');
  expect(en['createApiKey.expiration']).toBe('Expiration');
  expect(en['createApiKey.errorTitle']).toBe('Key not created');
  expect(en['createApiKey.fallbackError']).toBe('The key could not be created.');
  expect(en['createApiKey.cancel']).toBe('Cancel');
  expect(en['createApiKey.submit']).toBe('Create key');
  expect(en['createApiKey.successTitle']).toBe('API key created');
  expect(en['createApiKey.successDescription']).toBe('Store it in your secrets manager. Use it as a bearer token.');
  expect(en['createApiKey.warningTitle']).toBe('Copy this key now');
  expect(en['createApiKey.warningDescription']).toBe(
    'For your security it is shown only once. If you lose it, revoke it and create a new one.',
  );
  expect(en['createApiKey.secretLabel']).toBe('New API key');
  expect(en['createApiKey.done']).toBe('Done');
});
