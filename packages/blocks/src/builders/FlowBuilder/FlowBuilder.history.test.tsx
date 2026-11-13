import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, LiveAnnouncer, es } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../../test/a11y';
import { FlowBuilder, type FlowGraph, type FlowGraphChange } from './FlowBuilder';
import { builderEdges, builderNodes } from './fixtures';

beforeAll(() => {
  if (!('DOMMatrixReadOnly' in window)) {
    (window as unknown as { DOMMatrixReadOnly: unknown }).DOMMatrixReadOnly = class {
      m22 = 1;
    };
  }
  Object.defineProperties(HTMLElement.prototype, {
    offsetHeight: { configurable: true, get: () => 90 },
    offsetWidth: { configurable: true, get: () => 208 },
  });
  document.documentElement.style.setProperty('--primary', '145 61% 50%');
});

const undoButton = () => screen.getByRole('button', { name: 'Undo' });
const redoButton = () => screen.getByRole('button', { name: 'Redo' });
const canvas = () => screen.getByRole('region', { name: 'Untitled flow canvas' });
const mod = { ctrlKey: true } as const;

async function deleteRoute() {
  fireEvent.click(screen.getByTestId('rf__node-route'));
  screen.getByTestId('rf__node-route').focus();
  await userEvent.keyboard('{Backspace}');
}

