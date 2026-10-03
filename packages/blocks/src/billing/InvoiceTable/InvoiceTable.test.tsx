import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { InvoiceTable } from './InvoiceTable';
import { sampleInvoices } from './fixtures';

describe('InvoiceTable', () => {
  it('renders one row per invoice with status and amount', async () => {
    const { container } = render(<InvoiceTable />);
    const table = screen.getByRole('table', { name: 'Invoice history' });
    expect(within(table).getAllByRole('row')).toHaveLength(sampleInvoices.length + 1);
    expect(screen.getByText('$1,584.20')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Download INV-2026-0004' })).toHaveAttribute('href', '#invoice-INV-2026-0004');
    await expectNoAxeViolations(container);
  });

  it('calls onDownload with the invoice', async () => {
    const user = userEvent.setup();
    const onDownload = vi.fn();
    const invoices = [{ id: 'a', number: 'INV-1', date: '2026-01-01', amount: 10, status: 'paid' as const }];
    render(<InvoiceTable invoices={invoices} onDownload={onDownload} />);
    await user.click(screen.getByRole('button', { name: 'Download INV-1' }));
    expect(onDownload).toHaveBeenCalledWith(invoices[0]);
  });
});
