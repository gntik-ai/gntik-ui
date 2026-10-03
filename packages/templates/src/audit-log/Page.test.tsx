import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import AuditLogPage, { auditEventsToCsv, filterAuditEvents } from './Page';
import { auditEvents } from './data';

const ALL = { start: null, end: null };

describe('AuditLogPage', () => {
  it('renders filters, date range and the events table', { timeout: 15000 }, async () => {
    render(<AuditLogPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Audit log' })).toBeInTheDocument();
    expect(screen.getByRole('search', { name: 'Filters' })).toBeInTheDocument();
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(auditEvents.length + 1);
    await expectNoAxeViolations();
  });

  it('searches, opens a diff and exports the filtered events', { timeout: 15000 }, async () => {
    const onExport = vi.fn();
    render(<AuditLogPage onExport={onExport} />);
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'project.');
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(3);

    await userEvent.click(screen.getByRole('button', { name: 'View changes for project.update on web-app' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/"region": "eu-central-1"/)).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    await userEvent.click(screen.getAllByRole('button', { name: 'Export CSV' })[0]!);
    expect(onExport).toHaveBeenCalledWith([expect.objectContaining({ id: 'evt_9f21' }), expect.objectContaining({ id: 'evt_9ec0' })]);
  });

  it('filters by field (OR within, AND across) and writes CSV', () => {
    const rows = filterAuditEvents(auditEvents, '', [{ field: 'result', value: 'failed' }, { field: 'result', value: 'denied' }], ALL);
    expect(rows.map((e) => e.id)).toEqual(['evt_9f0a', 'evt_9ef3']);
    expect(auditEventsToCsv(rows).split('\n')[0]).toBe('time,actor,email,action,resource,target,ip,result');
  });
});
