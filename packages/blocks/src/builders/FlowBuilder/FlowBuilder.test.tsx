import { Profiler, useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlowStatusBadge } from '@gntik-ai/flow';
import { expectNoAxeViolations } from '../../test/a11y';
import * as blocks from '../../index';
import { FlowBuilder, type ConsoleEntry, type FlowEdge, type FlowNode, type FlowGraph } from './FlowBuilder';
import { builderNodes, builderEdges } from './fixtures';

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
  it('keeps controlled positions fixed until the host applies a move', async () => {
    const changed = vi.fn<(graph: FlowGraph) => void>();
    const onRun = vi.fn<(graph: FlowGraph) => void>();
    const graph = { nodes: builderNodes, edges: builderEdges };
    const { rerender } = render(<FlowBuilder graph={graph} onGraphChange={changed} onRun={onRun} />);
    fireEvent.click(screen.getByTestId('rf__node-validate'));
    screen.getByTestId('rf__node-validate').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(changed).toHaveBeenCalledOnce();
    expect(changed.mock.calls[0]?.[0].nodes.find((node) => node.id === 'validate')?.position).toEqual({
      x: 272,
      y: 96,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(onRun.mock.calls[0]?.[0].nodes.find((node) => node.id === 'validate')?.position).toEqual({ x: 256, y: 96 });
    rerender(<FlowBuilder graph={changed.mock.calls[0]![0]} onGraphChange={changed} onRun={onRun} />);
    expect(screen.getByTestId('rf__node-validate')).toHaveClass('selected');
    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(onRun.mock.calls[1]?.[0].nodes.find((node) => node.id === 'validate')?.position).toEqual({ x: 272, y: 96 });
  });

  it('reports an edge-only Backspace deletion once', async () => {
    const changed = vi.fn();
    render(
      <FlowBuilder
        edges={builderEdges.map((edge) => ({ ...edge, selected: edge.id === 'e-webhook-validate' }))}
        onGraphChange={changed}
      />,
    );
    screen.getByTestId('rf__node-webhook').focus();
    expect(changed).not.toHaveBeenCalled();
    await userEvent.keyboard('{Backspace}');
    expect(changed).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ nodes: expect.any(Array), edges: expect.any(Array) }),
      { type: 'delete', nodeIds: [], edgeIds: ['e-webhook-validate'] },
    );
    expect(changed.mock.calls[0]?.[0].nodes).toHaveLength(5);
    expect(changed.mock.calls[0]?.[0].edges).toHaveLength(3);
  });

  it('reports a drag only on drop', async () => {
    const changed = vi.fn();
    render(<FlowBuilder onGraphChange={changed} />);
    const node = screen.getByTestId('rf__node-notify');
    // jsdom rejects Vitest's Window proxy in the constructor; d3 needs the event view.
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
    mouse(node, 'mousedown', 20);
    mouse(window, 'mousemove', 32);
    mouse(window, 'mousemove', 64);
    mouse(window, 'mousemove', 96);
    expect(changed).not.toHaveBeenCalled();
    mouse(window, 'mouseup', 96, 0);
    // d3 suppresses the next click until a zero-delay task removes its window listener.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(changed).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ nodes: expect.any(Array) }), {
      type: 'move',
      nodeIds: ['notify'],
      edgeIds: [],
    });
    expect(changed.mock.calls[0]?.[0].nodes.find((n: FlowNode) => n.id === 'notify').position).toEqual({
      x: 832,
      y: 16,
    });
  });

  it('reports each inspector value change without transient node fields', () => {
    const changed = vi.fn();
    render(
      <FlowBuilder
        nodes={builderNodes.map((node) => ({ ...node, measured: { width: 208, height: 90 }, dragging: false }))}
        onGraphChange={changed}
      />,
    );
    fireEvent.click(screen.getByTestId('rf__node-validate'));
    const title = screen.getByRole('textbox', { name: 'Title' });
    fireEvent.change(title, { target: { value: 'Check' } });
    fireEvent.change(title, { target: { value: 'Check order' } });
    expect(changed).toHaveBeenCalledTimes(2);
    expect(changed.mock.calls.map((call) => call[1])).toEqual([
      { type: 'update', nodeIds: ['validate'], edgeIds: [] },
      { type: 'update', nodeIds: ['validate'], edgeIds: [] },
    ]);
    const graph = changed.mock.calls[1]?.[0];
    expect(graph.nodes.find((n: FlowNode) => n.id === 'validate').data.title).toBe('Check order');
    for (const node of graph.nodes) {
      expect(node).not.toHaveProperty('selected');
      expect(node).not.toHaveProperty('dragging');
      expect(node).not.toHaveProperty('measured');
    }
  });

  it('ignores selection and reports each arrow-key move step', async () => {
    const changed = vi.fn();
    render(<FlowBuilder onGraphChange={changed} />);
    fireEvent.click(screen.getByTestId('rf__node-validate'));
    expect(changed).not.toHaveBeenCalled();
    screen.getByTestId('rf__node-validate').focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(changed).toHaveBeenCalledTimes(2);
    expect(changed.mock.calls.map((call) => call[1])).toEqual([
      { type: 'move', nodeIds: ['validate'], edgeIds: [] },
      { type: 'move', nodeIds: ['validate'], edgeIds: [] },
    ]);
    expect(changed.mock.calls[1]?.[0].nodes.find((n: FlowNode) => n.id === 'validate').position).toEqual({
      x: 288,
      y: 96,
    });
  });

  it.each(['keyboard', 'inspector'])('reports a node and its connected edges in one delete via %s', async (method) => {
    const changed = vi.fn();
    render(<FlowBuilder onGraphChange={changed} />);
    fireEvent.click(screen.getByTestId('rf__node-route'));
    if (method === 'keyboard') {
      screen.getByTestId('rf__node-route').focus();
      await userEvent.keyboard('{Backspace}');
    } else await userEvent.click(screen.getByRole('button', { name: 'Delete node' }));
    expect(changed).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ nodes: expect.any(Array), edges: expect.any(Array) }),
      {
        type: 'delete',
        nodeIds: ['route'],
        edgeIds: ['e-validate-route', 'e-route-notify', 'e-route-store'],
      },
    );
    expect(changed.mock.calls[0]?.[0].nodes).toHaveLength(4);
    expect(changed.mock.calls[0]?.[0].edges).toHaveLength(1);
  });

  it('leaves controlled edits to the host and retains the new selection when applied', async () => {
    const graph = { nodes: builderNodes, edges: builderEdges };
    const changed = vi.fn<(graph: FlowGraph) => void>();
    const { rerender } = render(<FlowBuilder graph={graph} onGraphChange={changed} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add Step' }));
    expect(changed).toHaveBeenCalledOnce();
    expect(changed.mock.calls[0]?.[0].nodes).toHaveLength(6);
    expect(screen.getByText('5 nodes · 4 edges')).toBeInTheDocument();
    expect(screen.queryByTestId('rf__node-step-1')).toBeNull();
    rerender(<FlowBuilder graph={changed.mock.calls[0]![0]} onGraphChange={changed} />);
    expect(screen.getByText('6 nodes · 4 edges')).toBeInTheDocument();
    expect(screen.getByTestId('rf__node-step-1')).toHaveClass('selected');
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('New step');
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Parent must apply' } });
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('New step');
  });

  it('skips palette ids that are already present in a reloaded graph', async () => {
    const changed = vi.fn();
    render(
      <FlowBuilder
        nodes={[
          ...builderNodes,
          { id: 'step-1', type: 'step', position: { x: 1024, y: 0 }, data: { title: 'Existing' } },
        ]}
        onGraphChange={changed}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add Step' }));
    expect(changed.mock.calls[0]?.[1]).toEqual({ type: 'add', nodeIds: ['step-2'], edgeIds: [] });
    expect(screen.getByTestId('rf__node-step-2')).toBeInTheDocument();
  });

  it('reports a palette add once with a persistent graph and keeps onRun canvas state', async () => {
    const changed = vi.fn();
    const onRun = vi.fn();
    render(<FlowBuilder onGraphChange={changed} onRun={onRun} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add Step' }));
    expect(changed).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        nodes: expect.any(Array),
        edges: expect.any(Array),
      }),
      { type: 'add', nodeIds: ['step-1'], edgeIds: [] },
    );
    const graph = changed.mock.calls[0]?.[0];
    expect(graph.nodes).toHaveLength(6);
    expect(graph.edges).toHaveLength(4);
    for (const node of graph.nodes) {
      expect(node).not.toHaveProperty('selected');
      expect(node).not.toHaveProperty('dragging');
      expect(node).not.toHaveProperty('measured');
    }
    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(onRun.mock.calls[0]?.[0].nodes.find((n: FlowNode) => n.id === 'step-1')).toHaveProperty('selected', true);
  });

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
    // Existing consumers can keep callbacks typed with the default built-in FlowNode.
    const onRun = vi.fn<(graph: { nodes: FlowNode[]; edges: FlowEdge[] }) => void>();
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
    expect(onRun).toHaveBeenCalledWith(
      expect.objectContaining({
        nodes: expect.any(Array),
        edges: expect.any(Array),
      }),
    );
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
      const [entries, setEntries] = useState<ConsoleEntry[]>([
        { id: 'h', time: '09:00:00', level: 'info', message: 'From host' },
      ]);
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

