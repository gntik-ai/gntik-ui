import { render, screen } from '@testing-library/react';
import { I18nProvider, es } from '@gntik-ai/ui';
import { SsoButtons } from './SsoButtons';
import { ssoProviders } from './fixtures';
it('translates its group name and leaves provider fixture labels unchanged', () => {
  const { rerender } = render(<SsoButtons />);
  expect(screen.getByRole('group', { name: 'Single sign-on' })).toBeVisible();
  rerender(
    <I18nProvider locale="es">
      <SsoButtons />
    </I18nProvider>,
  );
  expect(screen.getByRole('group', { name: 'Inicio de sesión único' })).toBeVisible();
  expect(screen.getByRole('group')).toHaveAccessibleName(es['ssoButtons.label']);
  for (const provider of ssoProviders) expect(screen.getByRole('button', { name: provider.label })).toBeVisible();
});
it.each(['en', 'es'])('honours labels below explicit props under %s', (locale) => {
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <SsoButtons labels={{ label: 'Custom SSO' }} />
    </I18nProvider>,
  );
  expect(screen.getByRole('group', { name: 'Custom SSO' })).toBeVisible();
  rerender(
    <I18nProvider locale={locale}>
      <SsoButtons labels={{ label: 'Custom SSO' }} label="Explicit SSO" />
    </I18nProvider>,
  );
  expect(screen.getByRole('group', { name: 'Explicit SSO' })).toBeVisible();
});
