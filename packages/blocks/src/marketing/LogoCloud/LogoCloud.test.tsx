import { render, screen, within } from '@testing-library/react';
import { LogoCloud } from './LogoCloud';
import { I18nProvider } from '@gntik-ai/ui';
import { readFileSync } from 'node:fs';
import { expectNoAxeViolations } from '../../test/a11y';
import Row from './examples/Row';
import Grid from './examples/Grid';
import CaptionStart from './examples/CaptionStart';
import UnderHero from './examples/UnderHero';
import Custom from './examples/Custom';
import Empty from './examples/Empty';
import { sampleLogos } from './fixtures';

const logos = ['Acme', 'Example', 'Sample', 'Demo', 'Placeholder', 'Studio'].map((name) => ({
  id: name,
  name,
  mark: (
    <svg viewBox="0 0 80 28" fill="currentColor">
      <path d="M0 0h80v28H0z" />
    </svg>
  ),
}));

describe('LogoCloud', () => {
  describe.each([
    ['row', Row],
    ['grid', Grid],
    ['caption start', CaptionStart],
    ['under Hero', UnderHero],
    ['custom', Custom],
    ['empty', Empty],
  ] as const)('%s example', (_name, Example) => {
    it.each(['dark', 'light', 'high_contrast'])('has no axe violations in %s', async (theme) => {
      document.documentElement.className = theme;
      const { container } = render(<Example />);
      await expectNoAxeViolations(container);
    });
  });
  it('ships six neutral currentColor fixture marks', () => {
    render(<LogoCloud logos={sampleLogos} />);
    expect(screen.getAllByRole('img').map((image) => image.getAttribute('aria-label'))).toEqual([
      'Acme',
      'Example',
      'Sample',
      'Demo',
      'Placeholder',
      'Studio',
    ]);
    for (const image of screen.getAllByRole('img'))
      expect(image.querySelector('svg')).toHaveAttribute('fill', 'currentColor');
  });
  it.each(['no-preference', 'reduce'])('stays static with motion preference %s', (preference) => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = (query) => ({
      ...originalMatchMedia(query),
      matches: query === `(prefers-reduced-motion: ${preference})`,
    });
    try {
      const { container } = render(<LogoCloud logos={logos} />);
      for (const element of container.querySelectorAll<HTMLElement>('*')) {
        expect(element.getAttribute('class') ?? '').not.toMatch(
          /animate-|transition-transform|(?:^|\s)(?:filter|blur|mask|backdrop)-?/,
        );
        expect(element.getAttribute('style') ?? '').not.toMatch(/animation|transition|transform|filter|mask|color/i);
      }
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
  it('contains no fixed colours, palette utilities, theme variants or visual effects', () => {
    const source = readFileSync('src/marketing/LogoCloud/LogoCloud.tsx', 'utf8');
    expect(source).not.toMatch(/#[\da-f]{3,8}\b|(?:rgb|hsl)a?\(|dark:|gradient|glow|shadow/i);
    expect(source).not.toMatch(
      /(?:bg|text|border|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d/,
    );
    expect(source).not.toContain('Trusted by teams at companies of every size');
  });
  it('renders nothing for an empty logo array, leaving no dangling caption or ARIA', () => {
    const { container } = render(<LogoCloud logos={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
  it('sizes every mark to 28px by default and accepts a height with automatic width', () => {
    const { rerender } = render(<LogoCloud logos={logos} />);
    for (const image of screen.getAllByRole('img')) expect(image).toHaveStyle({ height: '28px' });
    rerender(<LogoCloud logos={logos} logoHeight={40} />);
    for (const image of screen.getAllByRole('img')) {
      expect(image).toHaveStyle({ height: '40px' });
      expect(image.querySelector('[aria-hidden]')).toHaveClass(
        '[&_svg]:h-full',
        '[&_svg]:w-auto',
        '[&_svg]:max-w-full',
      );
      expect(image.style.color).toBe('');
    }
  });
  it('inherits the muted token and allows foreground overrides on the root and individual items', () => {
    const { container, rerender } = render(<LogoCloud logos={logos} />);
    expect(container.firstElementChild).toHaveClass('text-muted-foreground');
    rerender(
      <LogoCloud
        logos={[{ ...logos[0]!, className: 'text-foreground' }, ...logos.slice(1)]}
        className="text-foreground"
      />,
    );
    expect(container.firstElementChild).toHaveClass('text-foreground');
    expect(container.firstElementChild).not.toHaveClass('text-muted-foreground');
    expect(screen.getAllByRole('listitem')[0]).toHaveClass('text-foreground');
    for (const image of screen.getAllByRole('img')) expect(image.className).not.toMatch(/text-/);
  });
  it.each([
    [3, 'md:grid-cols-3'],
    [4, 'md:grid-cols-4'],
    [6, 'md:grid-cols-6'],
  ] as const)('uses two phone columns and %s desktop columns', (columns, desktopClass) => {
    render(<LogoCloud logos={logos} layout="grid" columns={columns} />);
    expect(screen.getByRole('list')).toHaveClass('grid', 'grid-cols-2', desktopClass);
  });
  it('defaults to a centred wrapping row; columns only affect grid layout', () => {
    const { rerender } = render(<LogoCloud logos={logos} columns={6} />);
    expect(screen.getByRole('list')).toHaveClass('flex', 'flex-wrap', 'justify-center');
    expect(screen.getByRole('list').className).not.toMatch(/grid-cols/);
    rerender(<LogoCloud logos={logos} layout="grid" />);
    expect(screen.getByRole('list')).toHaveClass('md:grid-cols-4');
  });
  it('keeps the caption above by default and places it beside the list only from md when requested', () => {
    const { container, rerender } = render(<LogoCloud logos={logos} />);
    expect(container.firstElementChild).toHaveClass('flex', 'flex-col');
    expect(container.firstElementChild).not.toHaveClass('md:flex-row');
    rerender(<LogoCloud logos={logos} captionPlacement="start" />);
    expect(container.firstElementChild).toHaveClass('flex-col', 'md:flex-row', 'md:items-center');
    expect(screen.getByRole('list').previousElementSibling?.id).toBe(
      screen.getByRole('list').getAttribute('aria-labelledby'),
    );
  });
  it.each([
    ['en', 'Trusted by teams at companies of every size'],
    ['es', 'Equipos de empresas de todos los tamaños confían en nosotros'],
  ])('names the list with the %s catalog caption by default', (locale, caption) => {
    render(
      <I18nProvider locale={locale}>
        <LogoCloud logos={logos} />
      </I18nProvider>,
    );
    expect(screen.getByRole('list', { name: caption })).toBeInTheDocument();
  });
  it('labels one six-item list with the caption and gives each decorative mark a named image', () => {
    render(<LogoCloud logos={logos} caption={<span>Our community</span>} />);
    const list = screen.getByRole('list', { name: 'Our community' });
    expect(screen.getAllByRole('list')).toHaveLength(1);
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(6);
    for (const [index, item] of items.entries()) {
      const image = within(item).getByRole('img', { name: logos[index]!.name });
      expect(image.querySelector('[aria-hidden="true"]')).toContainElement(image.querySelector('svg'));
    }
  });
});
