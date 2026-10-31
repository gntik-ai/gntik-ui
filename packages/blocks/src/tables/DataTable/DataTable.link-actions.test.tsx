import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from './DataTable';

it('exposes row-action destinations as anchor menuitems through MoreMenu', async () => {
  const user = userEvent.setup();
  render(
    <DataTable
      defaultPageSize={5}
      labels={{ rowActions: () => 'Run actions' }}
      rowActions={() => [{ label: 'View logs', href: '/logs?run=42' }]}
    />,
  );
  await user.click(screen.getAllByRole('button', { name: 'Run actions' })[0]!);
  const link = await screen.findByRole('menuitem', { name: 'View logs' });
  expect(link.tagName).toBe('A');
  expect(link).toHaveAttribute('href', '/logs?run=42');
});
