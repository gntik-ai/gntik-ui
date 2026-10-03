import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../i18n/I18nProvider';
import { expectNoAxeViolations } from '../../test/a11y';
import { LiveAnnouncer } from '../LiveAnnouncer';
import { KanbanBoard, moveKanbanCard, type KanbanColumn } from './KanbanBoard';
import { previewSortable } from './useSortable';
import KanbanBoardCustomCard from './examples/KanbanBoardCustomCard';
import KanbanBoardSprint from './examples/KanbanBoardSprint';

const column = (name: RegExp) => screen.getByRole('region', { name });
const card = (name: RegExp) => screen.getByRole('button', { name });
const status = () => screen.getByRole('status').textContent?.trim();

/** jsdom has no layout: columns are 280px wide every 300px, cards 80px tall every 100px. */
function mockLayout() {
  return vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const cols = Array.from(document.querySelectorAll('[data-sortable-container]'));
    const col = this.closest('[data-sortable-container]');
    const left = col ? cols.indexOf(col) * 300 : 0;
    let top = 0;
    let height = 1000;
    if (this.hasAttribute('data-sortable-item')) {
      const li = this.parentElement;
      const index = li?.parentElement ? Array.from(li.parentElement.children).indexOf(li) : 0;
      top = 50 + index * 100;
      height = 80;
    }
    return { x: left, y: top, left, top, width: 280, height, right: left + 280, bottom: top + height, toJSON: () => ({}) } as DOMRect;
  });
}