function connectHandles(sourceId: string, handleId: string, targetId: string) {
  const source = document.querySelector(`[data-nodeid="${sourceId}"][data-handleid="${handleId}"]`);
  const target = document.querySelector(`[data-nodeid="${targetId}"].target`);
  if (!source || !target) throw new Error('Named connection handles missing');
  // jsdom has no hit testing: the browser boundary returns the handle under the pointer.
  Object.defineProperty(document, 'elementFromPoint', {
    configurable: true,
    value: () => target,
  });
  fireEvent.click(source);
  fireEvent.click(target);
}

it.each([false, true])('reports an accepted connection once (mapped: %s)', (mapped) => {
  const changed = vi.fn();
  render(
    <FlowBuilder
      nodes={[
        { id: 'a', type: 'custom', position: { x: 0, y: 0 }, data: { title: 'Source' } },
        { id: 'b', type: 'output', position: { x: 256, y: 0 }, data: { title: 'Target' } },
      ]}
      edges={[]}
      nodeTypes={[
        { type: 'custom', handles: [{ id: 'next', kind: 'source' }], render: ({ data }) => <span>{data.title}</span> },
      ]}
      onConnectEdge={mapped ? () => ({ type: 'smoothstep', data: { kind: 'sequence' } }) : undefined}
      onGraphChange={changed}
    />,
  );
  connectHandles('a', 'next', 'b');
  expect(changed).toHaveBeenCalledOnce();
  const [graph, change] = changed.mock.calls[0]!;
  expect(graph.edges).toEqual([
    expect.objectContaining({ source: 'a', target: 'b', sourceHandle: 'next', type: 'smoothstep' }),
  ]);
  expect(change).toEqual({ type: 'connect', nodeIds: [], edgeIds: [graph.edges[0].id] });
  if (mapped) expect(graph.edges[0].data).toEqual({ kind: 'sequence' });
});

