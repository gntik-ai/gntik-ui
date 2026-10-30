import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { I18nProvider } from '../../i18n/I18nProvider';
import StackResponsiveToolbar from './examples/StackResponsiveToolbar';

it.each(['dark', 'light', 'high_contrast'])('renders an accessible responsive toolbar in %s', async (theme) => {
  document.documentElement.className = theme;
  render(<StackResponsiveToolbar />);
  expect(screen.getByRole('button', { name: 'Save' }).parentElement).toHaveClass(
    'flex-col',
    'md:flex-row',
    'gap-2',
    'md:gap-4',
  );
  await expectNoAxeViolations();
});

it('uses existing translated labels in the toolbar', async () => {
  render(
    <I18nProvider locale="es">
      <StackResponsiveToolbar />
    </I18nProvider>,
  );
  expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  await expectNoAxeViolations();
});
