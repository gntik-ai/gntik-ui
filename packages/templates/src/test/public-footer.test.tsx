import { render, screen, within } from '@testing-library/react';
import { I18nProvider } from '@gntik-ai/ui';
import LandingPage from '../landing/Page';
import PricingPage from '../pricing/Page';
import ContactPage from '../contact/Page';
import { expectNoAxeViolations } from './a11y';

describe.each([
  ['landing', LandingPage],
  ['pricing', PricingPage],
  ['contact', ContactPage],
] as const)('%s public footer', (_name, Page) => {
  it.each(['dark', 'light', 'high_contrast'])(
    'keeps one footer with the public links (%s)',
    { timeout: 15000 },
    async (theme) => {
      document.documentElement.className = theme;
      const { container } = render(<Page />);
      const footers = screen.getAllByRole('contentinfo');
      expect(footers).toHaveLength(1);
      const footer = footers[0]!;
      expect(footer.querySelector('footer')).toBeNull();
      const nav = within(footer).getByRole('navigation', { name: 'Footer' });
      expect(
        within(nav)
          .getAllByRole('link')
          .map((link) => link.textContent),
      ).toEqual(['Status', 'Privacy', 'Terms']);
      await expectNoAxeViolations(container);
    },
  );

  it('uses the footer catalog and keeps caller footerLinks and copyright', () => {
    render(
      <I18nProvider locale="es">
        <Page footerLinks={[{ label: 'Custom link', href: '/custom' }]} copyright="© Custom" />
      </I18nProvider>,
    );
    const footer = screen.getByRole('contentinfo');
    const nav = within(footer).getByRole('navigation', { name: 'Pie de página' });
    expect(within(nav).getByRole('link', { name: 'Custom link' })).toHaveAttribute('href', '/custom');
    expect(within(footer).getByText('© Custom')).toBeInTheDocument();
  });
});
