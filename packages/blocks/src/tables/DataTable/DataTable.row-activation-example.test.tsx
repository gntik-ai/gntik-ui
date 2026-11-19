import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../../test/a11y';
import RowActivationExample from './examples/row-activation';

it.each(['dark', 'light', 'high_contrast'])('has accessible row activation examples in %s', async (theme) => {
  document.documentElement.className = theme;
  const { container } = render(<RowActivationExample />);
  await expectNoAxeViolations(container);
});

it('demonstrates cancelled navigation, keyboard activation, selection and scroll handles in Spanish', async () => {
  render(
    <I18nProvider locale="es">
      <RowActivationExample />
    </I18nProvider>,
  );
  await userEvent.click(
    within(screen.getByRole('table', { name: 'Enlaces de despliegues' })).getByRole('link', { name: 'orders-api' }),
  );
  expect(screen.getByRole('status', { name: 'Activación de fila' })).toHaveTextContent('orders-api');
  await userEvent.click(screen.getByRole('button', { name: 'Mostrar el último despliegue' }));
  expect(screen.getByRole('link', { name: 'notifications-staging' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Mostrar el despliegue 800' }));
  expect(await screen.findByRole('link', { name: /reports-66/ })).toHaveFocus();
});
