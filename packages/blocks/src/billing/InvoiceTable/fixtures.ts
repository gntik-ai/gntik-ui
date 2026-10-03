import type { Invoice } from './InvoiceTable';

/** Sample invoice history. */
export const sampleInvoices: Invoice[] = [
  { id: 'inv_0526', number: 'INV-2026-0005', date: '2026-06-01', amount: 1620, status: 'open', url: '#invoice-INV-2026-0005' },
  { id: 'inv_0426', number: 'INV-2026-0004', date: '2026-05-01', amount: 1584.2, status: 'paid', url: '#invoice-INV-2026-0004' },
  { id: 'inv_0326', number: 'INV-2026-0003', date: '2026-04-01', amount: 1498, status: 'paid', url: '#invoice-INV-2026-0003' },
  { id: 'inv_0226', number: 'INV-2026-0002', date: '2026-03-01', amount: 1432.6, status: 'overdue', url: '#invoice-INV-2026-0002' },
  { id: 'inv_0126', number: 'INV-2026-0001', date: '2026-02-01', amount: 1200, status: 'void' },
];
