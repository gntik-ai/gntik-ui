import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@gntik-ai/ui';
import { DataTable } from './DataTable';

beforeEach(() => {
  // jsdom has no layout. Supply the browser geometry/notification boundary so the
  // real Table overflow detection exposes its keyboard-focusable scroll region.
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(800);
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private readonly notify: () => void) {}
      observe() {
        this.notify();
      }
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it.each([
  ['en', 'Scrollable table'],
  ['es', 'Tabla desplazable'],
] as const)('labels the overflowing region per instance over the %s provider default', (locale, defaultName) => {
  const { rerender } = render(
    <I18nProvider locale={locale}>
      <DataTable paginated={false} />
    </I18nProvider>,
  );
  expect(screen.getByRole('region', { name: defaultName })).toHaveAttribute('tabindex', '0');
  rerender(
    <I18nProvider locale={locale}>
      <DataTable paginated={false} labels={{ scrollRegion: 'Tabla con desplazamiento' }} />
    </I18nProvider>,
  );
  expect(screen.getByRole('region', { name: 'Tabla con desplazamiento' })).toHaveAttribute('tabindex', '0');
  expect(screen.queryByRole('region', { name: defaultName })).toBeNull();
  rerender(
    <I18nProvider locale={locale}>
      <DataTable paginated={false} labels={{ columns: 'Elegir columnas' }} />
    </I18nProvider>,
  );
  expect(screen.getByRole('region', { name: defaultName })).toHaveAttribute('tabindex', '0');
});

it('keeps the caller caption as the virtualized region name', () => {
  render(
    <DataTable paginated={false} virtualize caption="Items" labels={{ scrollRegion: 'Tabla con desplazamiento' }} />,
  );
  expect(screen.getByRole('region', { name: 'Items' })).toHaveAttribute('tabindex', '0');
  expect(screen.queryByRole('region', { name: 'Tabla con desplazamiento' })).toBeNull();
});