it('preserves built-in node kinds in the public inspector props', () => {
  const node: NonNullable<blocks.NodeInspectorProps['node']> = {
    id: 'step',
    type: 'step',
    position: { x: 0, y: 0 },
    data: { title: 'Step' },
  };
  const kind: import('@gntik-ai/flow').FlowNodeKind = node.type;
  expect(kind).toBe('step');
});

it.each([
  ['branch', 'arm-0', 'branch-arm', { armIndex: 0 }],
  ['parallel', 'branch', 'parallel', { branch: 'first' }],
  ['sequence', 'next', 'sequence', { step: 1 }],
] as const)('maps a %s named handle to the consumer edge type and data', async (type, handle, edgeType, data) => {
  const onRun = vi.fn();
  const mapper = vi.fn(() => ({ type: edgeType, data }));
  render(
    <FlowBuilder
      edges={[]}
      nodes={[
        {
          id: 'source',
          type,
          position: { x: 0, y: 0 },
          data: { title: 'Source' },
        },
        {
          id: 'target',
          type: 'output',
          position: { x: 256, y: 0 },
          data: { title: 'Target' },
        },
      ]}
      nodeTypes={[
        {
          type,
          handles: [{ id: handle, kind: 'source' }],
          render: ({ data }) => <span>{data.title}</span>,
        },
      ]}
      onConnectEdge={mapper}
      onRun={onRun}
    />,
  );
  connectHandles('source', handle, 'target');
  await userEvent.click(screen.getByRole('button', { name: 'Run' }));
  expect(mapper).toHaveBeenCalledWith({
    source: 'source',
    target: 'target',
    sourceHandle: handle,
    targetHandle: null,
    sourceType: type,
    targetType: 'output',
  });
  expect(onRun.mock.calls[0]?.[0].edges).toEqual([
    expect.objectContaining({
      source: 'source',
      target: 'target',
      type: edgeType,
      data,
    }),
  ]);
});

