import { Profiler, useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlowStatusBadge } from '@gntik-ai/flow';
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

it('preserves built-in node kinds in the public inspector props', () => {
  const node: NonNullable<blocks.NodeInspectorProps['node']> = {
    id: 'step', type: 'step', position: { x: 0, y: 0 }, data: { title: 'Step' },
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
    />,
  );
  connectHandles('a', 'arm', 'b');
  expect(rejected).toHaveBeenCalledExactlyOnceWith(rejection);
  expect(accepted).not.toHaveBeenCalled();
  expect(mapper).not.toHaveBeenCalled();
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
  const { rerender } = render(
    <FlowBuilder mode="run" nodeStatus={{ webhook: 'running', validate: 'paused' }} onNodeSelect={selected} />,
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
            { type: 'branch', handles: [{ id: 'arm', kind: 'source' }], render: ({ data }) => <span>{data.title}</span> },
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
