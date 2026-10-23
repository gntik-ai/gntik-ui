import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import { ThemeProvider, type ResolvedTheme } from './ThemeProvider';
import { I18nProvider } from '../i18n/I18nProvider';
import ThemeScopeLightCard from './examples/ThemeScopeLightCard';
import ThemeScopeNested from './examples/ThemeScopeNested';
import ThemeProviderForced from './examples/ThemeProviderForced';

it.each<ResolvedTheme>(['dark', 'light', 'high_contrast'])('scope examples pass axe in %s', async (theme) => {
  const user = userEvent.setup();
  render(
    <ThemeProvider defaultMode={theme} storageKey={null}>
      <ThemeScopeLightCard />
      <ThemeScopeNested />
    </ThemeProvider>,
  );
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  await expectNoAxeViolations();
  await user.click(screen.getByRole('combobox', { name: 'Preview choice' }));
  expect(await screen.findByRole('listbox')).toHaveAccessibleName('Preview choice');
  await expectNoAxeViolations();
});

it('translates the scoped Select example into Spanish', async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider locale="es">
      <ThemeScopeLightCard />
    </I18nProvider>,
  );
  await user.click(screen.getByRole('combobox', { name: 'Opción de vista previa' }));
  expect(await screen.findByRole('listbox')).toHaveAccessibleName('Opción de vista previa');
  expect(screen.getByRole('option', { name: 'Personal' })).toBeInTheDocument();
  await expectNoAxeViolations();
});

it('shows a forced light preview while storing the page choice', async () => {
  const user = userEvent.setup();
  render(<ThemeProviderForced />);
  await user.click(screen.getByRole('button', { name: 'High contrast' }));
  expect(screen.getByTestId('forced-theme')).toHaveTextContent('High contrast / Light');
  await user.click(screen.getByRole('button', { name: 'Release forced theme' }));
  expect(screen.getByTestId('forced-theme')).toHaveTextContent('High contrast / High contrast');
  await expectNoAxeViolations();
});
