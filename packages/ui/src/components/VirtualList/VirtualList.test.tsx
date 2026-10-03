import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import { computeOffsets, rowAt } from './use-virtual-window';
import { VirtualList, type VirtualListHandle } from './VirtualList';
import VirtualListLogs from './examples/VirtualListLogs';
import VirtualListMembers from './examples/VirtualListMembers';

const items = Array.from({ length: 1000 }, (_, i) => `Row ${i}`);

function setup(props: Partial<Parameters<typeof VirtualList<string>>[0]> = {}) {
  const user = userEvent.setup();
  const ref = createRef<VirtualListHandle>();
  const onActivate = vi.fn();
  const onSelectedKeyChange = vi.fn();
  render(
    <VirtualList
      ref={ref}
      aria-label="Rows"
      items={items}
      itemHeight={20}
      height={200}
      overscan={2}
      onActivate={onActivate}
      onSelectedKeyChange={onSelectedKeyChange}
      renderItem={(t) => t}
      {...props}
    />,
  );
  return { user, ref, onActivate, onSelectedKeyChange };
}

describe('VirtualList', () => {
  it('computes offsets and finds rows', () => {
    const o = computeOffsets(3, (i) => (i + 1) * 10);
    expect(o).toEqual([0, 10, 30, 60]);
    expect(rowAt(o, 0)).toBe(0);
    expect(rowAt(o, 29)).toBe(1);
    expect(rowAt(o, 30)).toBe(2);
  });

  it('renders only the window plus overscan, with set size and position', () => {
    setup();
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(12);
    expect(rows[0]).toHaveAttribute('aria-setsize', '1000');
    expect(rows[3]).toHaveAttribute('aria-posinset', '4');
    expect(screen.getByRole('list', { name: 'Rows' })).toHaveStyle({ height: '20000px' });
  });

  it('Tab reaches one row; arrows, Home and End move the roving tab stop', async () => {
    const { user } = setup();
    await user.tab();
    expect(screen.getByText('Row 0')).toHaveFocus();
    expect(screen.getAllByRole('listitem').filter((r) => r.tabIndex === 0)).toHaveLength(1);
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByText('Row 2')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByText('Row 1')).toHaveFocus();
    await user.keyboard('{End}');
    await waitFor(() => expect(screen.getByText('Row 999')).toHaveFocus());
    expect(screen.queryByText('Row 0')).not.toBeInTheDocument();
    await user.keyboard('{Home}');
    await waitFor(() => expect(screen.getByText('Row 0')).toHaveFocus());
  });

  it('PageDown / PageUp move by a viewport', async () => {
    const { user } = setup();
    await user.tab();
    await user.keyboard('{PageDown}');
    expect(screen.getByText('Row 9')).toHaveFocus();
    await user.keyboard('{PageUp}');
    expect(screen.getByText('Row 0')).toHaveFocus();
  });

  it('Enter activates a row in list mode', async () => {
    const { user, onActivate } = setup();
    await user.tab();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onActivate).toHaveBeenCalledWith('Row 1', 1);
  });

  it('listbox mode: Space and Enter select the option', async () => {
    const { user, onSelectedKeyChange } = setup({ role: 'listbox' });
    await user.tab();
    await user.keyboard('{ArrowDown} ');
    expect(onSelectedKeyChange).toHaveBeenLastCalledWith(1, 'Row 1', 1);
    expect(screen.getByRole('option', { name: 'Row 1' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(screen.getByRole('option', { name: 'Row 2' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Row 1' })).toHaveAttribute('aria-selected', 'false');
  });

  it('scrollToIndex mounts the target window and can focus it', () => {
    const { ref } = setup();
    act(() => ref.current?.scrollToIndex(500, { align: 'start', focus: true }));
    expect(screen.getByText('Row 500')).toHaveFocus();
    expect(screen.queryByText('Row 20')).not.toBeInTheDocument();
  });

  it('shows the empty text', () => {
    render(<VirtualList aria-label="Rows" items={[]} renderItem={() => null} emptyText="Nothing yet." />);
    expect(screen.getByRole('status')).toHaveTextContent('Nothing yet.');
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <VirtualListLogs />
        <VirtualListMembers />
      </>,
    );
    await expectNoAxeViolations();
  });
});
