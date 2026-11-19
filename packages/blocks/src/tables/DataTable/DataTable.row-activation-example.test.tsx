import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../../test/a11y';
import RowActivationExample from './examples/row-activation';

afterEach(() => vi.restoreAllMocks());

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
  const virtualTable = screen.getByRole('table', { name: 'Enlaces de despliegues virtualizados' }) as HTMLTableElement;
  const container = virtualTable.parentElement!;
  Object.defineProperty(container, 'clientHeight', { configurable: true, value: 512 });
  Object.defineProperty(virtualTable.tHead!, 'offsetHeight', { configurable: true, value: 40 });
  const originalRect = HTMLTableSectionElement.prototype.getBoundingClientRect;
  vi.spyOn(HTMLTableSectionElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLTableSectionElement,
  ) {
    return this === virtualTable.tBodies[0]
      ? new DOMRect(0, 40 - container.scrollTop, 800, 40000)
      : originalRect.call(this);
  });
  await userEvent.click(screen.getByRole('button', { name: 'Mostrar el despliegue 800' }));
  expect(await screen.findByRole('link', { name: /reports-66/ })).toHaveFocus();
});
