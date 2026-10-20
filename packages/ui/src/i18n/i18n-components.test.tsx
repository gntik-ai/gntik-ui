import TransferListCatalogDefaults from '../components/TransferList/examples/TransferListCatalogDefaults';
import { MultiSelect } from '../components/MultiSelect';
import { Thumbnail } from '../components/Thumbnail';
import { OverflowList } from '../components/OverflowList';
import { BottomSheet, BottomSheetContent } from '../components/BottomSheet';
import { MegaMenu } from '../components/MegaMenu';
import { VirtualList } from '../components/VirtualList';
import { JsonViewer } from '../components/JsonViewer';
import { Carousel } from '../components/Carousel';
import { Lightbox } from '../components/Lightbox';
import { Tour } from '../components/Tour';
import { ListInput } from '../components/ListInput';
import { Timer } from '../components/Timer';
import { TreeList } from '../components/TreeList';
import { TransferList } from '../components/TransferList';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CodeBlock } from '../components/CodeBlock';
import { Dialog, DialogContent, DialogTitle } from '../components/Dialog';
import { Kbd } from '../components/Kbd';
import { Pagination, PaginationCompact } from '../components/Pagination';
import { PasswordInput } from '../components/PasswordInput';
import { Sparkline } from '../components/Sparkline';
import { Stepper } from '../components/Stepper';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { SkipLink } from '../components/VisuallyHidden';
import { ThemeProvider } from '../theme/ThemeProvider';
import { expectNoAxeViolations } from '../test/a11y';
import { I18nProvider } from './I18nProvider';

const es = ({ children }: { children: ReactNode }) => <I18nProvider locale="es">{children}</I18nProvider>;
const noop = () => {};

