import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../i18n';
import { expectNoAxeViolations } from '../test/a11y';
import NavigationProviderRouteTree from './examples/NavigationProviderRouteTree';

describe.each(['dark', 'light', 'high_contrast'])('route tree example in %s', (theme) => {
  it('is accessible', async () => {
    document.documentElement.className = theme;
    render(<NavigationProviderRouteTree />);
    await expectNoAxeViolations();
  });
});

it('keeps Functions current on the detail page and follows the router', async () => {
  const user = userEvent.setup();
  document.title = 'Catalog';
  render(<NavigationProviderRouteTree />);
  const sidebar = screen.getByRole('navigation', { name: 'Console sections' });
  expect(within(sidebar).getByRole('link', { name: 'Functions' })).toHaveAttribute('aria-current', 'page');
  const trail = screen.getByRole('navigation', { name: 'Page trail' });
  expect(within(trail).getByText('fn-42')).toHaveAttribute('aria-current', 'page');
  expect(screen.getByText('Document title: fn-42 · Console')).toBeInTheDocument();
  expect(screen.getByText('Params: {"id":"fn-42"}')).toBeInTheDocument();
  expect(document.title).toBe('Catalog');

  await user.click(within(sidebar).getByRole('link', { name: 'Logs' }));
  expect(within(sidebar).getByRole('link', { name: 'Logs' })).toHaveAttribute('aria-current', 'page');
  expect(within(sidebar).getByRole('link', { name: 'Functions' })).not.toHaveAttribute('aria-current');
  expect(screen.getByText('Document title: Logs · Console')).toBeInTheDocument();
});

it('translates the example', () => {
  render(
    <I18nProvider locale="es">
      <NavigationProviderRouteTree />
    </I18nProvider>,
  );
  expect(screen.getByText('Título del documento: fn-42 · Consola')).toBeInTheDocument();
});
