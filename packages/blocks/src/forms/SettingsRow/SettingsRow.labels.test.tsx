import { render, screen } from '@testing-library/react';
import { I18nProvider, es } from '@gntik-ai/ui';
import { SettingsRow } from './SettingsRow';
it('preserves English defaults and translates the label and description', () => {
  const { rerender } = render(<SettingsRow />);
  expect(screen.getByRole('switch', { name: 'Deployment notifications' })).toHaveAccessibleDescription(
    'Email the project owners when a deployment fails or is rolled back.',
  );
  rerender(
    <I18nProvider locale="es">
      <SettingsRow />
    </I18nProvider>,
  );
  expect(screen.getByRole('switch', { name: 'Notificaciones de despliegue' })).toHaveAccessibleDescription(
    es['settingsRow.description'],
  );
  expect(screen.getByText(es['settingsRow.label'])).toBeVisible();
});
it.each(['en', 'es'])('honours labels and explicit props under %s', (locale) => {
  const labels = { label: 'Custom setting', description: 'Custom description' };
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <SettingsRow labels={labels} />
    </I18nProvider>,
  );
  expect(screen.getByRole('switch', { name: labels.label })).toHaveAccessibleDescription(labels.description);
  rerender(
    <I18nProvider locale={locale}>
      <SettingsRow labels={labels} label="Explicit setting" description="Explicit description" />
    </I18nProvider>,
  );
  expect(screen.getByRole('switch', { name: 'Explicit setting' })).toHaveAccessibleDescription('Explicit description');
});