describe('built-in strings under <I18nProvider locale="es">', () => {
  it('Pagination: landmark, arrows and page buttons', async () => {
    render(<Pagination page={2} pageCount={5} onPageChange={noop} />, { wrapper: es });
    const nav = screen.getByRole('navigation', { name: 'Paginación' });
    expect(within(nav).getByRole('button', { name: 'Página anterior' })).toBeEnabled();
    expect(within(nav).getByRole('button', { name: 'Página siguiente' })).toBeEnabled();
    expect(within(nav).getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page');
    await expectNoAxeViolations();
  });

  it('PaginationCompact formats numbers in the locale and translates "of"', () => {
    render(<PaginationCompact page={1} pageSize={25} total={12345} onPageChange={noop} />, { wrapper: es });
    expect(screen.getByRole('navigation', { name: 'Paginación' })).toHaveTextContent('1–25 de 12.345');
  });

  it('explicit labels still win over the catalog', () => {
    render(
      <Pagination
        page={1}
        pageCount={3}
        onPageChange={noop}
        labels={{ nav: 'Resultados', page: (p) => `Ir a ${p}` }}
      />,
      { wrapper: es },
    );
    const nav = screen.getByRole('navigation', { name: 'Resultados' });
    expect(within(nav).getByRole('button', { name: 'Ir a 3' })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Página siguiente' })).toBeInTheDocument();
  });

  it('Breadcrumbs: landmark and collapsed-trail button (plural)', () => {
    const items = ['Inicio', 'Proyectos', 'web-app', 'Despliegues', 'Registros'].map((label, i) => ({
      label,
      href: i < 4 ? `/${i}` : undefined,
    }));
    render(<Breadcrumbs items={items} maxItems={3} />, { wrapper: es });
    const nav = screen.getByRole('navigation', { name: 'Ruta de navegación' });
    expect(within(nav).getByRole('button', { name: 'Mostrar 2 niveles más' })).toBeInTheDocument();
  });

  it('Dialog close button', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Renombrar proyecto</DialogTitle>
        </DialogContent>
      </Dialog>,
      { wrapper: es },
    );
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('PasswordInput toggle and strength meter', async () => {
    const user = userEvent.setup();
    render(<PasswordInput aria-label="Contraseña" showStrength defaultValue="abc" />, { wrapper: es });
    const toggle = screen.getByRole('button', { name: 'Mostrar contraseña' });
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeInTheDocument();
    expect(screen.getByText('Seguridad:')).toBeInTheDocument();
    expect(screen.getByText('Muy débil')).toBeInTheDocument();
  });

  it('SkipLink, Stepper and Kbd', () => {
    render(
      <>
        <SkipLink targetId="main" />
        <Stepper steps={[{ label: 'Cuenta' }, { label: 'Equipo' }, { label: 'Listo' }]} current={1} />
        <Kbd>⌘</Kbd>
        <main id="main" />
      </>,
      { wrapper: es },
    );
    expect(screen.getByRole('link', { name: 'Saltar al contenido principal' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Progreso' })).toHaveTextContent('Cuenta, completado');
    expect(screen.getByText('Comando')).toHaveClass('sr-only');
  });

  it('CodeBlock copy button and region name', () => {
    render(<CodeBlock code="pnpm add @gntik-ai/ui" language="bash" />, { wrapper: es });
    expect(screen.getByRole('button', { name: 'Copiar' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Código bash' })).toBeInTheDocument();
  });

  it('ThemeSwitcher option labels', () => {
    render(
      <ThemeProvider storageKey={null}>
        <ThemeSwitcher />
      </ThemeProvider>,
      { wrapper: es },
    );
    const group = screen.getByRole('group', { name: 'Tema' });
    for (const name of ['Claro', 'Oscuro', 'Alto contraste', 'Sistema'])
      expect(within(group).getByRole('button', { name })).toBeInTheDocument();
  });

  it('Sparkline summary uses the catalog and the locale number format', () => {
    render(<Sparkline data={[1000, 1500.5]} label="Peticiones" />, { wrapper: es });
    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Peticiones: al alza 50% de 1000 a 1500,5 en 2 puntos (mínimo 1000, máximo 1500,5)',
    );
  });
});

for (const locale of ['en', 'es'] as const) {
  describe(`catalog defaults: ${locale === 'en' ? 'without a provider' : 'Spanish'}`, () => {
    const options = locale === 'es' ? { wrapper: es } : undefined;

    it('TransferList headings, move actions and announcements', async () => {
      const user = userEvent.setup();
      render(<TransferList items={[{ value: 'a', label: 'Alpha' }]} />, options);
      const names =
        locale === 'es'
          ? ['Disponibles', 'Seleccionados', 'Añadir marcados', 'Añadir todos', 'Quitar marcados', 'Quitar todos']
          : ['Available', 'Selected', 'Add checked', 'Add all', 'Remove checked', 'Remove all'];
      for (const name of names.slice(0, 2)) expect(screen.getByText(name)).toBeInTheDocument();
      for (const name of names.slice(2)) expect(screen.getByRole('button', { name })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: names[3] }));
      expect(screen.getByRole('status')).toHaveTextContent(locale === 'es' ? 'Añadido 1 elemento.' : 'Added 1 item.');
    });
    it('TreeList loading, error and retry', async () => {
      const user = userEvent.setup();
      let reject: (error: Error) => void = () => {};
      render(
        <TreeList
          aria-label="Files"
          nodes={[{ id: 'a', label: 'Remote', hasChildren: true }]}
          loadChildren={() =>
            new Promise((_, fail) => {
              reject = fail;
            })
          }
        />,
        options,
      );
      await user.click(screen.getByRole('treeitem', { name: 'Remote' }));
      await user.keyboard('{ArrowRight}');
      expect(screen.getByText(locale === 'es' ? 'Cargando…' : 'Loading…')).toBeInTheDocument();
      await act(async () => reject(new Error('offline')));
      expect(
        await screen.findByText(locale === 'es' ? 'No se pudieron cargar los elementos.' : 'Could not load items.'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: locale === 'es' ? 'Reintentar' : 'Retry' })).toBeInTheDocument();
    });
    it('Timer paused, stopped and compact units', () => {
      const { rerender } = render(<Timer start={0} now={3725000} status="paused" format="compact" />, options);
      expect(screen.getByRole('timer')).toHaveTextContent(locale === 'es' ? '1h 2minEn pausa' : '1h 2mPaused');
      rerender(<Timer start={0} end={65000} status="stopped" format="compact" />);
      expect(screen.getByRole('timer')).toHaveTextContent(locale === 'es' ? '1min 5sDetenido' : '1m 5sStopped');
    });
    it('ListInput row controls and announcements', async () => {
      const user = userEvent.setup();
      render(<ListInput label="Variables" secret />, options);
      expect(screen.getByRole('textbox', { name: locale === 'es' ? 'Clave 1' : 'Key 1' })).toBeInTheDocument();
      expect(screen.getByLabelText(locale === 'es' ? 'Valor 1' : 'Value 1')).toBeInTheDocument();
      for (const name of locale === 'es'
        ? ['Quitar fila 1', 'Subir fila 1', 'Bajar fila 1', 'Mostrar valor 1']
        : ['Remove row 1', 'Move row 1 up', 'Move row 1 down', 'Show value 1'])
        expect(screen.getByRole('button', { name })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: locale === 'es' ? 'Añadir fila' : 'Add row' }));
      expect(screen.getByRole('status')).toHaveTextContent(locale === 'es' ? 'Se añadió una fila.' : 'Added a row.');
    });
    it('Tour navigation, finish and partial overrides', async () => {
      const user = userEvent.setup();
      const steps = [1, 2].map((n) => ({ target: '#absent', title: `Step ${n}` }));
      const { rerender } = render(<Tour defaultOpen steps={steps} />, options);
      expect(
        await screen.findByRole('button', { name: locale === 'es' ? 'Omitir recorrido' : 'Skip tour' }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: locale === 'es' ? 'Siguiente' : 'Next' }));
      expect(screen.getByRole('button', { name: locale === 'es' ? 'Atrás' : 'Back' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: locale === 'es' ? 'Finalizar' : 'Finish' })).toBeInTheDocument();
      rerender(<Tour open step={0} steps={steps} labels={{ skip: 'Saltar', counter: () => 'Custom counter' }} />);
      expect(screen.getByRole('button', { name: 'Saltar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: locale === 'es' ? 'Siguiente' : 'Next' })).toBeInTheDocument();
      expect(screen.getByText('Custom counter')).toBeInTheDocument();
    });
    it('Lightbox dialog and controls', async () => {
      render(
        <Lightbox
          defaultOpen
          items={[
            { src: '/image.png', alt: 'Landscape' },
            { src: '/coast.png', alt: 'Coast' },
          ]}
        />,
        options,
      );
      const dialog = await screen.findByRole('dialog', { name: locale === 'es' ? 'Visor multimedia' : 'Media viewer' });
      for (const name of locale === 'es'
        ? ['Cerrar visor', 'Acercar', 'Alejar', 'Mostrar 1: Landscape']
        : ['Close viewer', 'Zoom in', 'Zoom out', 'Show 1: Landscape'])
        expect(within(dialog).getByRole('button', { name })).toBeInTheDocument();
    });
    it('Carousel slide controls and picker names', () => {
      render(
        <Carousel label="Gallery" showDots>
          <div>One</div>
          <div>Two</div>
        </Carousel>,
        options,
      );
      for (const name of locale === 'es'
        ? ['Diapositiva anterior', 'Diapositiva siguiente', 'Ir a la diapositiva 2']
        : ['Previous slide', 'Next slide', 'Go to slide 2'])
        expect(screen.getByRole('button', { name })).toBeInTheDocument();
      expect(
        screen.getByRole('group', { name: locale === 'es' ? 'Elegir diapositiva' : 'Choose slide' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('group', { name: locale === 'es' ? '1 de 2' : '1 of 2' })).toBeInTheDocument();
    });
    it('JsonViewer copy controls and summaries', () => {
      render(<JsonViewer data={{ nested: { a: 1, b: 2 } }} />, options);
      for (const name of locale === 'es' ? ['Copiar ruta', 'Copiar valor'] : ['Copy path', 'Copy value'])
        expect(screen.getByRole('button', { name })).toBeInTheDocument();
      expect(screen.getByText(locale === 'es' ? '{ } 2 claves' : '{ } 2 keys')).toBeInTheDocument();
    });
    it('VirtualList empty text and override', () => {
      const { rerender } = render(<VirtualList items={[]} renderItem={() => null} />, options);
      expect(screen.getByText(locale === 'es' ? 'Sin elementos.' : 'No items.')).toBeInTheDocument();
      rerender(<VirtualList items={[]} renderItem={() => null} emptyText="Empty override" />);
      expect(screen.getByText('Empty override')).toBeInTheDocument();
      rerender(<VirtualList items={[]} renderItem={() => null} emptyText={null} />);
      expect(screen.queryByText(/No items.|Sin elementos./)).not.toBeInTheDocument();
    });
    it('MegaMenu landmark and label override', () => {
      const { rerender } = render(<MegaMenu items={[]} />, options);
      expect(screen.getByRole('navigation', { name: locale === 'es' ? 'Principal' : 'Main' })).toBeInTheDocument();
      rerender(<MegaMenu items={[]} label="Custom nav" />);
      expect(screen.getByRole('navigation', { name: 'Custom nav' })).toBeInTheDocument();
    });
    it('BottomSheet handle, close and snap announcements', async () => {
      const user = userEvent.setup();
      render(
        <BottomSheet defaultOpen>
          <BottomSheetContent title="Details">Content</BottomSheetContent>
        </BottomSheet>,
        options,
      );
      const handle = await screen.findByRole('button', {
        name: locale === 'es' ? 'Redimensionar panel' : 'Resize sheet',
      });
      expect(screen.getByRole('button', { name: locale === 'es' ? 'Cerrar' : 'Close' })).toBeInTheDocument();
      expect(handle).toHaveAccessibleDescription(
        locale === 'es' ? 'Flecha arriba expande, flecha abajo contrae.' : 'Arrow Up expands, Arrow Down collapses.',
      );
      await user.click(handle);
      expect(screen.getByRole('status')).toHaveTextContent(locale === 'es' ? 'Panel expandido.' : 'Sheet expanded.');
    });
    it('OverflowList hidden count, popover and function override', async () => {
      const user = userEvent.setup();
      const items = ['a', 'b', 'c', 'd'];
      const { rerender } = render(
        <OverflowList items={items} max={locale === 'es' ? 1 : 2} renderItem={(item) => item} />,
        options,
      );
      await user.click(screen.getByRole('button', { name: locale === 'es' ? '+3 más' : '+2 more' }));
      expect(await screen.findByRole('dialog', { name: locale === 'es' ? '3 más' : '2 more' })).toBeInTheDocument();
      rerender(
        <OverflowList items={items} max={1} renderItem={(item) => item} labels={{ more: (n) => `Hidden ${n}` }} />,
      );
      expect(screen.getByRole('button', { name: 'Hidden 3' })).toBeInTheDocument();
    });
    it('Thumbnail remove, progress, error and function override', () => {
      const { rerender } = render(<Thumbnail name="informe.pdf" progress={40} onRemove={noop} />, options);
      expect(
        screen.getByRole('button', { name: locale === 'es' ? 'Quitar informe.pdf' : 'Remove informe.pdf' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('progressbar', { name: locale === 'es' ? 'Subiendo informe.pdf' : 'Uploading informe.pdf' }),
      ).toBeInTheDocument();
      rerender(
        <Thumbnail
          name="informe.pdf"
          error
          onRetry={noop}
          onRemove={noop}
          labels={{ remove: (label) => `Delete ${label}` }}
        />,
      );
      expect(screen.getByRole('button', { name: 'Delete informe.pdf' })).toBeInTheDocument();
      expect(screen.getByRole('figure')).toHaveTextContent(locale === 'es' ? 'Error al subir' : 'Upload failed');
      expect(screen.getByRole('button', { name: locale === 'es' ? 'Reintentar' : 'Retry' })).toBeInTheDocument();
    });
    it('MultiSelect chip removal and removeLabel override', () => {
      const optionsList = [{ value: 'x', label: 'x' }];
      const { rerender } = render(<MultiSelect options={optionsList} defaultValue={['x']} label="Tags" />, options);
      expect(screen.getByRole('button', { name: locale === 'es' ? 'Quitar x' : 'Remove x' })).toBeInTheDocument();
      rerender(
        <MultiSelect
          options={optionsList}
          defaultValue={['x']}
          label="Tags"
          removeLabel={(label) => `Delete ${label}`}
        />,
      );
      expect(screen.getByRole('button', { name: 'Delete x' })).toBeInTheDocument();
    });
  });
}

it('keeps ungrouped English counts outside a provider', () => {
  render(<JsonViewer data={{ nested: Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`key${i}`, i])) }} />);
  expect(screen.getByText('{ } 1000 keys')).toBeInTheDocument();
});

it.each(['dark', 'light', 'high_contrast'])('Spanish catalog preview is axe clean (%s)', async (theme) => {
  document.documentElement.className = theme === 'light' ? '' : theme;
  const user = userEvent.setup();
  render(<TransferListCatalogDefaults />);
  await expectNoAxeViolations();
  for (const name of ['Start tour', 'View media', 'Open sheet']) {
    await user.click(screen.getByRole('button', { name }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await expectNoAxeViolations();
    await user.keyboard('{Escape}');
  }
});
