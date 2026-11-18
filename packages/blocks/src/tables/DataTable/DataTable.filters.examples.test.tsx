import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import { DataTable } from './DataTable';
import HeaderFiltersExample from './examples/header-filters';
import { expectNoAxeViolations } from '../../test/a11y';

it.each(['dark', 'light', 'high_contrast'])(
  'keeps the example and each open editor accessible in %s',
  async (theme) => {
    const previous = document.documentElement.className;
    document.documentElement.className = theme;
    const user = userEvent.setup();
    try {
      render(<HeaderFiltersExample />);
      await expectNoAxeViolations(document.body);
      const table = screen.getByRole('table', { name: 'Client filters' });
      for (const name of ['Name', 'Status', 'Cost', 'Created', 'Enabled', 'Custom name']) {
        const trigger = within(table).getByRole('button', { name: `Filter ${name}` });
        await user.click(trigger);
        await screen.findByRole('dialog');
        await expectNoAxeViolations(document.body);
        await user.keyboard('{Escape}');
        await waitFor(() => expect(trigger).toHaveFocus());
      }
    } finally {
      document.documentElement.className = previous;
    }
  },
  60000,
);

it('uses the Spanish catalog for header filters and boolean choices', async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider locale="es">
      <DataTable
        rows={[{ id: 'a', enabled: true }]}
        columns={[{ id: 'enabled', header: 'Enabled', accessor: (r) => r.enabled, filter: { type: 'boolean' } }]}
      />
    </I18nProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'Filtrar Enabled' }));
  expect(await screen.findByRole('radio', { name: 'Cualquiera' })).toBeInTheDocument();
  await user.click(screen.getByRole('radio', { name: 'Sí' }));
  await user.click(screen.getByRole('button', { name: 'Aplicar' }));
  expect(screen.getByRole('button', { name: 'Filtrar Enabled, filtrado' })).toBeInTheDocument();
});

it('places sort, help, filter and resize in tab order with label overrides', async () => {
  const user = userEvent.setup();
  render(
    <DataTable
      rows={[{ id: 'a', status: 'failed' }]}
      resizable
      columns={[
        {
          id: 'status',
          header: 'Status',
          sortable: true,
          description: 'Status help',
          accessor: (r) => r.status,
          filter: { type: 'text' },
        },
      ]}
      labels={{
        filterColumn: (header) => `Find ${header}`,
        filtered: ', active',
        applyFilter: 'Use filter',
        clearFilter: 'Remove filter',
      }}
    />,
  );
  const sort = screen.getByRole('button', { name: 'Status' });
  sort.focus();
  await user.tab();
  expect(screen.getByRole('button', { name: 'More information about Status' })).toHaveFocus();
  await user.tab();
  const filter = screen.getByRole('button', { name: 'Find Status' });
  expect(filter).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('separator', { name: 'Resize Status column' })).toHaveFocus();
  await user.click(filter);
  await user.type(await screen.findByRole('textbox', { name: 'Status' }), 'failed');
  await user.click(screen.getByRole('button', { name: 'Use filter' }));
  expect(filter).toHaveAccessibleName('Find Status, active');
  await user.click(filter);
  await user.click(await screen.findByRole('button', { name: 'Remove filter' }));
  expect(filter).toHaveAccessibleName('Find Status');
});
