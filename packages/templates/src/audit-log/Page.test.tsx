import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import AuditLogPage, { auditEventsToCsv, filterAuditEvents } from './Page';
import { auditEvents } from './data';

const ALL = { start: null, end: null };

describe('auditEventsToCsv', () => {
  it('neutralises an actor formula before applying CSV quoting', () => {
    const event = {
      ...auditEvents[0]!,
      actor: { name: '=HYPERLINK("https://example.test","x")', email: 'ana@example.test' },
    };

    expect(auditEventsToCsv([event]).split('\n')[1]).toContain(
      `,"'=HYPERLINK(""https://example.test"",""x"")",ana@example.test,`,
    );
  });

  it.each([
    ['equals', '=1+1', "'=1+1"],
    ['plus', '+1', "'+1"],
    ['minus', '-1', "'-1"],
    ['at sign', '@SUM(A1)', "'@SUM(A1)"],
    ['tab', '\tprojects/a', "'\tprojects/a"],
    ['carriage return', '\rprojects/a', "'\rprojects/a"],
  ])('neutralises a target starting with %s', (_label, target, expected) => {
    const event = { ...auditEvents[0]!, target };

    expect(auditEventsToCsv([event]).split('\n')[1]?.split(',')[5]).toBe(expected);
  });

  it.each([
    ['plain', 'projects/a', 'projects/a'],
    ['comma', 'projects/a,b', '"projects/a,b"'],
    ['quote', 'projects/"a"', '"projects/""a"""'],
    ['newline', 'projects/a\nb', '"projects/a\nb"'],
    ['embedded equals', 'a=b', 'a=b'],
    ['embedded minus', 'x-1', 'x-1'],
    ['leading space', ' =1+1', ' =1+1'],
    ['empty', '', ''],
  ])('preserves safe cells with %s and the CSV format', (_label, target, expected) => {
    const event = {
      ...auditEvents[0]!,
      at: new Date('2026-01-02T03:04:05.000Z'),
      actor: { name: 'Ana López', email: 'ana@example.test' },
      action: 'project.update',
      resource: 'Project',
      target,
      ip: '10.0.0.4',
      result: 'succeeded' as const,
    };

    expect(auditEventsToCsv([event])).toBe(
      'time,actor,email,action,resource,target,ip,result\n' +
        `2026-01-02T03:04:05.000Z,Ana López,ana@example.test,project.update,Project,${expected},10.0.0.4,succeeded`,
    );
  });
});

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
    expect(onExport).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'evt_9f21' }),
      expect.objectContaining({ id: 'evt_9ec0' }),
    ]);
  });

  it('filters by field (OR within, AND across) and writes CSV', () => {
    const rows = filterAuditEvents(
      auditEvents,
      '',
      [
        { field: 'result', value: 'failed' },
        { field: 'result', value: 'denied' },
      ],
      ALL,
    );
    expect(rows.map((e) => e.id)).toEqual(['evt_9f0a', 'evt_9ef3']);
    expect(auditEventsToCsv(rows).split('\n')[0]).toBe('time,actor,email,action,resource,target,ip,result');
  });

  it('takes the heading copy from props', { timeout: 15000 }, () => {
    render(<AuditLogPage title="Tenant activity" description="Changes across this tenant." />);
    expect(screen.getByRole('heading', { level: 1, name: 'Tenant activity' })).toBeInTheDocument();
    expect(screen.getByText('Changes across this tenant.')).toBeInTheDocument();
  });
});