it('rejects a connection without mapping, notifying acceptance or adding an edge', async () => {
  const changed = vi.fn();
  const rejection = {
    code: 'cycle',
    nodeId: 'a',
    message: 'Cycles are not allowed',
  };
  const rejected = vi.fn();
  const accepted = vi.fn();
  const mapper = vi.fn();
  const onRun = vi.fn();
  render(
    <FlowBuilder
      nodes={[
        {
          id: 'a',
          type: 'branch',
          position: { x: 0, y: 0 },
          data: { title: 'Branch' },
        },
        {
          id: 'b',
          type: 'output',
          position: { x: 256, y: 0 },
          data: { title: 'End' },
        },
      ]}
      edges={[]}
      nodeTypes={[
        {
          type: 'branch',
          handles: [{ id: 'arm', kind: 'source' }],
          render: ({ data }) => <span>{data.title}</span>,
        },
      ]}
      isValidConnection={() => rejection}
      onConnectionRejected={rejected}
      onConnect={accepted}
      onConnectEdge={mapper}
      onRun={onRun}
      onGraphChange={changed}
    />,
  );
  connectHandles('a', 'arm', 'b');
  expect(rejected).toHaveBeenCalledExactlyOnceWith(rejection);
  expect(accepted).not.toHaveBeenCalled();
  expect(mapper).not.toHaveBeenCalled();
  expect(changed).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Run' }));
  expect(onRun.mock.calls[0]?.[0].edges).toEqual([]);
  expect(screen.queryByRole('list', { name: 'Flow problems' })).toBeNull();
});

it('decorates invalid nodes with an icon and text and focuses a problem node', async () => {
  render(
    <FlowBuilder
      validationIssues={[
        { code: 'required', nodeId: 'validate', message: 'Schema is required' },
        { code: 'empty-flow', message: 'Add a terminal step' },
      ]}
    />,
  );
  const node = screen.getByTestId('rf__node-validate');
  expect(within(node).getByText('Schema is required')).toBeInTheDocument();
  expect(node.querySelector('svg[aria-hidden]')).not.toBeNull();
  const problems = screen.getByRole('list', { name: 'Flow problems' });
  expect(within(problems).getByText(/Add a terminal step/).tagName).toBe('SPAN');
  await userEvent.click(within(problems).getByRole('button', { name: /Schema is required/ }));
  expect(node).toHaveClass('selected');
  expect(node).toHaveFocus();
  expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Validate payload');
});

