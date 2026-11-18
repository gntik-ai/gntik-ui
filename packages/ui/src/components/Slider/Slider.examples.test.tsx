import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { I18nProvider } from '../../i18n/I18nProvider';
import SliderMarks from './examples/SliderMarks';

it.each(['dark', 'light', 'high_contrast'])('SliderMarks has no axe violations in %s', async (theme) => {
  render(
    <div className={theme}>
      <SliderMarks />
    </div>,
  );
  expect(screen.getByRole('slider', { name: 'Temperature' })).toHaveAttribute('aria-valuetext', 'Balanced, 1');
  expect(screen.getByRole('slider', { name: 'Replicas' })).toBeInTheDocument();
  await expectNoAxeViolations();
});

it('translates the marks example in Spanish', () => {
  render(
    <I18nProvider locale="es">
      <SliderMarks />
    </I18nProvider>,
  );
  expect(screen.getByRole('slider', { name: 'Temperatura' })).toHaveAttribute('aria-valuetext', 'Equilibrado, 1');
  expect(screen.getByRole('slider', { name: 'Réplicas' })).toBeInTheDocument();
  expect(screen.getByText('Preciso')).toBeInTheDocument();
  expect(screen.getByText('Creativo')).toBeInTheDocument();
});
