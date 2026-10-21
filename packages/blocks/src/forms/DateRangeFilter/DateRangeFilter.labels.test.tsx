import { render, screen } from '@testing-library/react';
import { I18nProvider, es } from '@gntik-ai/ui';
import { DateRangeFilter } from './DateRangeFilter';
it('preserves English and translates empty and selected ranges', () => {
  const { rerender } = render(<DateRangeFilter defaultValue={{ start: null, end: null }} />);
  expect(screen.getByRole('combobox', { name: 'Date range' })).toHaveAttribute('placeholder', 'Any date');
  rerender(
    <I18nProvider locale="es">
      <DateRangeFilter defaultValue={{ start: null, end: null }} />
    </I18nProvider>,
  );
  expect(screen.getByRole('combobox', { name: es['dateRange.label'] })).toHaveAttribute(
    'placeholder',
    es['dateRange.any'],
  );
  rerender(
    <I18nProvider locale="es">
      <DateRangeFilter value={{ start: new Date(2026, 0, 1), end: new Date(2026, 0, 2) }} />
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Borrar rango de fechas' })).toBeVisible();
});
it.each(['en', 'es'])('honours all label overrides under %s', (locale) => {
  const labels = {
    label: 'Custom dates',
    placeholder: 'Custom empty',
    clear: (label: string) => `Custom clear ${label}`,
  };
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <DateRangeFilter labels={labels} value={{ start: null, end: null }} />
    </I18nProvider>,
  );
  expect(screen.getByRole('combobox', { name: labels.label })).toHaveAttribute('placeholder', labels.placeholder);
  rerender(
    <I18nProvider locale={locale}>
      <DateRangeFilter
        labels={labels}
        label="Explicit dates"
        placeholder="Explicit empty"
        value={{ start: null, end: null }}
      />
    </I18nProvider>,
  );
  expect(screen.getByRole('combobox', { name: 'Explicit dates' })).toHaveAttribute('placeholder', 'Explicit empty');
  rerender(
    <I18nProvider locale={locale}>
      <DateRangeFilter labels={labels} value={{ start: new Date(2026, 0, 1), end: new Date(2026, 0, 2) }} />
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Custom clear custom dates' })).toBeVisible();
});
