import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import { useState } from 'react';
import { builderNodes, builderEdges, type ConsoleEntry, type FlowGraph } from '@gntik-ai/blocks';
import FlowBuilderPage from './Page';

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
});

describe('FlowBuilderPage', () => {
  it('keeps nodes and edges as initial values when uncontrolled', async () => {
    const onSave = vi.fn<(graph: FlowGraph) => void>();
    const { rerender } = render(<FlowBuilderPage nodes={builderNodes} edges={builderEdges} onSave={onSave} />);
    rerender(<FlowBuilderPage nodes={[]} edges={[]} onSave={onSave} />);
    expect(screen.getByText('5 nodes · 4 edges')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave.mock.calls[0]?.[0].nodes).toHaveLength(5);
    expect(onSave.mock.calls[0]?.[0].edges).toHaveLength(4);
  });

  it('saves the controlled graph on screen when the host ignores a reported edit', async () => {
    const graph = {
      nodes: builderNodes.map((node) => ({
        ...node,
        selected: node.id === 'validate',
        dragging: false,
        measured: { width: 208, height: 90 },
      })),
      edges: builderEdges,
    };
    const changed = vi.fn();
    const onSave = vi.fn<(graph: FlowGraph) => void>();
    render(<FlowBuilderPage graph={graph} onGraphChange={changed} onSave={onSave} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Ignored edit' } });
    expect(changed).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    const saved = onSave.mock.calls[0]![0];
    expect(saved.nodes.find((node) => node.id === 'validate')?.data.title).toBe('Validate payload');
    for (const node of saved.nodes) {
      expect(node).not.toHaveProperty('selected');
      expect(node).not.toHaveProperty('dragging');
      expect(node).not.toHaveProperty('measured');
    }
  });

  it('keeps edits made during a pending save unsaved', async () => {
    let finish = () => {};
    const onSave = () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      });
    render(<FlowBuilderPage onSave={onSave} />);
    fireEvent.click(screen.getByTestId('rf__node-validate'));
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'First' } });
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-busy', 'true');
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Second' } });
    await act(async () => finish());
    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('aria-busy', 'true');
  });

  it('marks edits unsaved, marks a resolved save saved and leaves failed saves unsaved', async () => {
    const onSave = vi
      .fn<(graph: FlowGraph) => Promise<void>>()
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error('Offline'));
    render(<FlowBuilderPage onSave={onSave} />);
    fireEvent.click(screen.getByTestId('rf__node-validate'));
    const title = screen.getByRole('textbox', { name: 'Title' });
    fireEvent.change(title, { target: { value: 'Check order' } });
    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('All changes saved')).toBeInTheDocument();
    fireEvent.change(title, { target: { value: 'Check again' } });
    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('aria-busy', 'true');
  });

  it('saves the initial sample graph before an edit', async () => {
    const onSave = vi.fn<(graph: FlowGraph) => Promise<void>>(() => Promise.resolve());
    render(<FlowBuilderPage onSave={onSave} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave.mock.calls[0]).toEqual([
      expect.objectContaining({
        nodes: expect.arrayContaining([expect.objectContaining({ id: 'validate' })]),
      }),
    ]);
    expect(onSave.mock.calls[0]?.[0].nodes).toHaveLength(5);
    expect(onSave.mock.calls[0]?.[0].edges).toHaveLength(4);
  });

  it('saves the edited title in the graph', async () => {
    const onSave = vi.fn(() => Promise.resolve());
    render(<FlowBuilderPage onSave={onSave} />);
    fireEvent.click(screen.getByTestId('rf__node-validate'));
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Check order' } });
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        nodes: expect.arrayContaining([
          expect.objectContaining({ id: 'validate', data: expect.objectContaining({ title: 'Check order' }) }),
        ]),
        edges: expect.any(Array),
      }),
    );
  });

  it('renders the editor chrome and the flow builder', { timeout: 15000 }, async () => {
    render(<FlowBuilderPage />);
    expect(screen.getByRole('main', { name: 'Order sync editor' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Order sync' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Order sync canvas' })).toBeInTheDocument();
    expect(screen.getByRole('log', { name: 'Run console' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('runs the flow and saves', { timeout: 15000 }, async () => {
    const onRun = vi.fn();
    const onSave = vi.fn(() => Promise.resolve());
    render(<FlowBuilderPage onRun={onRun} onSave={onSave} />);
    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(onRun).toHaveBeenCalledOnce();
    expect(within(screen.getByRole('log', { name: 'Run console' })).getByText(/Run #1 started/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledOnce();
    expect(await screen.findByText('All changes saved')).toBeInTheDocument();
  });

  it('passes a controlled console through to the builder', { timeout: 15000 }, async () => {
    function Host() {
      const [entries, setEntries] = useState<ConsoleEntry[]>([
        { id: 'h', time: '09:00:00', level: 'info', message: 'Connected to runner' },
      ]);
      return (
        <FlowBuilderPage
          consoleEntries={entries}
          onConsoleChange={setEntries}
          onRun={() => Promise.resolve([{ id: 'r', time: '09:00:01', level: 'success', message: 'Remote run ok' }])}
        />
      );
    }
    render(<Host />);
    const log = screen.getByRole('log', { name: 'Run console' });
    expect(log).toHaveTextContent('Connected to runner');
    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(await within(log).findByText('Remote run ok')).toBeInTheDocument();
    expect(log).toHaveTextContent('Connected to runner');
  });
});

it('passes run mode, status, validation and selection through and hides save and publish', async () => {
  const selected = vi.fn();
  render(
    <FlowBuilderPage
      mode="run"
      nodeStatus={{ webhook: 'running' }}
      onNodeSelect={selected}
      validationIssues={[{ code: 'test', nodeId: 'webhook', message: 'Input needs review' }]}
      codePanel={{
        files: [],
        problems: [
          {
            id: 'semantic',
            file: 'flow.yaml',
            line: 1,
            severity: 'error',
            message: 'Invalid document',
          },
        ],
      }}
    />,
  );
  expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Publish' })).toBeNull();
  const node = screen.getByRole('group', { name: 'Webhook' });
  expect(within(node).getByText('Running')).toBeInTheDocument();
  expect(within(node).getByText('Input needs review')).toBeInTheDocument();
  // Test node selection at the click seam; jsdom cannot supply d3's native Window for a pan gesture.
  fireEvent.click(node);
  expect(selected).toHaveBeenCalledWith('webhook');
  expect(screen.getByRole('region', { name: 'Code panel' })).toHaveTextContent('Invalid document');
  await expectNoAxeViolations();
});
