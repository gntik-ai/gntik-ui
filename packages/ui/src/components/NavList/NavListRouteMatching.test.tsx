import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../i18n/I18nProvider';
import { expectNoAxeViolations } from '../../test/a11y';
import NavListRouteMatching from './examples/NavListRouteMatching';

it.each(['dark', 'light', 'high_contrast'])('route matching example is axe clean in %s', async (theme) => {
  document.documentElement.className = theme === 'light' ? '' : theme;
  try {
    render(<NavListRouteMatching />);
    expect(screen.getByRole('link', { name: 'Functions' })).toHaveAttribute('aria-current', 'page');
    await expectNoAxeViolations();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(screen.getByRole('link', { name: 'Functions' })).toHaveAttribute('aria-current', 'page');
    await expectNoAxeViolations();
  } finally {
    document.documentElement.className = '';
  }
});

it('the example selects a patterned route with keyboard controls and localized labels', async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider locale="es">
      <NavListRouteMatching />
    </I18nProvider>,
  );
  expect(screen.getByRole('link', { name: 'Funciones' })).toHaveAttribute('aria-current', 'page');
  const select = screen.getByRole('combobox', { name: 'Ubicación' });
  select.focus();
  await user.keyboard('{Enter}');
  await user.click(await screen.findByRole('option', { name: '/projects/42/runs/7' }));
  const nav = screen.getByRole('navigation', { name: 'Coincidencia de rutas' });
  expect(within(nav).getAllByRole('link', { current: 'page' })).toHaveLength(1);
  expect(within(nav).getByRole('link', { name: 'Proyecto' })).toHaveAttribute('aria-current', 'page');
});
