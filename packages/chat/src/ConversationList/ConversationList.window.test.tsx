import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConversationList } from './ConversationList';

const now = new Date(2026, 2, 10, 12);
const items = Array.from({ length: 1000 }, (_, i) => ({
  id: `c${i}`,
  title: `Discussion ${i}`,
  preview: i % 2 ? 'Recent message' : undefined,
  updatedAt: now,
}));
afterEach(() => vi.restoreAllMocks());

describe('ConversationList windowing', () => {
  it('mounts fewer than 60 rows, retains the tab stop after scrolling, and continues arrow navigation from it', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600);
    const user = userEvent.setup();
    render(<ConversationList items={items} now={now} virtualizeAt={100} groupBy={false} defaultActiveId="c5" />);
    const nav = screen.getByRole('navigation');
    const rows = () =>
      within(nav)
        .getAllByRole('button')
        .filter((el) => !el.hasAttribute('aria-haspopup'));
    expect(rows().length).toBeLessThan(60);
    await user.tab();
    const focused = screen.getByRole('button', { name: /^Discussion 5 / });
    expect(focused).toHaveFocus();
    act(() => {
      nav.scrollTop = 25_000;
      fireEvent.scroll(nav);
    });
    expect(focused).toBeInTheDocument();
    expect(focused).toHaveFocus();
    expect(rows().length).toBeLessThan(60);
    expect(screen.queryByRole('button', { name: /^Discussion 0 / })).toBeNull();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: /^Discussion 6 / })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: /^Discussion 999 / })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: /^Discussion 0 / })).toHaveFocus();
    expect(rows().length).toBeLessThan(60);
  });

  it('keeps identical roles and heading navigation when switching windowing off', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600);
    const user = userEvent.setup();
    const { rerender } = render(<ConversationList items={items.slice(0, 110)} now={now} virtualizeAt={100} />);
    await user.tab();
    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'Today' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('button', { name: /^Discussion 0 / })).toBeNull();
    await user.keyboard(' {ArrowDown}');
    expect(screen.getByRole('button', { name: /^Discussion 0 / })).toHaveFocus();
    rerender(<ConversationList items={items.slice(0, 110)} now={now} virtualizeAt={Infinity} />);
    expect(screen.getByRole('button', { name: /^Discussion 0 / })).toHaveFocus();
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getAllByRole('button').filter((el) => !el.hasAttribute('aria-haspopup'))).toHaveLength(111);
  });
});

it('updates the measured row geometry when ResizeObserver reports a height change', () => {
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600);
  let rowHeight = 80;
  const observers = new Set<ResizeObserverCallback>();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private callback: ResizeObserverCallback) {
        observers.add(callback);
      }
      observe() {}
      unobserve() {}
      disconnect() {
        observers.delete(this.callback);
      }
    },
  );
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 300,
    bottom: rowHeight,
    width: 300,
    height: rowHeight,
    toJSON: () => ({}),
  }));
  const { unmount } = render(<ConversationList items={items} now={now} groupBy={false} />);
  const row = screen.getByRole('button', { name: /^Discussion 1 / });
  // The second row starts after the measured first row, not its estimated fallback height.
  expect(row.parentElement?.parentElement).toHaveStyle({ transform: 'translateY(80px)' });
  act(() => {
    rowHeight = 120;
    for (const callback of [...observers]) callback([], {} as ResizeObserver);
  });
  expect(row.parentElement?.parentElement).toHaveStyle({ transform: 'translateY(120px)' });
  unmount();
  expect(observers.size).toBe(0);
  vi.unstubAllGlobals();
});
