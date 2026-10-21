import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@gntik-ai/ui';
import { ValidationSummary } from './ValidationSummary';
const errors = [{ fieldId: 'email', label: 'Email', message: 'Consumer error' }];
it('preserves English and translates singular and plural counts', () => {
  const { rerender } = render(<ValidationSummary errors={errors} />);
  expect(screen.getByText('There is 1 problem with this form')).toBeVisible();
  rerender(<ValidationSummary errors={[...errors, { fieldId: 'name', message: 'Another error' }]} />);
  expect(screen.getByText('There are 2 problems with this form')).toBeVisible();
  rerender(
    <I18nProvider locale="es">
      <ValidationSummary errors={errors} />
    </I18nProvider>,
  );
  expect(screen.getByText('Hay 1 problema en este formulario')).toBeVisible();
  rerender(
    <I18nProvider locale="es">
      <ValidationSummary errors={[...errors, { fieldId: 'name', message: 'Another error' }]} />
    </I18nProvider>,
  );
  expect(screen.getByText('Hay 2 problemas en este formulario')).toBeVisible();
  expect(screen.getByRole('link', { name: 'Email: Consumer error' })).toBeVisible();
});
it.each(['en', 'es'])('honours title prop before labels under %s', (locale) => {
  const labels = { title: (count: number) => `Custom ${count} issues` };
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <ValidationSummary errors={errors} labels={labels} />
    </I18nProvider>,
  );
  expect(screen.getByText('Custom 1 issues')).toBeVisible();
  rerender(
    <I18nProvider locale={locale}>
      <ValidationSummary errors={errors} labels={labels} title="Explicit title" />
    </I18nProvider>,
  );
  expect(screen.getByText('Explicit title')).toBeVisible();
});

it('keeps English counts byte-identical above the grouping threshold', () => {
  render(
    <ValidationSummary
      errors={Array.from({ length: 1000 }, (_, i) => ({ fieldId: `field-${i}`, message: 'Consumer error' }))}
    />,
  );
  expect(screen.getByText('There are 1000 problems with this form')).toBeVisible();
});
