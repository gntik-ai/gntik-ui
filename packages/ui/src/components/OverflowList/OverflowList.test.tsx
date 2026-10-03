import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import OverflowListLabels from './examples/OverflowListLabels';
import OverflowListMembers from './examples/OverflowListMembers';
import { OverflowList } from './OverflowList';

describe('OverflowList', () => {
  it('renders up to max and a "+N more" button', () => {
    render(<OverflowListLabels />);
    const list = screen.getByRole('list', { name: 'Project labels' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    expect(within(list).getByRole('button', { name: '+4 more' })).toBeInTheDocument();
  });

  it('Enter opens the popover with the rest; Escape returns focus', async () => {
    const user = userEvent.setup();
    render(<OverflowListLabels />);
    const trigger = screen.getAllByRole('button', { name: '+4 more' })[0]!;
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    const panel = await screen.findByRole('dialog', { name: '4 more' });
    expect(within(panel).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['production', 'pci', 'on-call', 'v2-migration']);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('Space opens the avatar overflow, named "+N more"', async () => {
    const user = userEvent.setup();
    render(<OverflowListMembers />);
    const trigger = screen.getByRole('button', { name: '+3 more' });
    expect(trigger).toHaveTextContent('+3');
    await user.tab();
    await user.keyboard(' ');
    const panel = await screen.findByRole('dialog', { name: '3 more' });
    expect(within(panel).getByText('Priya Shah')).toBeInTheDocument();
  });

  it('responsive mode fits items to the available width', async () => {
    const original = window.ResizeObserver;
    const rect = HTMLElement.prototype.getBoundingClientRect;
    const width = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
    window.ResizeObserver = class {
      constructor(private cb: ResizeObserverCallback) {}
      observe() {
        this.cb([], this as unknown as ResizeObserver);
      }
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
    // Each measured item is 50px wide with a 10px gap; the trigger is 40px; the box is 200px.
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      const parent = this.parentElement;
      const i = parent ? Array.from(parent.children).indexOf(this) : 0;
      const w = this.tagName === 'SPAN' ? 40 : 50;
      return { left: i * 60, right: i * 60 + w, width: w, top: 0, bottom: 20, height: 20, x: i * 60, y: 0, toJSON: () => ({}) } as DOMRect;
    };
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 200 });
    try {
      render(<OverflowList label="Tags" responsive items={['a', 'b', 'c', 'd', 'e', 'f']} renderItem={(t) => <b>{t}</b>} />);
      // 3 items end at 170px; + 10px gap + 40px trigger = 220 > 200, so 2 fit.
      await waitFor(() => expect(screen.getByRole('button', { name: '+4 more' })).toBeInTheDocument());
    } finally {
      window.ResizeObserver = original;
      HTMLElement.prototype.getBoundingClientRect = rect;
      if (width) Object.defineProperty(HTMLElement.prototype, 'clientWidth', width);
    }
  });

  it('no trigger when everything fits', () => {
    render(<OverflowList label="Tags" max={5} items={['a', 'b']} renderItem={(t) => t} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('closed and open states have no axe violations', async () => {
    const user = userEvent.setup();
    render(
      <>
        <OverflowListLabels />
        <OverflowListMembers />
      </>,
    );
    await expectNoAxeViolations();
    await user.click(screen.getByRole('button', { name: '+3 more' }));
    await screen.findByRole('dialog');
    await expectNoAxeViolations();
  });
});
