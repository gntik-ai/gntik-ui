import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ScrollArea } from './ScrollArea';
import ScrollAreaActivity from './examples/ScrollAreaActivity';
import ScrollAreaHorizontal from './examples/ScrollAreaHorizontal';

/** jsdom has no layout: fake an overflowing viewport (content taller / wider than the box). */
function fakeOverflow() {
  const proto = HTMLElement.prototype;
  const spies = [
    vi.spyOn(proto, 'clientHeight', 'get').mockReturnValue(100),
    vi.spyOn(proto, 'clientWidth', 'get').mockReturnValue(100),
    vi.spyOn(proto, 'scrollHeight', 'get').mockReturnValue(400),
    vi.spyOn(proto, 'scrollWidth', 'get').mockReturnValue(400),
    vi.spyOn(proto, 'offsetHeight', 'get').mockReturnValue(100),
    vi.spyOn(proto, 'offsetWidth', 'get').mockReturnValue(100),
  ];
  return () => spies.forEach((s) => s.mockRestore());
}

describe('ScrollArea', () => {
  it('labelled viewport is a named region', () => {
    render(<ScrollAreaActivity />);
    const region = screen.getByRole('region', { name: 'Recent activity' });
    expect(region).toHaveAttribute('tabindex');
    expect(region).toHaveClass('focus-visible:outline-focus-ring');
  });

  it('Tab focuses the viewport when it overflows; arrows scroll it natively', async () => {
    const restore = fakeOverflow();
    try {
      render(
        <>
          <button type="button">Before</button>
          <ScrollArea aria-label="Members" className="h-24">
            <p>Long list</p>
          </ScrollArea>
        </>,
      );
      const region = screen.getByRole('region', { name: 'Members' });
      await waitFor(() => expect(region).toHaveAttribute('tabindex', '0'));
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Before' }));
      await user.tab();
      expect(region).toHaveFocus();
      // Arrow keys reach the focused native scroll container (no handler swallows them).
      const down = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
      region.dispatchEvent(down);
      expect(down.defaultPrevented).toBe(false);
    } finally {
      restore();
    }
  });

  it('keeps a non-overflowing viewport out of the Tab order', async () => {
    render(<ScrollArea aria-label="Short">x</ScrollArea>);
    await waitFor(() => expect(screen.getByRole('region', { name: 'Short' })).toHaveAttribute('tabindex', '-1'));
  });

  it('draws the scrollbars for the chosen orientation', async () => {
    const restore = fakeOverflow();
    try {
      const { container, rerender } = render(<ScrollArea>x</ScrollArea>);
      const bars = () => Array.from(container.querySelectorAll('[data-orientation]')).filter((b) => !b.parentElement?.hasAttribute('data-orientation')).map((b) => b.getAttribute('data-orientation'));
      await waitFor(() => expect(bars()).toEqual(['vertical']));
      rerender(<ScrollArea orientation="both" bordered className="h-10">x</ScrollArea>);
      await waitFor(() => expect(bars()).toEqual(expect.arrayContaining(['vertical', 'horizontal'])));
      expect(container.firstElementChild).toHaveClass('border', 'h-10');
    } finally {
      restore();
    }
  });

  it('examples have no axe violations', async () => {
    render(<><ScrollAreaActivity /><ScrollAreaHorizontal /></>);
    await expectNoAxeViolations();
  });
});