describe('FlowBuilder undo and redo', () => {
  it('undoes a Backspace delete with Mod+Z on the canvas and redoes it with Shift+Mod+Z or Ctrl+Y', async () => {
    render(<FlowBuilder />);
    await deleteRoute();
    expect(screen.getByText('4 nodes · 1 edges')).toBeInTheDocument();
    // The deleted node held focus: it moves to the canvas region instead of the page body.
    expect(canvas()).toHaveFocus();
    await userEvent.keyboard('{Control>}z{/Control}');
    expect(screen.getByText('5 nodes · 4 edges')).toBeInTheDocument();
    expect(screen.getByTestId('rf__node-route')).toBeInTheDocument();
    await userEvent.keyboard('{Control>}{Shift>}z{/Shift}{/Control}');
    expect(screen.getByText('4 nodes · 1 edges')).toBeInTheDocument();
    await userEvent.keyboard('{Control>}z{/Control}');
    await userEvent.keyboard('{Control>}y{/Control}');
    expect(screen.getByText('4 nodes · 1 edges')).toBeInTheDocument();
  });

  it('accepts the Meta key and prevents the events it handles', async () => {
    render(<FlowBuilder />);
    await deleteRoute();
    expect(fireEvent.keyDown(canvas(), { key: 'z', metaKey: true })).toBe(false);
    expect(screen.getByText('5 nodes · 4 edges')).toBeInTheDocument();
    expect(fireEvent.keyDown(canvas(), { key: 'z', metaKey: true, shiftKey: true })).toBe(false);
    expect(screen.getByText('4 nodes · 1 edges')).toBeInTheDocument();
  });

  it('leaves Mod+Z inside text fields to their native undo', async () => {
    render(<FlowBuilder />);
    fireEvent.click(screen.getByTestId('rf__node-validate'));
    const title = screen.getByRole('textbox', { name: 'Title' });
    fireEvent.change(title, { target: { value: 'Check order' } });
    expect(undoButton()).toHaveAttribute('aria-disabled', 'false');
    expect(fireEvent.keyDown(title, { key: 'z', ...mod })).toBe(true);
    expect(title).toHaveValue('Check order');
    expect(undoButton()).toHaveAttribute('aria-disabled', 'false');
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    canvas().append(editable);
    expect(fireEvent.keyDown(editable, { key: 'z', ...mod })).toBe(true);
    expect(title).toHaveValue('Check order');
  });

  it.each(['', 'plaintext-only'])('leaves Mod+Z inside contenteditable="%s" to native undo', async (value) => {
    render(<FlowBuilder />);
    await deleteRoute();
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', value);
    canvas().append(editable);
    expect(fireEvent.keyDown(editable, { key: 'z', ...mod })).toBe(true);
    expect(screen.getByText('4 nodes · 1 edges')).toBeInTheDocument();
  });

  it('undoes consecutive title edits in one step', async () => {
    render(<FlowBuilder />);
    fireEvent.click(screen.getByTestId('rf__node-validate'));
    const title = screen.getByRole('textbox', { name: 'Title' });
    for (const value of ['Check', 'Check o', 'Check order']) fireEvent.change(title, { target: { value } });
    fireEvent.keyDown(canvas(), { key: 'z', ...mod });
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Validate payload');
    expect(undoButton()).toHaveAttribute('aria-disabled', 'true');
  });

  it('starts a new step after the inspector field loses focus', async () => {
    render(<FlowBuilder />);
    fireEvent.click(screen.getByTestId('rf__node-validate'));
    const title = screen.getByRole('textbox', { name: 'Title' });
    title.focus();
    fireEvent.change(title, { target: { value: 'Check' } });
    title.blur();
    title.focus();
    fireEvent.change(title, { target: { value: 'Check order' } });
    fireEvent.keyDown(canvas(), { key: 'z', ...mod });
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Check');
  });

  it('renders Undo and Redo as focusable aria-disabled buttons until there is something to undo', async () => {
    render(<FlowBuilder />);
    for (const button of [undoButton(), redoButton()]) {
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).not.toBeDisabled();
    }
    expect(undoButton()).toHaveAttribute('aria-keyshortcuts', 'Meta+Z Control+Z');
    expect(redoButton()).toHaveAttribute('aria-keyshortcuts', 'Shift+Meta+Z Shift+Control+Z Control+Y');
    expect(screen.getByRole('button', { name: 'Run' }).compareDocumentPosition(undoButton())).toBe(
      Node.DOCUMENT_POSITION_PRECEDING,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add Step' }));
    expect(undoButton()).toHaveAttribute('aria-disabled', 'false');
    expect(redoButton()).toHaveAttribute('aria-disabled', 'true');
  });

  it('undoes an added node from the button, keeps focus on it and enables Redo', async () => {
    render(<FlowBuilder />);
    await userEvent.click(screen.getByRole('button', { name: 'Add Step' }));
    expect(screen.getByText('6 nodes · 4 edges')).toBeInTheDocument();
    await userEvent.click(undoButton());
    expect(screen.getByText('5 nodes · 4 edges')).toBeInTheDocument();
    expect(undoButton()).toHaveAttribute('aria-disabled', 'true');
    expect(undoButton()).toHaveFocus();
    expect(redoButton()).toHaveAttribute('aria-disabled', 'false');
    await userEvent.click(redoButton());
    expect(screen.getByText('6 nodes · 4 edges')).toBeInTheDocument();
  });

  it('records no step for selection', async () => {
    render(<FlowBuilder />);
    fireEvent.click(screen.getByTestId('rf__node-validate'));
    fireEvent.click(screen.getByTestId('rf__node-route'));
    expect(undoButton()).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows no buttons and ignores the shortcuts in run mode and with history off', async () => {
    const { rerender } = render(<FlowBuilder mode="run" />);
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
    expect(fireEvent.keyDown(canvas(), { key: 'z', ...mod })).toBe(true);
    rerender(<FlowBuilder history={false} />);
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Redo' })).toBeNull();
    await deleteRoute();
    expect(fireEvent.keyDown(canvas(), { key: 'z', ...mod })).toBe(true);
    expect(screen.getByText('4 nodes · 1 edges')).toBeInTheDocument();
  });

  it('renders no live region of its own when history is off', () => {
    const { container } = render(<FlowBuilder history={false} />);
    expect(container.querySelector('[data-live-announcer]')).toBeNull();
    expect(container.firstElementChild?.tagName).toBe('SECTION');
  });

  it('undoes an ended drag back to its start position', async () => {
    const changed = vi.fn<(graph: FlowGraph, change: FlowGraphChange) => void>();
    render(<FlowBuilder onGraphChange={changed} />);
    const mouse = (target: HTMLElement | Window, type: string, x: number, buttons = 1) => {
      const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: 20,
        button: 0,
        buttons,
      });
      Object.defineProperty(event, 'view', { value: window });
      fireEvent(target, event);
    };
    mouse(screen.getByTestId('rf__node-notify'), 'mousedown', 20);
    mouse(window, 'mousemove', 32);
    mouse(window, 'mousemove', 64);
    mouse(window, 'mousemove', 96);
    expect(undoButton()).toHaveAttribute('aria-disabled', 'true');
    mouse(window, 'mouseup', 96, 0);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(undoButton()).toHaveAttribute('aria-disabled', 'false');
    await userEvent.click(undoButton());
    const [graph, change] = changed.mock.calls.at(-1)!;
    expect(change).toEqual({ type: 'undo', nodeIds: ['notify'], edgeIds: [] });
    expect(graph.nodes.find((node) => node.id === 'notify')?.position).toEqual({ x: 768, y: 16 });
    expect(undoButton()).toHaveAttribute('aria-disabled', 'true');
  });

  it('announces what was undone and redone politely', async () => {
    render(<FlowBuilder />);
    await deleteRoute();
    await userEvent.keyboard('{Control>}z{/Control}');
    expect(screen.getByRole('status')).toHaveTextContent('Undid delete node');
    await userEvent.keyboard('{Control>}y{/Control}');
    expect(screen.getByRole('status')).toHaveTextContent('Redid delete node');
  });

  it('announces in Spanish with the es catalog and reuses a LiveAnnouncer above it', async () => {
    render(
      <I18nProvider locale="es">
        <LiveAnnouncer>
          <FlowBuilder />
        </LiveAnnouncer>
      </I18nProvider>,
    );
    expect(screen.getAllByRole('status')).toHaveLength(1);
    await deleteRoute();
    await userEvent.keyboard('{Control>}z{/Control}');
    expect(screen.getByRole('status')).toHaveTextContent('Se deshizo: eliminar nodo');
    expect(undoButton).toThrow();
    expect(screen.getByRole('button', { name: es['flow.undo'] })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rehacer' })).toBeInTheDocument();
  });

  it('has no axe violations with the history buttons', async () => {
    render(<FlowBuilder />);
    await userEvent.click(screen.getByRole('button', { name: 'Add Step' }));
    await expectNoAxeViolations();
  });
});

