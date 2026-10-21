import { render, screen } from '@testing-library/react';
import { I18nProvider, es } from '@gntik-ai/ui';
import { FormSection } from './FormSection';

it('localises defaults while preserving the English sample fields', () => {
  const { rerender } = render(<FormSection />);
  expect(screen.getByRole('region', { name: 'General' })).toBeVisible();
  expect(screen.getByText('Basic details shown to everyone who can access this project.')).toBeVisible();
  rerender(
    <I18nProvider locale="es">
      <FormSection />
    </I18nProvider>,
  );
  expect(screen.getByRole('region', { name: 'General' })).toBeVisible();
  expect(screen.getByText('Datos básicos que ven todos los que tienen acceso a este proyecto.')).toBeVisible();
  expect(screen.getByText(es['formSection.description'])).toBeVisible();
  expect(screen.getByRole('region', { name: es['formSection.title'] })).toBeVisible();
  expect(screen.getByLabelText('Project name')).toHaveValue('billing-dashboard');
});

it.each(['en', 'es'])('uses explicit props before labels before catalog under %s', (locale) => {
  const labels = { title: 'Custom heading', description: 'Custom help' };
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <FormSection labels={labels} />
    </I18nProvider>,
  );
  expect(screen.getByRole('region', { name: labels.title })).toBeVisible();
  expect(screen.getByText(labels.description)).toBeVisible();
  rerender(
    <I18nProvider locale={locale}>
      <FormSection labels={labels} title="Explicit heading" description="Explicit help" />
    </I18nProvider>,
  );
  expect(screen.getByRole('region', { name: 'Explicit heading' })).toBeVisible();
  expect(screen.getByText('Explicit help')).toBeVisible();
});
