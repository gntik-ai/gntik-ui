import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import IncidentBoardPage from './Page';
import { applyVisibleMove, formatAge, triageColumns } from './data';

const column = (name: RegExp) => screen.getByRole('region', { name });
const status = () => screen.getAllByRole('status').map((s) => s.textContent?.trim() ?? '').join(' ');

describe('IncidentBoardPage', () => {
  it('renders the header, KPIs, filters and the board by stage', { timeout: 15000 }, async () => {
    render(<IncidentBoardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Incident board' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Declare incident' })[0]).toBeInTheDocument();
    const kpis = screen.getByLabelText('Incident summary');
    expect(within(kpis).getByText('Open incidents').nextElementSibling).toHaveTextContent('5');
    expect(screen.getByRole('group', { name: 'Incidents by stage' })).toBeInTheDocument();
    for (const stage of ['Triage', 'Investigating', 'Mitigated', 'Resolved']) expect(screen.getByRole('heading', { level: 2, name: new RegExp(stage) })).toBeInTheDocument();
    const card = within(column(/Triage/)).getByRole('button', { name: /INC-3120/ });
    expect(card).toHaveTextContent('SEV1');
    expect(card).toHaveTextContent('Unassigned');
    expect(card).toHaveTextContent('12m');
    await expectNoAxeViolations();
  });

  it('moves a card with the keyboard, announces it and reports the move', { timeout: 15000 }, async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<IncidentBoardPage onMove={onMove} />);
    within(column(/Triage/)).getByRole('button', { name: /INC-3120/ }).focus();
    await user.keyboard(' {ArrowRight} ');
    expect(within(column(/Investigating/)).getByRole('button', { name: /INC-3120/ })).toBeInTheDocument();
    expect(status()).toMatch(/INC-3120 Checkout latency above 2 s, SEV1 dropped at position \d of 3 in Investigating/);
    expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ cardId: 'INC-3120', fromColumnId: 'triage', toColumnId: 'investigating' }), expect.any(Array));
  });

  it('filters the board and opens the details drawer', { timeout: 15000 }, async () => {
    const user = userEvent.setup();
    render(<IncidentBoardPage />);
    await user.type(screen.getByRole('searchbox'), 'webhook');
    const board = screen.getByRole('group', { name: 'Incidents by stage' });
    expect(within(board).getAllByRole('button', { name: /INC-\d+/ })).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: /INC-3111/ }));
    const drawer = await screen.findByRole('dialog', { name: 'Webhook deliveries delayed' });
    expect(within(drawer).getByText('Linus Ortega')).toBeInTheDocument();
    expect(within(drawer).getByText('SEV2')).toBeInTheDocument();
  });

  it('maps a move on the filtered board to full-board indices', () => {
    const visible = triageColumns.map((c) => ({ ...c, cards: c.cards.filter((i) => i.severity === 'sev2') }));
    const { columns, move } = applyVisibleMove(triageColumns, visible, { cardId: 'INC-3111', fromColumnId: 'investigating', fromIndex: 0, toColumnId: 'resolved', toIndex: 0 });
    expect(move).toMatchObject({ fromIndex: 1, toIndex: 1 });
    expect(columns.find((c) => c.id === 'resolved')?.cards.map((i) => i.id)).toEqual(['INC-3097', 'INC-3111', 'INC-3092']);
    expect(formatAge(0, 3 * 60 * 60_000 + 5 * 60_000)).toBe('3h 5m');
  });
});
