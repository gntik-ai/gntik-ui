import { act, renderHook } from '@testing-library/react';
import type { Connection, Edge } from '@xyflow/react';
import { useFlowState } from './useFlowState';
import type { FlowNode } from './nodes';

const node = (id: string, x: number): FlowNode => ({
  id,
  type: 'step',
  position: { x, y: 0 },
  data: { title: id },
});
const nodes = [node('webhook', 0), node('validate', 256), node('route', 512), node('notify', 768), node('store', 768)];
const edges: Edge[] = [
  { id: 'e-webhook-validate', source: 'webhook', target: 'validate' },
  { id: 'e-validate-route', source: 'validate', target: 'route' },
  { id: 'e-route-notify', source: 'route', target: 'notify' },
  { id: 'e-route-store', source: 'route', target: 'store' },
];

const setup = (history: boolean | { limit?: number } = true) =>
  renderHook(() => useFlowState<FlowNode, Edge>(nodes, edges, { history }));

describe('useFlowState history', () => {
  it('keeps today’s return shape and records nothing while history is off', () => {
    const { result } = renderHook(() => useFlowState<FlowNode, Edge>(nodes, edges));
    expect(result.current.nodes).toHaveLength(5);
    expect(result.current.edges).toHaveLength(4);
    act(() => result.current.onNodesChange([{ type: 'remove', id: 'route' }]));
    expect(result.current.nodes.map((n) => n.id)).not.toContain('route');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('records nothing for select, dimension and in-progress drag changes', () => {
    const { result } = setup();
    act(() => {
      result.current.onNodesChange([
        { type: 'select', id: 'route', selected: true },
        { type: 'dimensions', id: 'route', dimensions: { width: 208, height: 56 } },
        { type: 'position', id: 'route', position: { x: 530, y: 4 }, dragging: true },
      ]);
      result.current.onEdgesChange([{ type: 'select', id: 'e-route-notify', selected: true }]);
    });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.nodes.find((n) => n.id === 'route')?.selected).toBe(true);
  });

  it('records a node removed with its three edges as one step that undo restores', () => {
    const { result } = setup();
    act(() => {
      result.current.onEdgesChange(
        ['e-validate-route', 'e-route-notify', 'e-route-store'].map((id) => ({ type: 'remove' as const, id })),
      );
      result.current.onNodesChange([{ type: 'remove', id: 'route' }]);
    });
    expect(result.current.nodes).toHaveLength(4);
    expect(result.current.edges).toHaveLength(1);
    expect(result.current.canUndo).toBe(true);
    act(() => {
      result.current.undo();
    });
    expect(result.current.nodes.map((n) => n.id)).toContain('route');
    expect(result.current.edges.map((e) => e.id)).toEqual(
      expect.arrayContaining(['e-validate-route', 'e-route-notify', 'e-route-store']),
    );
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
    act(() => {
      result.current.redo();
    });
    expect(result.current.nodes).toHaveLength(4);
    expect(result.current.edges).toHaveLength(1);
  });

  it('records an ended drag, not its in-progress positions, and undo returns the start position', () => {
    const { result } = setup();
    act(() =>
      result.current.onNodesChange([{ type: 'position', id: 'store', position: { x: 800, y: 10 }, dragging: true }]),
    );
    act(() =>
      result.current.onNodesChange([{ type: 'position', id: 'store', position: { x: 832, y: 16 }, dragging: false }]),
    );
    expect(result.current.canUndo).toBe(true);
    act(() => {
      result.current.undo();
    });
    expect(result.current.nodes.find((n) => n.id === 'store')?.position).toEqual({ x: 768, y: 0 });
    expect(result.current.canUndo).toBe(false);
  });

  it('does not capture an unfinished drag when a selection-only setter runs mid-drag', () => {
    const { result } = setup();
    act(() =>
      result.current.onNodesChange([{ type: 'position', id: 'store', position: { x: 780, y: 0 }, dragging: true }]),
    );
    act(() => result.current.setNodes((ns) => ns.map((n) => ({ ...n, selected: n.id === 'store' }))));
    expect(result.current.canUndo).toBe(false);
    act(() =>
      result.current.onNodesChange([{ type: 'position', id: 'store', position: { x: 800, y: 0 }, dragging: false }]),
    );
    act(() => {
      result.current.undo();
    });
    expect(result.current.nodes.find((n) => n.id === 'store')?.position).toEqual({ x: 768, y: 0 });
    expect(result.current.canUndo).toBe(false);
  });

  it('records an accepted connection and direct setNodes calls with their label', () => {
    const { result } = setup();
    const connection: Connection = { source: 'webhook', target: 'store', sourceHandle: null, targetHandle: null };
    act(() => result.current.onConnect(connection));
    expect(result.current.edges).toHaveLength(5);
    let label: string | undefined;
    act(() => {
      label = result.current.undo();
    });
    expect(label).toBe('connect');
    expect(result.current.edges).toHaveLength(4);
    act(() => result.current.setNodes((ns) => ns.filter((n) => n.id !== 'store'), { label: 'prune' }));
    act(() => {
      label = result.current.undo();
    });
    expect(label).toBe('prune');
    expect(result.current.nodes).toHaveLength(5);
  });

  it('does not change which nodes are selected when undoing or redoing', () => {
    const { result } = setup();
    act(() => result.current.onNodesChange([{ type: 'remove', id: 'store' }]));
    act(() => result.current.onNodesChange([{ type: 'select', id: 'route', selected: true }]));
    act(() => {
      result.current.undo();
    });
    expect(result.current.nodes.filter((n) => n.selected).map((n) => n.id)).toEqual(['route']);
    act(() => {
      result.current.redo();
    });
    expect(result.current.nodes.filter((n) => n.selected).map((n) => n.id)).toEqual(['route']);
  });

  it('merges setter calls that share a coalesce key and starts over on resetHistory', () => {
    const { result } = setup();
    for (const title of ['a', 'ab', 'abc']) {
      act(() =>
        result.current.setNodes((ns) => ns.map((n) => (n.id === 'route' ? { ...n, data: { ...n.data, title } } : n)), {
          coalesce: 'title',
        }),
      );
    }
    act(() => {
      result.current.undo();
    });
    expect(result.current.nodes.find((n) => n.id === 'route')?.data.title).toBe('route');
    expect(result.current.canUndo).toBe(false);
    act(() => result.current.resetHistory());
    expect(result.current.canRedo).toBe(false);
  });

  it('keeps at most `limit` steps', async () => {
    const { result } = setup({ limit: 3 });
    // Separate events: each one is its own step.
    for (const id of ['webhook', 'validate', 'route', 'notify']) {
      await act(async () => result.current.onNodesChange([{ type: 'remove', id }]));
    }
    for (let i = 0; i < 5; i += 1) {
      act(() => {
        result.current.undo();
      });
    }
    expect(result.current.nodes).toHaveLength(3);
    expect(result.current.canUndo).toBe(false);
  });
  it('rebases on the current graph when history is switched on after edits made while off', async () => {
    const { result, rerender } = renderHook(
      ({ history }: { history: boolean }) => useFlowState<FlowNode, Edge>(nodes, edges, { history }),
      { initialProps: { history: false } },
    );
    await act(async () => result.current.onNodesChange([{ type: 'remove', id: 'webhook' }]));
    rerender({ history: true });
    expect(result.current.canUndo).toBe(false);
    await act(async () => result.current.onNodesChange([{ type: 'remove', id: 'store' }]));
    expect(result.current.canUndo).toBe(true);
    act(() => {
      result.current.undo();
    });
    expect(result.current.nodes.map((n) => n.id)).toEqual(['validate', 'route', 'notify', 'store']);
    expect(result.current.canUndo).toBe(false);
  });
});
