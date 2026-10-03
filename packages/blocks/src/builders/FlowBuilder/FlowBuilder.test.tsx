import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import * as blocks from '../../index';
import { FlowBuilder, type ConsoleEntry, type FlowEdge, type FlowNode } from './FlowBuilder';

// React Flow in jsdom reads the zoom from DOMMatrixReadOnly and node sizes from offset*.
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

function setWide(matches: boolean) {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({ ...original(query), matches })) as typeof window.matchMedia;
  return () => (window.matchMedia = original);
}

describe('FlowBuilder', () => {
  it('renders palette, canvas, inspector and console; resizable on wide screens', async () => {
    const restore = setWide(true);
    try {
      render(<FlowBuilder />);
      const canvas = screen.getByRole('region', { name: 'Untitled flow canvas' });
      expect(canvas.querySelectorAll('.react-flow__node')).toHaveLength(5);
      expect(screen.getAllByRole('separator')).toHaveLength(3);
      expect(screen.getByText('Select a node to edit its fields.')).toBeInTheDocument();
      expect(screen.getByRole('log', { name: 'Run console' })).toHaveTextContent('Validation passed');
      await expectNoAxeViolations();
    } finally {
      restore();
    }
  });

  it('adds a node from the palette, edits it in the inspector and runs the flow', async () => {
    const user = userEvent.setup();
    const onRun = vi.fn();
    render(<FlowBuilder onRun={onRun} />);
    expect(screen.queryAllByRole('separator')).toHaveLength(0); // stacked on small screens
    await user.click(screen.getByRole('button', { name: /Add Step/ }));
    const canvas = screen.getByRole('region', { name: 'Untitled flow canvas' });
    expect(canvas.querySelectorAll('.react-flow__node')).toHaveLength(6);
    const titleInput = screen.getByRole('textbox', { name: 'Title' });
    expect(titleInput).toHaveValue('New step');
    fireEvent.change(titleInput, { target: { value: 'Enrich record' } });
    expect(within(canvas).getByText('Enrich record')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Run' }));
    expect(onRun).toHaveBeenCalledWith(expect.objectContaining({ nodes: expect.any(Array), edges: expect.any(Array) }));
    const log = screen.getByRole('log', { name: 'Run console' });
    expect(log).toHaveTextContent('Run #1 started · 6 nodes');
    expect(log).toHaveTextContent(/Enrich record completed/);

    await user.click(screen.getByRole('button', { name: 'Delete node' }));
    expect(canvas.querySelectorAll('.react-flow__node')).toHaveLength(5);
  });

  it('appends entries returned by onRun and starts from defaultConsoleEntries', async () => {
    const user = userEvent.setup();
    const entry: ConsoleEntry = { id: 'x', time: '10:00:00', level: 'success', message: 'Deployed run' };
    render(<FlowBuilder defaultConsoleEntries={[]} onRun={() => [entry]} />);
    const log = screen.getByRole('log', { name: 'Run console' });
    expect(log).toHaveTextContent('No output yet');
    await user.click(screen.getByRole('button', { name: 'Run' }));
    expect(log).toHaveTextContent('Deployed run');
    expect(log).not.toHaveTextContent('Run #1 started');
  });

  it('awaits a promise from onRun and logs a rejection as an error', async () => {
    const user = userEvent.setup();
    let resolve: (v: ConsoleEntry[]) => void = () => {};
    const onRun = vi
      .fn()
      .mockReturnValueOnce(new Promise<ConsoleEntry[]>((r) => (resolve = r)))
      .mockImplementationOnce(() => Promise.reject(new Error('Worker offline')));
    render(<FlowBuilder defaultConsoleEntries={[]} onRun={onRun} />);
    const button = screen.getByRole('button', { name: 'Run' });
    await user.click(button);
    expect(button).toHaveAttribute('aria-busy', 'true');
    resolve([{ id: 'a', time: '10:00:00', level: 'info', message: 'Remote run queued' }]);
    const log = screen.getByRole('log', { name: 'Run console' });
    expect(await within(log).findByText('Remote run queued')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Run' }));
    expect(await within(log).findByText('Run #2 failed: Worker offline')).toBeInTheDocument();
  });

  it('supports a controlled console with onConsoleChange and onConsoleClear', async () => {
    const user = userEvent.setup();
    const onConsoleClear = vi.fn();
    const changes: ConsoleEntry[][] = [];
    function Host() {
      const [entries, setEntries] = useState<ConsoleEntry[]>([{ id: 'h', time: '09:00:00', level: 'info', message: 'From host' }]);
      return (
        <FlowBuilder
          consoleEntries={entries}
          onConsoleChange={(next) => {
            changes.push(next);
            setEntries(next);
          }}
          onConsoleClear={onConsoleClear}
        />
      );
    }
    render(<Host />);
    const log = screen.getByRole('log', { name: 'Run console' });
    expect(log).toHaveTextContent('From host');
    expect(log).not.toHaveTextContent('Validation passed');
    await user.click(screen.getByRole('button', { name: 'Run' }));
    expect(log).toHaveTextContent('From host');
    expect(log).toHaveTextContent('Run #1 started');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onConsoleClear).toHaveBeenCalledOnce();
    expect(changes.at(-1)).toEqual([]);
    expect(log).toHaveTextContent('No output yet');
  });

  it('keeps a controlled console unchanged without onConsoleChange', async () => {
    const user = userEvent.setup();
    render(<FlowBuilder consoleEntries={[{ id: 'h', time: '09:00:00', level: 'info', message: 'Pinned' }]} />);
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('log', { name: 'Run console' })).toHaveTextContent('Pinned');
  });

  it('renders its title and panel titles at the requested levels', () => {
    render(<FlowBuilder titleAs="h3" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Untitled flow' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Run console' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Nodes' })).toBeInTheDocument();
  });

  it('re-exports the graph types and sub-parts from the package entry', () => {
    const node: FlowNode = { id: 'n', type: 'step', position: { x: 0, y: 0 }, data: { title: 'Step' } };
    const edge: FlowEdge = { id: 'e', source: 'n', target: 'n' };
    expect([node.id, edge.id]).toEqual(['n', 'e']);
    expect(typeof blocks.NodePalette).toBe('function');
    expect(typeof blocks.NodeInspector).toBe('function');
    expect(typeof blocks.RunConsole).toBe('function');
  });
});
