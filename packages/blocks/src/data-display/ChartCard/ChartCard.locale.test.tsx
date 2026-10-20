import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LocalizedCharts from '../../../../charts/src/examples/LocalizedCharts';
import { expectNoAxeViolations } from '../../test/a11y';

it.each(['dark', 'light', 'high_contrast'])('keeps the localised chart example accessible in %s', async (theme) => {
  document.documentElement.className = theme;
  const { container } = render(<LocalizedCharts />);
  expect(screen.getByRole('status', { name: 'Cargando gráfico' })).toBeInTheDocument();
  await expectNoAxeViolations(container);
  await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Chart language' }), 'en');
  expect(screen.getByRole('status', { name: 'Loading chart' })).toBeInTheDocument();
  expect(screen.getByText('Nada que mostrar')).toBeInTheDocument();
  expect(screen.getByText('Explicit empty message')).toBeInTheDocument();
});