it('run mode keeps labelled nodes selectable with live status but prevents editing', async () => {
  const selected = vi.fn();
  const changed = vi.fn();
  const { rerender } = render(
    <FlowBuilder
      mode="run"
      nodeStatus={{ webhook: 'running', validate: 'paused' }}
      onNodeSelect={selected}
      onGraphChange={changed}
    />,
  );
  expect(screen.queryByRole('button', { name: /Add Step/ })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Run' })).toBeNull();
  const node = screen.getByRole('group', { name: 'Webhook' });
  expect(node).toHaveAttribute('tabindex', '0');
  expect(node).not.toHaveClass('draggable');
  expect(node.querySelector('.connectable')).toBeNull();
  expect(within(node).getByText('Running')).toBeInTheDocument();
  fireEvent.click(node);
  expect(selected).toHaveBeenLastCalledWith('webhook');
  expect(screen.queryByRole('textbox', { name: 'Title' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Delete node' })).toBeNull();
  const other = screen.getByRole('group', { name: 'Validate payload' });
  fireEvent.keyDown(other, { key: 'Enter' });
  expect(selected).toHaveBeenLastCalledWith('validate');
  fireEvent.click(other);
  await userEvent.keyboard('{Backspace}');
  expect(other).toBeInTheDocument();
  fireEvent.keyDown(other, { key: 'ArrowRight' });
  expect(changed).not.toHaveBeenCalled();
  rerender(<FlowBuilder mode="run" nodeStatus={{ webhook: 'done', validate: 'paused' }} onNodeSelect={selected} />);
  expect(within(node).getByText('Done')).toBeInTheDocument();
  expect(within(other).getByText('Paused')).toBeInTheDocument();
  await expectNoAxeViolations();
});

it('keeps viewport navigation available for a large run graph', () => {
  const restore = setWide(true);
  try {
    render(<FlowBuilder mode="run" />);
    const canvas = screen.getByRole('region', { name: 'Untitled flow canvas' });
    expect(within(canvas).getByRole('button', { name: 'Zoom In' })).toBeInTheDocument();
    expect(within(canvas).getByRole('button', { name: 'Zoom Out' })).toBeInTheDocument();
    expect(canvas.querySelector('.react-flow__minimap')).not.toBeNull();
    expect(canvas.querySelector('.react-flow__pane')).toHaveClass('draggable');
    expect(screen.queryByRole('button', { name: 'Toggle Interactivity' })).toBeNull();
  } finally {
    restore();
  }
});

it('updating one status does not render another node badge subtree', () => {
  const renders: Record<string, number> = {};
  const nodes: FlowNode<string>[] = ['one', 'two'].map((id) => ({
    id,
    type: 'custom',
    position: { x: id === 'one' ? 0 : 256, y: 0 },
    data: { title: id },
  }));
  const types = [
    {
      type: 'custom',
      handles: [],
      decorations: 'consumer' as const,
      render: ({ id, data }: import('@gntik-ai/flow').FlowNodeRenderProps) => (
        <Profiler
          id={id}
          onRender={(id) => {
            renders[id] = (renders[id] ?? 0) + 1;
          }}
        >
          <FlowStatusBadge status={data.decoration?.status ?? 'paused'} />
        </Profiler>
      ),
    },
  ];
  const { rerender } = render(
    <FlowBuilder
      nodes={nodes}
      edges={[]}
      nodeTypes={types}
      mode="run"
      nodeStatus={{ one: 'running', two: 'paused' }}
    />,
  );
  const before = renders.two;
  rerender(
    <FlowBuilder nodes={nodes} edges={[]} nodeTypes={types} mode="run" nodeStatus={{ one: 'done', two: 'paused' }} />,
  );
  expect(renders.two).toBe(before);
  expect(screen.getAllByText('Done')).toHaveLength(1);
});

it('anchors a connection rejection to its source when the validator omits a node id', () => {
  const rejected = vi.fn();
  render(
    <FlowBuilder
      nodes={[
        { id: 'a', type: 'branch', position: { x: 0, y: 0 }, data: { title: 'Branch' } },
        { id: 'b', type: 'output', position: { x: 256, y: 0 }, data: { title: 'End' } },
      ]}
      edges={[]}
      nodeTypes={[
        { type: 'branch', handles: [{ id: 'arm', kind: 'source' }], render: ({ data }) => <span>{data.title}</span> },
      ]}
      isValidConnection={() => ({ code: 'invalid', message: 'Choose another target' })}
      onConnectionRejected={rejected}
    />,
  );
  connectHandles('a', 'arm', 'b');
  expect(rejected).toHaveBeenCalledExactlyOnceWith({ code: 'invalid', nodeId: 'a', message: 'Choose another target' });
});

it('lets the consumer own and clear rejection problems without duplicates', async () => {
  function Consumer() {
    const [issues, setIssues] = useState<import('./FlowBuilder').FlowValidationIssue[]>([]);
    return (
      <>
        <FlowBuilder
          nodes={[
            { id: 'a', type: 'branch', position: { x: 0, y: 0 }, data: { title: 'Branch' } },
            { id: 'b', type: 'output', position: { x: 256, y: 0 }, data: { title: 'End' } },
          ]}
          edges={[]}
          nodeTypes={[
            {
              type: 'branch',
              handles: [{ id: 'arm', kind: 'source' }],
              render: ({ data }) => <span>{data.title}</span>,
            },
          ]}
          isValidConnection={() => ({ code: 'cycle', message: 'Cycles are not allowed' })}
          onConnectionRejected={(issue) => setIssues([issue])}
          validationIssues={issues}
        />
        <button onClick={() => setIssues([])}>Clear problems</button>
      </>
    );
  }
  render(<Consumer />);
  connectHandles('a', 'arm', 'b');
  expect(screen.getByRole('list', { name: 'Flow problems' }).children).toHaveLength(1);
  await userEvent.click(screen.getByRole('button', { name: 'Clear problems' }));
  expect(screen.queryByRole('list', { name: 'Flow problems' })).toBeNull();
  expect(screen.queryByText('Cycles are not allowed')).toBeNull();
});

it('connects named custom handles with the keyboard', async () => {
  const onRun = vi.fn();
  render(
    <FlowBuilder
      nodes={[
        { id: 'a', type: 'custom', width: 208, height: 90, position: { x: 0, y: 0 }, data: { title: 'Source' } },
        { id: 'b', type: 'custom', width: 208, height: 90, position: { x: 256, y: 0 }, data: { title: 'Target' } },
      ]}
      edges={[]}
      nodeTypes={[
        {
          type: 'custom',
          handles: [
            { id: 'input', kind: 'target', label: 'Input' },
            { id: 'next', kind: 'source', label: 'Next' },
          ],
          render: ({ data }) => <span>{data.title}</span>,
        },
      ]}
      onRun={onRun}
    />,
  );
  const source = within(screen.getByTestId('rf__node-a')).getByRole('button', { name: 'Next' });
  const target = within(screen.getByTestId('rf__node-b')).getByRole('button', { name: 'Input' });
  Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: () => target });
  expect(source).toHaveAttribute('tabindex', '0');
  fireEvent.keyDown(source, { key: 'Enter' });
  fireEvent.keyDown(target, { key: ' ' });
  await userEvent.click(screen.getByRole('button', { name: 'Run' }));
  expect(onRun.mock.calls[0]?.[0].edges).toEqual([
    expect.objectContaining({ source: 'a', target: 'b', sourceHandle: 'next', targetHandle: 'input' }),
  ]);
  await expectNoAxeViolations();
});
