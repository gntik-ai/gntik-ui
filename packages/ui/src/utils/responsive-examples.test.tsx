import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../test/a11y';
import { I18nProvider } from '../i18n/I18nProvider';
import GridResponsiveSpacing from '../components/Grid/examples/GridResponsiveSpacing';
import SectionResponsivePadding from '../components/Section/examples/SectionResponsivePadding';
import ResponsiveExample from './examples/responsiveExample';

it.each(['dark', 'light', 'high_contrast'])('responsive examples have no axe violations in %s', async (theme) => {
  document.documentElement.className = theme;
  render(
    <>
      <GridResponsiveSpacing />
      <SectionResponsivePadding />
      <ResponsiveExample />
    </>,
  );
  expect(screen.getByRole('region', { name: 'Responsive spacing' })).toHaveClass('p-4', 'md:p-8');
  await expectNoAxeViolations();
});

it('uses the Spanish catalog for every new preview', async () => {
  render(
    <I18nProvider locale="es">
      <GridResponsiveSpacing />
      <SectionResponsivePadding />
      <ResponsiveExample />
    </I18nProvider>,
  );
  expect(screen.getByRole('region', { name: 'Espaciado adaptable' })).toBeInTheDocument();
  expect(screen.getAllByText('Elemento 1')).toHaveLength(2);
  expect(screen.getByText('Diálogo desde pantallas medianas')).toBeInTheDocument();
  expect(screen.queryByText('Responsive spacing')).not.toBeInTheDocument();
  await expectNoAxeViolations();
});
