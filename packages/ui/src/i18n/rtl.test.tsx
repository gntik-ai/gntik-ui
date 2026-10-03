import { render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ArrowRight, Check, ChevronDown, ChevronLeft, PanelLeftClose } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { Drawer, DrawerContent, DrawerTitle } from '../components/Drawer';
import { Pagination } from '../components/Pagination';
import SidebarLayoutApp from '../layouts/SidebarLayout/examples/SidebarLayoutApp';
import { expectNoAxeViolations } from '../test/a11y';
import { isDirectionalIcon, RTL_FLIP } from '../utils/rtl';
import { I18nProvider } from './I18nProvider';

const PHYSICAL = /(?<=[\s"'`:])-?(?:ml|mr|pl|pr|left|right)-(?!1\/2\b)[\w.[\]/-]+|(?<=[\s"'`:])(?:border|rounded)-(?:l|r|tl|tr|bl|br)\b|\btext-(?:left|right)\b/;

/** Source files of a component folder must use logical (start/end) utilities only. */
function expectLogicalSource(...files: string[]) {
  for (const file of files) {
    const source = readFileSync(resolve(__dirname, '..', file), 'utf8');
    expect(PHYSICAL.exec(source)?.[0], file).toBeUndefined();
  }
}

const rtl = ({ children }: { children: React.ReactNode }) => <I18nProvider locale="ar">{children}</I18nProvider>;

describe('directional icons', () => {
  it('detects inline-axis lucide icons by name', () => {
    expect(isDirectionalIcon(ChevronLeft)).toBe(true);
    expect(isDirectionalIcon(ArrowRight)).toBe(true);
    expect(isDirectionalIcon(PanelLeftClose)).toBe(true);
    expect(isDirectionalIcon(ChevronDown)).toBe(false);
    expect(isDirectionalIcon(Check)).toBe(false);
    expect(isDirectionalIcon(undefined)).toBe(false);
  });

  it('Button mirrors directional icons only', () => {
    render(
      <>
        <Button icon={ChevronLeft}>Back</Button>
        <Button trailingIcon={Check}>Done</Button>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Back' }).querySelector('svg')).toHaveClass(RTL_FLIP);
    expect(screen.getByRole('button', { name: 'Done' }).querySelector('svg')).not.toHaveClass(RTL_FLIP);
  });
});

describe('RTL rendering', () => {
  it('Pagination: inside dir="rtl", logical classes and mirrored arrows', async () => {
    const { container } = render(<Pagination page={2} pageCount={5} onPageChange={() => {}} />, { wrapper: rtl });
    expect(container.firstElementChild).toHaveAttribute('dir', 'rtl');
    const nav = screen.getByRole('navigation');
    expect(nav.closest('[dir]')).toHaveAttribute('dir', 'rtl');
    for (const name of ['Previous page', 'Next page']) {
      expect(within(nav).getByRole('button', { name }).querySelector('svg')).toHaveClass(RTL_FLIP);
    }
    expectLogicalSource('components/Pagination/Pagination.tsx', 'components/Pagination/pagination.variants.ts');
    await expectNoAxeViolations(container);
  });

  it('Breadcrumbs: chevron separators mirror; the trail order stays in DOM order', () => {
    render(<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Projects', href: '/p' }, { label: 'web-app' }]} />, { wrapper: rtl });
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav.closest('[dir]')).toHaveAttribute('dir', 'rtl');
    const separators = nav.querySelectorAll('[aria-hidden] > svg');
    expect(separators).toHaveLength(2);
    separators.forEach((svg) => expect(svg).toHaveClass(RTL_FLIP));
    expect(within(nav).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Home', 'Projects', 'web-app']);
    expectLogicalSource('components/Breadcrumbs/Breadcrumbs.tsx', 'components/Breadcrumbs/breadcrumbs.variants.ts');
  });

  it('Drawer: the portalled panel carries dir, uses the inline-start border and mirrored motion', () => {
    render(
      <Drawer defaultOpen side="right">
        <DrawerContent>
          <DrawerTitle>Edit project</DrawerTitle>
        </DrawerContent>
      </Drawer>,
      { wrapper: rtl },
    );
    const dialog = screen.getByRole('dialog', { name: 'Edit project' });
    expect(dialog.closest('[dir]')).toHaveAttribute('dir', 'rtl');
    expect(dialog).toHaveClass('border-s');
    expect(dialog.className).toContain('rtl:data-starting-style:[transform:translateX(-100%)]');
    expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveClass('end-3.5');
    expectLogicalSource('components/Drawer/Drawer.tsx', 'components/Drawer/drawer.variants.ts');
  });

  it('Drawer: no dir is forced outside a provider', () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerTitle>Details</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole('dialog', { name: 'Details' }).closest('[dir]')).toBeNull();
  });

  it('SidebarLayout: sidebar border on the inline end, mirrored collapse icon', async () => {
    const { container } = render(<SidebarLayoutApp />, { wrapper: rtl });
    expect(container.firstElementChild).toHaveAttribute('dir', 'rtl');
    const sidebar = screen.getByRole('complementary', { name: 'Sidebar' });
    expect(sidebar).toHaveClass('border-e');
    expect(screen.getByRole('button', { name: 'Collapse sidebar' }).querySelector('svg')).toHaveClass(RTL_FLIP);
    expectLogicalSource('layouts/SidebarLayout/SidebarLayout.tsx', 'layouts/SidebarLayout/sidebar-layout.variants.ts');
    await expectNoAxeViolations(container);
  });
});
