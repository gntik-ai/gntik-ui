import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, es } from '@gntik-ai/ui';
import { DangerZone } from './DangerZone';
import { ConfirmDestructiveDialog } from './ConfirmDestructiveDialog';
import { expectNoAxeViolations } from '../../test/a11y';
it('preserves English defaults and translates confirmation including interpolation and errors', async () => {
  const { rerender } = render(<DangerZone />);
  expect(screen.getByRole('region', { name: 'Danger zone' })).toBeVisible();
  expect(screen.getByText('These actions affect the whole project and every member who can access it.')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Archive' }));
  expect(await screen.findByRole('alertdialog', { name: 'Archive project?' })).toBeVisible();
  expect(screen.getByRole('textbox', { name: 'Type billing-dashboard to confirm' })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  rerender(
    <I18nProvider locale="es">
      <DangerZone onConfirm={() => Promise.reject(null)} />
    </I18nProvider>,
  );
  expect(screen.getByRole('region', { name: es['dangerZone.title'] })).toBeVisible();
  expect(screen.getByText(es['dangerZone.description'])).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Archive' }));
  const dialog = await screen.findByRole('alertdialog', { name: '¿Archive project?' });
  expect(screen.getByRole('textbox', { name: 'Escribe billing-dashboard para confirmar' })).toBeVisible();
  expect(screen.getByRole('button', { name: es['dangerZone.cancel'] })).toBeVisible();
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'billing-dashboard' } });
  fireEvent.submit(screen.getByRole('textbox').closest('form')!);
  expect(await screen.findByText(es['dangerZone.fallbackError'])).toBeVisible();
  await expectNoAxeViolations(dialog);
});
it.each(['en', 'es'])('honours section and confirmation overrides under %s', async (locale) => {
  const labels = {
    title: 'Custom section',
    description: 'Custom description',
    confirmationTitle: (title: string) => `Custom confirm ${title}`,
    confirmPrompt: (text: React.ReactNode) => <>Custom type {text}</>,
    cancel: 'Custom cancel',
    fallbackError: 'Custom failure',
  };
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <DangerZone labels={labels} onConfirm={() => Promise.reject(null)} />
    </I18nProvider>,
  );
  expect(screen.getByRole('region', { name: labels.title })).toBeVisible();
  expect(screen.getByText(labels.description)).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Archive' }));
  expect(await screen.findByRole('alertdialog', { name: 'Custom confirm Archive project' })).toBeVisible();
  fireEvent.change(screen.getByRole('textbox', { name: 'Custom type billing-dashboard' }), {
    target: { value: 'billing-dashboard' },
  });
  fireEvent.submit(screen.getByRole('textbox').closest('form')!);
  expect(await screen.findByText(labels.fallbackError)).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: labels.cancel }));
  rerender(
    <I18nProvider locale={locale}>
      <DangerZone labels={labels} title="Explicit title" description="Explicit help" />
    </I18nProvider>,
  );
  expect(screen.getByRole('region', { name: 'Explicit title' })).toBeVisible();
  expect(screen.getByText('Explicit help')).toBeVisible();
});
it.each(['en', 'es'])('supports the public confirmation dialog labels under %s', async (locale) => {
  render(
    <I18nProvider locale={locale}>
      <ConfirmDestructiveDialog
        open
        onOpenChange={() => {}}
        title="Explicit dialog"
        description="Explicit description"
        confirmText="resource"
        confirmLabel="Explicit confirm"
        labels={{
          cancel: 'Custom cancel',
          confirmPrompt: (text) => <>Custom prompt {text}</>,
          fallbackError: 'Custom failure',
        }}
        onConfirm={() => Promise.reject(null)}
      />
    </I18nProvider>,
  );
  expect(await screen.findByRole('alertdialog', { name: 'Explicit dialog' })).toBeVisible();
  fireEvent.change(screen.getByRole('textbox', { name: 'Custom prompt resource' }), { target: { value: 'resource' } });
  await userEvent.click(screen.getByRole('button', { name: 'Explicit confirm' }));
  expect(await screen.findByText('Custom failure')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Custom cancel' })).toBeVisible();
});
