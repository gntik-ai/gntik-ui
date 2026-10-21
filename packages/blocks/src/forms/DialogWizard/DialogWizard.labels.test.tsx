import { render, screen } from '@testing-library/react';
import { I18nProvider, es } from '@gntik-ai/ui';
import { DialogWizard } from './DialogWizard';
import { expectNoAxeViolations } from '../../test/a11y';
it('preserves English and translates built-in wizard copy', async () => {
  const { rerender } = render(<DialogWizard open />);
  expect(await screen.findByRole('dialog', { name: 'Create resource' })).toBeVisible();
  expect(screen.getAllByText('Details').length).toBeGreaterThan(0);
  expect(screen.getByText('Review')).toBeVisible();
  rerender(
    <I18nProvider locale="es">
      <DialogWizard open description="Configure storage" />
    </I18nProvider>,
  );
  expect(await screen.findByRole('dialog', { name: es['wizard.title'] })).toBeVisible();
  expect(screen.getAllByText(es['wizard.details']).length).toBeGreaterThan(0);
  expect(screen.getByText(es['wizard.review'])).toBeVisible();
  await expectNoAxeViolations(screen.getByRole('dialog'));
});
it.each(['en', 'es'])('honours labels and existing title/steps props under %s', async (locale) => {
  const labels = { title: 'Custom flow', details: 'Custom details', review: 'Custom review' };
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <DialogWizard open labels={labels} />
    </I18nProvider>,
  );
  expect(await screen.findByRole('dialog', { name: labels.title })).toBeVisible();
  expect(screen.getAllByText(labels.details).length).toBeGreaterThan(0);
  expect(screen.getByText(labels.review)).toBeVisible();
  rerender(
    <I18nProvider locale={locale}>
      <DialogWizard open labels={labels} title="Explicit title" steps={[{ label: 'Explicit step' }]} />
    </I18nProvider>,
  );
  expect(screen.getByRole('dialog', { name: 'Explicit title' })).toBeVisible();
  expect(screen.getAllByText('Explicit step').length).toBeGreaterThan(0);
});
