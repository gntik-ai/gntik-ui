import { render, screen, within } from '@testing-library/react';
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
    render(<Pagination page={1} pageCount={3} onPageChange={noop} labels={{ nav: 'Resultados', page: (p) => `Ir a ${p}` }} />, { wrapper: es });
    const nav = screen.getByRole('navigation', { name: 'Resultados' });
    expect(within(nav).getByRole('button', { name: 'Ir a 3' })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Página siguiente' })).toBeInTheDocument();
  });

  it('Breadcrumbs: landmark and collapsed-trail button (plural)', () => {
    const items = ['Inicio', 'Proyectos', 'web-app', 'Despliegues', 'Registros'].map((label, i) => ({ label, href: i < 4 ? `/${i}` : undefined }));
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
    for (const name of ['Claro', 'Oscuro', 'Alto contraste', 'Sistema']) expect(within(group).getByRole('button', { name })).toBeInTheDocument();
  });

  it('Sparkline summary uses the catalog and the locale number format', () => {
    render(<Sparkline data={[1000, 1500.5]} label="Peticiones" />, { wrapper: es });
    expect(screen.getByRole('img')).toHaveAccessibleName('Peticiones: al alza 50% de 1000 a 1500,5 en 2 puntos (mínimo 1000, máximo 1500,5)');
  });
});
