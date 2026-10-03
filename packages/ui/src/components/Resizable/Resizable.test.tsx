import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ResizablePanel, ResizablePanelGroup, ResizeHandle } from './Resizable';
import ResizableWorkspace from './examples/ResizableWorkspace';
import ResizableSplit from './examples/ResizableSplit';

function Split({ direction, onLayout, autoSaveId }: { direction?: 'horizontal' | 'vertical'; onLayout?: (s: number[]) => void; autoSaveId?: string }) {
  return (
    <ResizablePanelGroup direction={direction} onLayout={onLayout} autoSaveId={autoSaveId}>
      <ResizablePanel id="left" defaultSize={30} minSize={20} maxSize={60} collapsible>Left</ResizablePanel>
      <ResizeHandle />
      <ResizablePanel id="right" minSize={30}>Right</ResizablePanel>
    </ResizablePanelGroup>
  );
}

const handle = () => screen.getByRole('separator', { name: 'Resize' });
const panel = (id: string) => document.getElementById(id) as HTMLElement;

describe('Resizable', () => {
  it('exposes a focusable separator with value, range, orientation and controls', () => {
    render(<Split />);
    const h = handle();
    expect(h).toHaveAttribute('tabindex', '0');
    expect(h).toHaveAttribute('aria-orientation', 'vertical');
    expect(h).toHaveAttribute('aria-controls', 'left');
    expect(h).toHaveAttribute('aria-valuenow', '30');
    expect(h).toHaveAttribute('aria-valuemin', '0');
    expect(h).toHaveAttribute('aria-valuemax', '60');
    expect(panel('left').style.flexGrow).toBe('30');
    expect(panel('right').style.flexGrow).toBe('70');
  });

  it('ArrowRight / ArrowLeft resize by step and respect min / max', async () => {
    const user = userEvent.setup();
    const onLayout = vi.fn();
    render(<Split onLayout={onLayout} />);
    await user.tab();
    expect(handle()).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(handle()).toHaveAttribute('aria-valuenow', '35');
    expect(onLayout).toHaveBeenLastCalledWith([35, 65]);
    await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    expect(handle()).toHaveAttribute('aria-valuenow', '20');
    await user.keyboard('{ArrowUp}');
    expect(handle()).toHaveAttribute('aria-valuenow', '20');
  });

  it('ArrowUp / ArrowDown resize a vertical group', async () => {
    const user = userEvent.setup();
    render(<Split direction="vertical" />);
    expect(handle()).toHaveAttribute('aria-orientation', 'horizontal');
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(handle()).toHaveAttribute('aria-valuenow', '35');
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(handle()).toHaveAttribute('aria-valuenow', '25');
  });

  it('Home / End jump to the min / max size', async () => {
    const user = userEvent.setup();
    render(<Split />);
    await user.tab();
    await user.keyboard('{End}');
    expect(handle()).toHaveAttribute('aria-valuenow', '60');
    await user.keyboard('{Home}');
    expect(handle()).toHaveAttribute('aria-valuenow', '20');
  });

  it('Enter collapses the collapsible panel and restores its previous size', async () => {
    const user = userEvent.setup();
    render(<Split />);
    await user.tab();
    await user.keyboard('{ArrowRight}{Enter}');
    expect(handle()).toHaveAttribute('aria-valuenow', '0');
    expect(panel('left')).toHaveAttribute('data-collapsed');
    expect(panel('left')).toHaveAttribute('inert');
    await user.keyboard('{Enter}');
    expect(handle()).toHaveAttribute('aria-valuenow', '35');
    expect(panel('left')).not.toHaveAttribute('data-collapsed');
  });

  it('pointer drag resizes from the measured panel sizes and persists on release', () => {
    const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 500, height: 200 } as DOMRect);
    try {
      render(<Split autoSaveId="test-split" />);
      const h = handle();
      fireEvent.pointerDown(h, { button: 0, clientX: 300, pointerId: 1 });
      expect(h).toHaveAttribute('data-dragging');
      expect(h).toHaveFocus();
      // Two panels measure 500px each → 1000px; +100px = +10%.
      fireEvent.pointerMove(h, { clientX: 400, pointerId: 1 });
      expect(h).toHaveAttribute('aria-valuenow', '40');
      expect(localStorage.getItem('gntik-ui:resizable:test-split')).toBeNull();
      // Dragging far left snaps the collapsible panel shut.
      fireEvent.pointerMove(h, { clientX: 100, pointerId: 1 });
      expect(h).toHaveAttribute('aria-valuenow', '0');
      fireEvent.pointerUp(h, { pointerId: 1 });
      expect(h).not.toHaveAttribute('data-dragging');
      expect(JSON.parse(localStorage.getItem('gntik-ui:resizable:test-split') ?? 'null')).toEqual([0, 100]);
    } finally {
      rect.mockRestore();
    }
  });

  it('restores sizes from localStorage and ignores malformed data', () => {
    localStorage.setItem('gntik-ui:resizable:saved', JSON.stringify([45, 55]));
    const { unmount } = render(<Split autoSaveId="saved" />);
    expect(handle()).toHaveAttribute('aria-valuenow', '45');
    unmount();
    localStorage.setItem('gntik-ui:resizable:saved', '{nope');
    render(<Split autoSaveId="saved" />);
    expect(handle()).toHaveAttribute('aria-valuenow', '30');
  });

  it('keeps working when localStorage throws', async () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied'); });
    try {
      const user = userEvent.setup();
      render(<Split autoSaveId="blocked" />);
      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(handle()).toHaveAttribute('aria-valuenow', '35');
    } finally {
      get.mockRestore();
      set.mockRestore();
    }
  });

  it('a disabled handle is not focusable and ignores keys', () => {
    render(
      <ResizablePanelGroup>
        <ResizablePanel>A</ResizablePanel>
        <ResizeHandle disabled />
        <ResizablePanel>B</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(handle()).not.toHaveAttribute('tabindex');
    expect(handle()).toHaveAttribute('aria-valuenow', '50');
    fireEvent.keyDown(handle(), { key: 'ArrowRight' });
    expect(handle()).toHaveAttribute('aria-valuenow', '50');
  });

  it('examples have no axe violations', async () => {
    render(<><ResizableWorkspace /><ResizableSplit /></>);
    expect(screen.getAllByRole('separator')).toHaveLength(3);
    await expectNoAxeViolations();
  });
});
