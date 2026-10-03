import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import { ChatLayout } from './ChatLayout';
import ChatLayoutWithPanel from './examples/ChatLayoutWithPanel';

/** jsdom has no layout: fake the scroll geometry of the thread. */
function fakeGeometry(el: HTMLElement, scrollHeight: number, clientHeight: number) {
  Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => scrollHeight });
  Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => clientHeight });
}

describe('ChatLayout', () => {
  it('renders the thread region, composer and panel landmarks', () => {
    render(<ChatLayout composer={<textarea aria-label="Message" />} panel={<p>Info</p>} panelLabel="Details">
      <p>Hello</p>
    </ChatLayout>);
    expect(screen.getByRole('region', { name: 'Conversation' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Messages' })).toHaveTextContent('Hello');
    expect(screen.getByRole('complementary', { name: 'Details' })).toHaveTextContent('Info');
  });

  it('the resize handle responds to ArrowLeft/ArrowRight/Home/End', async () => {
    const onWidth = vi.fn();
    const user = userEvent.setup();
    render(<ChatLayout panel={<p>Info</p>} defaultPanelWidth={380} minPanelWidth={260} maxPanelWidth={720} onPanelWidthChange={onWidth} />);
    const handle = screen.getByRole('separator', { name: 'Resize details panel' });
    expect(handle).toHaveAttribute('aria-valuenow', '380');
    handle.focus();
    await user.keyboard('{ArrowLeft}');
    expect(handle).toHaveAttribute('aria-valuenow', '396');
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(handle).toHaveAttribute('aria-valuenow', '364');
    await user.keyboard('{Home}');
    expect(handle).toHaveAttribute('aria-valuenow', '720');
    await user.keyboard('{End}');
    expect(handle).toHaveAttribute('aria-valuenow', '260');
    expect(onWidth).toHaveBeenLastCalledWith(260);
    expect(screen.getByRole('complementary')).toHaveStyle({ width: '260px' });
  });

  it('the handle resizes by dragging', () => {
    render(<ChatLayout panel={<p>Info</p>} defaultPanelWidth={400} />);
    const handle = screen.getByRole('separator');
    fireEvent.pointerDown(handle, { clientX: 500, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 450, pointerId: 1 });
    expect(handle).toHaveAttribute('aria-valuenow', '450');
    fireEvent.pointerUp(handle, { pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 300, pointerId: 1 });
    expect(handle).toHaveAttribute('aria-valuenow', '450');
  });

  it('scrolling up unpins auto-scroll and shows the jump button; the button re-pins', async () => {
    const user = userEvent.setup();
    render(
      <ChatLayout>
        <p>One</p>
      </ChatLayout>,
    );
    const scroller = screen.getByRole('region', { name: 'Messages' });
    fakeGeometry(scroller, 1000, 400);
    expect(screen.queryByRole('button', { name: 'Scroll to latest message' })).toBeNull();
    act(() => {
      scroller.scrollTop = 600;
      fireEvent.scroll(scroller);
    });
    act(() => {
      scroller.scrollTop = 200;
      fireEvent.scroll(scroller);
    });
    const jump = screen.getByRole('button', { name: 'Scroll to latest message' });
    await user.click(jump);
    expect(screen.queryByRole('button', { name: 'Scroll to latest message' })).toBeNull();
    expect(scroller.scrollTop).toBe(1000);
  });

  it('follows new content only while pinned to the bottom', async () => {
    const { rerender } = render(
      <ChatLayout>
        <p>One</p>
      </ChatLayout>,
    );
    const scroller = screen.getByRole('region', { name: 'Messages' });
    fakeGeometry(scroller, 1000, 400);
    rerender(
      <ChatLayout>
        <p>One</p>
        <p>Two</p>
      </ChatLayout>,
    );
    await act(async () => {});
    expect(scroller.scrollTop).toBe(1000);
    act(() => {
      scroller.scrollTop = 100;
      fireEvent.scroll(scroller);
    });
    fakeGeometry(scroller, 1400, 400);
    rerender(
      <ChatLayout>
        <p>One</p>
        <p>Two</p>
        <p>Three</p>
      </ChatLayout>,
    );
    await act(async () => {});
    expect(scroller.scrollTop).toBe(100);
  });

  it('example has no axe violations', async () => {
    const { container } = render(<ChatLayoutWithPanel />);
    await expectNoAxeViolations(container);
  });
});