describe('FlowBuilder undo and redo with a controlled graph', () => {
  function Host({
    onChange,
    initial,
  }: {
    onChange: (graph: FlowGraph, change: FlowGraphChange) => void;
    initial: FlowGraph;
  }) {
    const [graph, setGraph] = useState(initial);
    return (
      <>
        <FlowBuilder
          graph={graph}
          onGraphChange={(next, change) => {
            onChange(next, change);
            setGraph(next);
          }}
        />
        <button type="button" onClick={() => setGraph({ nodes: builderNodes.slice(0, 2), edges: [] })}>
          Load graph
        </button>
      </>
    );
  }

  it('reports the previous graph with change.type undo and the next with redo', async () => {
    const changed = vi.fn<(graph: FlowGraph, change: FlowGraphChange) => void>();
    render(<Host onChange={changed} initial={{ nodes: builderNodes, edges: builderEdges }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add Step' }));
    expect(screen.getByText('6 nodes · 4 edges')).toBeInTheDocument();
    await userEvent.click(undoButton());
    const [graph, change] = changed.mock.calls.at(-1)!;
    expect(change).toEqual({ type: 'undo', nodeIds: ['step-1'], edgeIds: [] });
    expect(graph.nodes).toHaveLength(5);
    expect(screen.getByText('5 nodes · 4 edges')).toBeInTheDocument();
    await userEvent.click(redoButton());
    expect(changed.mock.calls.at(-1)?.[1].type).toBe('redo');
    expect(screen.getByText('6 nodes · 4 edges')).toBeInTheDocument();
  });

  it('resets the history when the host passes an unrelated graph', async () => {
    render(<Host onChange={() => {}} initial={{ nodes: builderNodes, edges: builderEdges }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add Step' }));
    expect(undoButton()).toHaveAttribute('aria-disabled', 'false');
    await userEvent.click(screen.getByRole('button', { name: 'Load graph' }));
    expect(screen.getByText('2 nodes · 0 edges')).toBeInTheDocument();
    expect(undoButton()).toHaveAttribute('aria-disabled', 'true');
  });

  it('keeps its history when the host declines an edit', async () => {
    const graph = { nodes: builderNodes, edges: builderEdges };
    const { rerender } = render(<FlowBuilder graph={graph} onGraphChange={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add Step' }));
    rerender(<FlowBuilder graph={graph} onGraphChange={() => {}} title="Renamed" />);
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveAttribute('aria-disabled', 'false');
  });

  it('keeps the uncontrolled graph when history is switched off and on again', async () => {
    const { rerender } = render(<FlowBuilder />);
    await userEvent.click(screen.getByRole('button', { name: 'Add Step' }));
    expect(screen.getByText('6 nodes · 4 edges')).toBeInTheDocument();
    rerender(<FlowBuilder history={false} />);
    expect(screen.getByText('6 nodes · 4 edges')).toBeInTheDocument();
    rerender(<FlowBuilder />);
    expect(screen.getByText('6 nodes · 4 edges')).toBeInTheDocument();
  });

  it('renders the Run button directly in the header, without a wrapper, when history is off', () => {
    render(<FlowBuilder history={false} />);
    const header = screen.getByRole('banner');
    expect(within(header).getByRole('button', { name: 'Run' }).parentElement).toBe(header);
    expect(document.querySelector('[data-live-announcer]')).toBeNull();
  });
});
