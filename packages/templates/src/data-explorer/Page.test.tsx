import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import DataExplorerPage from './Page';
import { explorerRows, generateExplorerRows } from './data';

const small = generateExplorerRows(300);

describe('DataExplorerPage', () => {
  it('renders the query bar and the table over 10k rows', { timeout: 20000 }, async () => {
    render(<DataExplorerPage />);
    expect(explorerRows).toHaveLength(10_000);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Data explorer' })).toBeInTheDocument();
    expect(screen.getByText('10,000 of 10,000 rows')).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'request_logs rows' });
    expect(within(table).getAllByRole('row')).toHaveLength(51);
    await expectNoAxeViolations();
  });

  it('filters with a typed PowerSearch term', { timeout: 15000 }, async () => {
    render(<DataExplorerPage rows={small} />);
    await userEvent.click(screen.getByRole('combobox', { name: 'Filter request_logs' }));
    await userEvent.keyboard('status>=500{Enter}');
    const expected = small.filter((r) => r.status >= 500).length;
    expect(screen.getByText(`${expected} of 300 rows`)).toBeInTheDocument();
  });

  it('chooses columns and inspects a row', { timeout: 15000 }, async () => {
    render(<DataExplorerPage rows={small} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Columns' })[0]!);
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('option', { name: /Region/ }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add checked' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Apply' }));
    const table = screen.getByRole('table', { name: 'request_logs rows' });
    expect(within(table).getByRole('columnheader', { name: /Region/ })).toBeInTheDocument();

    const first = small[0]!;
    await userEvent.click(within(table).getByRole('button', { name: new RegExp(`${first.id}`) }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Inspect row' }));
    const drawer = await screen.findByRole('dialog');
    expect(within(drawer).getByRole('tree', { name: `Row ${first.id}` })).toHaveTextContent(first.userAgent);
  });
});
