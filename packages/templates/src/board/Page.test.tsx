import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import BoardPage from './Page';
import { boardColumns, boardState, moveCard } from './data';

const lane = (name: string) => screen.getByRole('region', { name: new RegExp(`^${name}`) });

describe('BoardPage', () => {
  it('renders every column with its cards', { timeout: 15000 }, async () => {
    render(<BoardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Sprint board' })).toBeInTheDocument();
    for (const c of boardColumns) expect(within(lane(c.title)).getAllByRole('button')).toHaveLength(boardState[c.id]!.length);
    await expectNoAxeViolations();
  });

  it('moves a card with the keyboard and announces each step', { timeout: 15000 }, async () => {
    const onMove = vi.fn();
    render(<BoardPage onMove={onMove} />);
    const card = within(lane('Backlog')).getByRole('button', { name: /Rotate staging/ });
    card.focus();
    await userEvent.keyboard(' ');
    expect(card).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/Picked up Rotate staging database credentials in Backlog, position 1 of 3/)).toBeInTheDocument();
    await userEvent.keyboard('{ArrowRight}');
    const moved = within(lane('In progress')).getByRole('button', { name: /Rotate staging/ });
    expect(moved).toHaveFocus();
    expect(screen.getByText('Moved to In progress, position 1 of 3.')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown} ');
    expect(onMove).toHaveBeenCalledWith('T-101', 'in-progress', 1);
    expect(screen.getByText(/Dropped Rotate staging database credentials in In progress, position 2 of 3/)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Escape returns a picked-up card to where it was', { timeout: 15000 }, async () => {
    render(<BoardPage />);
    within(lane('In review')).getByRole('button', { name: /audit log export/ }).focus();
    await userEvent.keyboard(' {ArrowRight}{Escape}');
    expect(within(lane('In review')).getByRole('button', { name: /audit log export/ })).toHaveFocus();
    expect(screen.getByText(/Cancelled\./)).toBeInTheDocument();
  });

  it('drops a card dragged with the pointer and opens the detail drawer', { timeout: 15000 }, async () => {
    const onMove = vi.fn();
    render(<BoardPage onMove={onMove} />);
    const card = within(lane('Backlog')).getByRole('button', { name: /invoices table/ });
    fireEvent.dragStart(card);
    fireEvent.dragOver(lane('Done'));
    fireEvent.drop(lane('Done'));
    expect(onMove).toHaveBeenCalledWith('T-103', 'done', 1);
    await userEvent.click(within(lane('Done')).getByRole('button', { name: /invoices table/ }));
    const drawer = await screen.findByRole('dialog', { name: 'Empty state for the invoices table' });
    expect(within(drawer).getByRole('combobox', { name: 'Status' })).toHaveTextContent('Done');
    await expectNoAxeViolations();
  });

  it('moveCard keeps every other card in order', () => {
    expect(moveCard(boardState, 'T-104', 'backlog', 1).backlog).toEqual(['T-101', 'T-104', 'T-102', 'T-103']);
  });
});
