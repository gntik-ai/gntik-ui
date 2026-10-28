import { render, screen, within } from '@testing-library/react';
import { SiteFooter } from './SiteFooter';
import userEvent from '@testing-library/user-event';
import { Rss } from 'lucide-react';
import { I18nProvider, StackedLayout, ThemeProvider } from '@gntik-ai/ui';
import { sampleFooterColumns, sampleLegalLinks, sampleSocialLinks } from './fixtures';
import { expectNoAxeViolations } from '../../test/a11y';
import Columns from './examples/Columns';
import Centered from './examples/Centered';
import Simple from './examples/Simple';
import Custom from './examples/Custom';
import Empty from './examples/Empty';

describe('SiteFooter', () => {
  it('supports keyboard theme selection from the footer', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider storageKey={null} defaultMode="dark">
        <SiteFooter themeSwitcher />
      </ThemeProvider>,
    );
    const group = screen.getByRole('group', { name: 'Theme' });
    within(group).getByRole('button', { name: 'Dark' }).focus();
    await user.keyboard('{ArrowRight}');
    const highContrast = within(group).getByRole('button', { name: 'High contrast' });
    expect(highContrast).toHaveFocus();
    await user.keyboard(' ');
    expect(highContrast).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard('{ArrowLeft}{Enter}');
    expect(within(group).getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
  });
  describe.each([
    ['columns', Columns],
    ['centered', Centered],
    ['simple RTL', Simple],
    ['custom Spanish', Custom],
    ['empty', Empty],
  ] as const)('%s example', (_name, Example) => {
    it.each(['dark', 'light', 'high_contrast'])('has no axe violations in %s', async (theme) => {
      document.documentElement.className = theme;
      const { container } = render(<Example />);
      await expectNoAxeViolations(container);
    });
  });
  it.each(['columns', 'centered', 'simple'] as const)('omits empty and absent groups in %s', (layout) => {
    const { container, rerender } = render(
      <SiteFooter layout={layout} columns={[]} links={[]} legalLinks={[]} social={[]} />,
    );
    expect(container.querySelector('nav, ul, h2, h3')).toBeNull();
    expect(screen.getByText('© Example, Inc.')).toBeInTheDocument();
    rerender(<SiteFooter layout={layout} />);
    expect(container.querySelector('nav, ul, h2, h3')).toBeNull();
    rerender(<SiteFooter layout={layout} columns={[{ title: 'No links', links: [] }]} />);
    expect(container.querySelector('nav, ul, h2, h3')).toBeNull();
  });

  it('uses the kit external link with its icon, hint and muted hover underline', () => {
    render(
      <SiteFooter
        layout="simple"
        links={[{ label: 'Documentation', href: 'https://example.com/docs', external: true }]}
      />,
    );
    const link = screen.getByRole('link', { name: /Documentation/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveClass('text-muted-foreground', 'hover:underline');
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(link).toHaveTextContent('opens in a new tab');
  });

  it('uses Spanish social names and preserves explicit navigation and copyright overrides', () => {
    const { rerender } = render(
      <I18nProvider locale="es">
        <SiteFooter columns={sampleFooterColumns} legalLinks={sampleLegalLinks} social={sampleSocialLinks} />
      </I18nProvider>,
    );
    expect(screen.getByRole('navigation', { name: 'Pie de página' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Legal' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Redes sociales' })).toBeInTheDocument();
    rerender(
      <I18nProvider locale="es">
        <SiteFooter columns={sampleFooterColumns} navLabel="Explore" copyright="© Custom" />
      </I18nProvider>,
    );
    expect(screen.getByRole('navigation', { name: 'Explore' })).toBeInTheDocument();
    expect(screen.getByText('© Custom')).toBeInTheDocument();
    expect(screen.queryByText('© Example, Inc.')).toBeNull();
  });
  it('renders the public fixtures with Product, Company, Resources and RSS', () => {
    render(<SiteFooter columns={sampleFooterColumns} legalLinks={sampleLegalLinks} social={sampleSocialLinks} />);
    expect(
      within(screen.getByRole('navigation', { name: 'Footer' }))
        .getAllByRole('heading', { level: 2 })
        .map((h) => h.textContent),
    ).toEqual(['Product', 'Company', 'Resources']);
    expect(screen.getByRole('navigation', { name: 'Legal' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'RSS feed' })).toHaveAttribute('href', '/feed.xml');
  });
  it('places the newsletter slot below the custom brand and description', () => {
    render(
      <SiteFooter
        brand={<span>Example brand</span>}
        description="Built for teams"
        newsletter={<a href="/subscribe">Subscribe</a>}
      />,
    );
    const brand = screen.getByText('Example brand');
    expect(brand.nextElementSibling).toHaveTextContent('Built for teams');
    expect(brand.nextElementSibling?.nextElementSibling).toHaveTextContent('Subscribe');
  });
  it.each(['columns', 'centered', 'simple'] as const)(
    'offers four icon-only theme options at every width in %s only when requested',
    (layout) => {
      const { rerender } = render(<SiteFooter layout={layout} />);
      expect(screen.queryByRole('group', { name: 'Theme' })).toBeNull();
      rerender(<SiteFooter layout={layout} themeSwitcher />);
      const group = screen.getByRole('group', { name: 'Theme' });
      const options = within(group).getAllByRole('button');
      expect(options.map((option) => option.getAttribute('aria-label'))).toEqual([
        'Light',
        'Dark',
        'High contrast',
        'System',
      ]);
      for (const option of options) expect(option.textContent).toBe('');
      for (let node: Element | null = group; node; node = node.parentElement) {
        expect(node.className).not.toMatch(/(?:^|\s)(?:hidden|md:)/);
      }
    },
  );
  it('centers the brand, wrapping link and social rows, and copyright', () => {
    const { container } = render(
      <SiteFooter
        layout="centered"
        links={[{ label: 'Status', href: '/status' }]}
        social={[{ label: 'RSS feed', href: '/feed.xml', icon: Rss }]}
      />,
    );
    expect(container.firstElementChild).toHaveClass('flex', 'flex-col', 'items-center', 'text-center');
    for (const list of screen.getAllByRole('list')) expect(list).toHaveClass('flex-wrap', 'justify-center');
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByText('© Example, Inc.')).toBeInTheDocument();
  });
  it('keeps the original simple row classes and inherited typography under RTL, with translated navigation', () => {
    const { container } = render(
      <I18nProvider locale="es" dir="rtl">
        <SiteFooter
          layout="simple"
          links={[{ label: 'Status', href: '/status' }]}
          legalLinks={[{ label: 'Privacy', href: '/privacy' }]}
          copyright="© Example"
        />
      </I18nProvider>,
    );
    const row = screen.getByText('© Example').parentElement!;
    expect(row.className).toBe('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between');
    expect(screen.getByRole('navigation', { name: 'Pie de página' }).querySelector('ul')?.className).toBe(
      'flex flex-wrap gap-x-4 gap-y-1',
    );
    expect(screen.getByRole('navigation', { name: 'Legal' })).toBeInTheDocument();
    expect(container.querySelector('[dir="rtl"]')).toContainElement(row);
    expect(row.className).not.toMatch(/text-|(?:ml|mr|pl|pr|left|right)-/);
    expect(row.firstElementChild).toHaveTextContent('© Example');
    expect(screen.queryByRole('img')).toBeNull();
  });
  it('provides an opt-in landmark and composes inside StackedLayout without nesting footers', () => {
    const { container, rerender } = render(<SiteFooter />);
    expect(container.firstElementChild?.tagName).toBe('DIV');
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
    rerender(<SiteFooter landmark />);
    expect(screen.getByRole('contentinfo')).toBe(container.firstElementChild);
    expect(container.firstElementChild?.tagName).toBe('FOOTER');
    rerender(
      <StackedLayout footer={<SiteFooter layout="simple" />}>
        <h1>Example</h1>
      </StackedLayout>,
    );
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
    expect(screen.getByRole('contentinfo').querySelector('footer')).toBeNull();
  });
  it('names social anchors, hides their icons and follows column, legal, social tab order', async () => {
    const user = userEvent.setup();
    render(
      <SiteFooter
        columns={[{ title: 'Product', links: [{ label: 'Overview', href: '/product' }] }]}
        legalLinks={[{ label: 'Privacy', href: '/privacy' }]}
        social={[{ label: 'RSS feed', href: '/feed.xml', icon: Rss }]}
      />,
    );
    const list = screen.getByRole('list', { name: 'Social links' });
    const rss = within(list).getByRole('link', { name: 'RSS feed' });
    expect(rss).toHaveAttribute('href', '/feed.xml');
    expect(rss.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    for (const label of ['Overview', 'Privacy', 'RSS feed']) {
      await user.tab();
      expect(screen.getByRole('link', { name: label })).toHaveFocus();
    }
  });
  it('renders titled columns in one navigation and legal links separately', () => {
    const { rerender } = render(
      <SiteFooter
        columns={[
          { title: 'Product', links: [{ label: 'Overview', href: '/product' }] },
          { title: 'Company', links: [{ label: 'About', href: '/about' }] },
          { title: 'Resources', links: [{ label: 'Docs', href: '/docs' }] },
        ]}
        legalLinks={[{ label: 'Privacy', href: '/privacy' }]}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Footer' });
    expect(
      within(nav)
        .getAllByRole('heading', { level: 2 })
        .map((h) => h.textContent),
    ).toEqual(['Product', 'Company', 'Resources']);
    for (const heading of within(nav).getAllByRole('heading')) {
      expect(heading.nextElementSibling?.tagName).toBe('UL');
      expect(within(heading.nextElementSibling as HTMLElement).getByRole('link')).toBeInTheDocument();
    }
    expect(
      within(screen.getByRole('navigation', { name: 'Legal' })).getByRole('link', { name: 'Privacy' }),
    ).toHaveAttribute('href', '/privacy');
    expect(screen.getByText('© Example, Inc.')).toBeInTheDocument();
    rerender(
      <SiteFooter
        headingLevel="h3"
        navLabel="Explore"
        columns={[{ title: 'Product', links: [{ label: 'Overview', href: '/product' }] }]}
      />,
    );
    expect(
      within(screen.getByRole('navigation', { name: 'Explore' })).getByRole('heading', { level: 3, name: 'Product' }),
    ).toBeInTheDocument();
  });
});