describe('KanbanBoard', () => {
  it('renders labelled columns with headings, counts and cards described by the instructions', () => {
    render(<KanbanBoardSprint />);
    expect(screen.getByRole('group', { name: 'Sprint board' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /To do, 3 cards/ })).toBeInTheDocument();
    expect(within(column(/Review/)).getByText('No cards')).toBeInTheDocument();
    const c = card(/Rotate API keys/);
    expect(c).toHaveAttribute('aria-roledescription', 'draggable card');
    expect(c).toHaveAttribute('aria-pressed', 'false');
    expect(c).toHaveAccessibleDescription(/Press Space to pick up the card/);
  });

  it('Tab moves between cards', async () => {
    const user = userEvent.setup();
    render(<KanbanBoardSprint />);
    await user.tab();
    expect(card(/Rotate API keys/)).toHaveFocus();
    await user.tab();
    expect(card(/Write the migration guide/)).toHaveFocus();
  });

  it('Space picks up, ArrowDown / ArrowRight move, Space drops — announced and keeping focus', async () => {
    const user = userEvent.setup();
    render(<KanbanBoardSprint />);
    card(/Rotate API keys/).focus();
    await user.keyboard(' ');
    expect(card(/Rotate API keys/)).toHaveAttribute('aria-pressed', 'true');
    expect(card(/Rotate API keys/)).toHaveAttribute('data-dragging');
    expect(status()).toBe('Picked up Rotate API keys. Position 1 of 3 in To do.');
    await user.keyboard('{ArrowDown}');
    expect(status()).toBe('Rotate API keys moved to position 2 of 3 in To do.');
    await user.keyboard('{ArrowRight}');
    expect(status()).toBe('Rotate API keys moved to position 2 of 2 in In progress.');
    expect(within(column(/In progress/)).getByRole('button', { name: /Rotate API keys/ })).toHaveFocus();
    await user.keyboard(' ');
    expect(status()).toBe('Rotate API keys dropped at position 2 of 2 in In progress.');
    const moved = within(column(/In progress/)).getByRole('button', { name: /Rotate API keys/ });
    expect(moved).toHaveAttribute('aria-pressed', 'false');
    expect(moved).toHaveFocus();
    expect(screen.getByRole('heading', { name: /To do, 2 cards/ })).toBeInTheDocument();
  });

  it('ArrowUp moves up and ArrowLeft moves to the previous column', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    const columns: KanbanColumn[] = [
      { id: 'a', title: 'A', cards: [{ id: '1', title: 'One' }] },
      { id: 'b', title: 'B', cards: [{ id: '2', title: 'Two' }, { id: '3', title: 'Three' }] },
    ];
    render(<KanbanBoard columns={columns} onMove={onMove} />);
    card(/Three/).focus();
    await user.keyboard(' {ArrowUp}');
    expect(status()).toBe('Three moved to position 1 of 2 in B.');
    await user.keyboard('{ArrowLeft}');
    expect(status()).toBe('Three moved to position 1 of 2 in A.');
    await user.keyboard('{Enter}');
    expect(onMove).toHaveBeenCalledWith({ cardId: '3', fromColumnId: 'b', fromIndex: 1, toColumnId: 'a', toIndex: 0 });
  });

  it('Home / End jump to the top / bottom; Enter drops', async () => {
    const user = userEvent.setup();
    render(<KanbanBoardSprint />);
    card(/Audit role permissions/).focus();
    await user.keyboard(' {Home}');
    expect(status()).toBe('Audit role permissions moved to position 1 of 3 in To do.');
    await user.keyboard('{End}');
    expect(status()).toBe('Audit role permissions moved to position 3 of 3 in To do.');
    await user.keyboard('{Home}{Enter}');
    const buttons = within(column(/To do/)).getAllByRole('button');
    expect(buttons[0]).toHaveAccessibleName(/Audit role permissions/);
  });

  it('Escape cancels and returns the card; onMove is not called', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    const columns: KanbanColumn[] = [
      { id: 'a', title: 'A', cards: [{ id: '1', title: 'One' }] },
      { id: 'b', title: 'B', cards: [] },
    ];
    render(<KanbanBoard columns={columns} onMove={onMove} />);
    card(/One/).focus();
    await user.keyboard(' {ArrowRight}');
    expect(within(column(/B/)).getByRole('button', { name: /One/ })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(status()).toBe('Move cancelled. One returned to A.');
    expect(within(column(/A/)).getByRole('button', { name: /One/ })).toHaveAttribute('aria-pressed', 'false');
    expect(onMove).not.toHaveBeenCalled();
  });

  it('Tab during a move cancels it', async () => {
    const user = userEvent.setup();
    render(<KanbanBoardSprint />);
    card(/Rotate API keys/).focus();
    await user.keyboard(' {ArrowDown}');
    await user.tab();
    expect(status()).toBe('Move cancelled. Rotate API keys returned to To do.');
    expect(within(column(/To do/)).getAllByRole('button')[0]).toHaveAccessibleName(/Rotate API keys/);
  });

  it('Enter (or a click) on a resting card opens it', async () => {
    const user = userEvent.setup();
    render(<KanbanBoardSprint />);
    card(/Usage export/).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByText('Opened: Usage export to CSV')).toBeInTheDocument();
    await user.click(card(/Fix the invite/));
    expect(screen.getByText('Opened: Fix the invite email link')).toBeInTheDocument();
  });

  it('pointer drag moves a card across columns and does not open it', () => {
    const layout = mockLayout();
    render(<KanbanBoardSprint />);
    const c = card(/Rotate API keys/);
    fireEvent.pointerDown(c, { button: 0, isPrimary: true, pointerId: 1, pointerType: 'mouse', clientX: 20, clientY: 60 });
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 22, clientY: 61 });
    expect(c).toHaveAttribute('aria-pressed', 'false');
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 320, clientY: 160 });
    expect(status()).toBe('Rotate API keys moved to position 2 of 2 in In progress.');
    expect(column(/In progress/)).toHaveAttribute('data-over');
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 320, clientY: 160 });
    fireEvent.click(within(column(/In progress/)).getByRole('button', { name: /Rotate API keys/ }));
    expect(within(column(/In progress/)).getAllByRole('button')[1]).toHaveAccessibleName(/Rotate API keys/);
    expect(status()).toBe('Rotate API keys dropped at position 2 of 2 in In progress.');
    expect(screen.queryByText(/Opened:/)).not.toBeInTheDocument();
    layout.mockRestore();
  });

  it('Escape during a pointer drag cancels it', () => {
    const layout = mockLayout();
    const onMove = vi.fn();
    const columns: KanbanColumn[] = [
      { id: 'a', title: 'A', cards: [{ id: '1', title: 'One' }] },
      { id: 'b', title: 'B', cards: [] },
    ];
    render(<KanbanBoard columns={columns} onMove={onMove} />);
    fireEvent.pointerDown(card(/One/), { button: 0, isPrimary: true, pointerId: 2, pointerType: 'mouse', clientX: 20, clientY: 60 });
    fireEvent.pointerMove(window, { pointerId: 2, clientX: 330, clientY: 60 });
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.pointerUp(window, { pointerId: 2 });
    expect(onMove).not.toHaveBeenCalled();
    expect(within(column(/A/)).getByRole('button', { name: /One/ })).toBeInTheDocument();
    layout.mockRestore();
  });

  it('mirrors ArrowLeft / ArrowRight in RTL', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    const columns: KanbanColumn[] = [
      { id: 'a', title: 'A', cards: [{ id: '1', title: 'One' }] },
      { id: 'b', title: 'B', cards: [] },
    ];
    render(
      <I18nProvider locale="ar">
        <KanbanBoard columns={columns} onMove={onMove} />
      </I18nProvider>,
    );
    card(/One/).focus();
    await user.keyboard(' {ArrowLeft} ');
    expect(onMove).toHaveBeenCalledWith({ cardId: '1', fromColumnId: 'a', fromIndex: 0, toColumnId: 'b', toIndex: 0 });
  });

  it('uses the i18n catalog and an existing LiveAnnouncer', async () => {
    const user = userEvent.setup();
    const columns: KanbanColumn[] = [{ id: 'a', title: 'Pendiente', cards: [{ id: '1', title: 'Uno' }] }];
    render(
      <I18nProvider locale="es">
        <LiveAnnouncer>
          <KanbanBoard columns={columns} onMove={() => {}} />
        </LiveAnnouncer>
      </I18nProvider>,
    );
    expect(screen.getByRole('group', { name: 'Tablero' })).toBeInTheDocument();
    expect(screen.getAllByRole('status')).toHaveLength(1);
    card(/Uno/).focus();
    await user.keyboard(' ');
    expect(status()).toBe('Has tomado Uno. Posición 1 de 1 en Pendiente.');
  });

  it('moveKanbanCard and previewSortable apply a move immutably', () => {
    const columns: KanbanColumn[] = [
      { id: 'a', title: 'A', cards: [{ id: '1', title: 'One' }, { id: '2', title: 'Two' }] },
      { id: 'b', title: 'B', cards: [{ id: '3', title: 'Three' }] },
    ];
    const next = moveKanbanCard(columns, { cardId: '1', fromColumnId: 'a', fromIndex: 0, toColumnId: 'b', toIndex: 1 });
    expect(next.map((c) => c.cards.map((x) => x.id))).toEqual([['2'], ['3', '1']]);
    expect(columns[0]?.cards).toHaveLength(2);
    const within1 = moveKanbanCard(columns, { cardId: '1', fromColumnId: 'a', fromIndex: 0, toColumnId: 'a', toIndex: 1 });
    expect(within1[0]?.cards.map((x) => x.id)).toEqual(['2', '1']);
    expect(previewSortable([{ id: 'a', items: ['1', '2'] }], { itemId: '2', over: { containerId: 'a', index: 0 } })[0]?.items).toEqual(['2', '1']);
  });

  it('examples have no axe violations', async () => {
    const { unmount } = render(<KanbanBoardSprint />);
    await expectNoAxeViolations();
    unmount();
    render(<KanbanBoardCustomCard />);
    expect(screen.getByRole('heading', { level: 4, name: /Triage/ })).toBeInTheDocument();
    await expectNoAxeViolations();
  });
});
