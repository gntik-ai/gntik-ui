import { useState } from 'react';
import { NodeCard, type FlowNodeRenderer } from '@gntik-ai/flow';
import { Button } from '@gntik-ai/ui';
import { FlowBuilder, type FlowConnection, type FlowNode, type FlowTone } from '../FlowBuilder';

const nodeTypes: FlowNodeRenderer[] = [
  {
    type: 'branch',
    handles: [
      { id: 'input', kind: 'target' },
      { id: 'arm-0', kind: 'source' },
      { id: 'arm-1', kind: 'source' },
    ],
    render: ({ data, selected }) => <NodeCard title={data.title} selected={selected} />,
  },
  {
    type: 'parallel',
    handles: [
      { id: 'input', kind: 'target' },
      { id: 'branch', kind: 'source' },
    ],
    render: ({ data, selected }) => <NodeCard title={data.title} selected={selected} />,
  },
  {
    type: 'sequence',
    handles: [
      { id: 'input', kind: 'target' },
      { id: 'next', kind: 'source' },
    ],
    render: ({ data, selected }) => <NodeCard title={data.title} selected={selected} />,
  },
];
const nodes: FlowNode<string>[] = [
  {
    id: 'branch',
    type: 'branch',
    position: { x: 0, y: 64 },
    data: { title: 'Branch' },
  },
  {
    id: 'parallel',
    type: 'parallel',
    position: { x: 256, y: 0 },
    data: { title: 'Parallel' },
  },
  {
    id: 'sequence',
    type: 'sequence',
    position: { x: 256, y: 160 },
    data: { title: 'Sequence' },
  },
];

function mapEdge(c: FlowConnection) {
  if (c.sourceType === 'branch')
    return {
      type: 'smoothstep',
      data: {
        kind: 'branch-arm',
        armIndex: Number(c.sourceHandle?.split('-')[1]),
      },
    };
  if (c.sourceType === 'parallel') return { type: 'smoothstep', data: { kind: 'parallel', branch: 'first' } };
  return { type: 'smoothstep', data: { kind: 'sequence', step: 1 } };
}

/** Named branch arms, parallel and sequence handles. Edge payloads remain consumer-owned. */
export default function CustomFlowExample() {
  const [rejected, setRejected] = useState('');
  return (
    <>
      <FlowBuilder
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        onConnectEdge={mapEdge}
        isValidConnection={(c) =>
          c.source !== c.target || {
            code: 'self-loop',
            nodeId: c.source,
            message: 'Choose another target node.',
          }
        }
        onConnectionRejected={(issue) => setRejected(issue.message)}
        validationIssues={[
          {
            code: 'required',
            nodeId: 'branch',
            message: 'Choose a branch condition.',
          },
          { code: 'terminal', message: 'Add a terminal step.' },
        ]}
      />
      <p aria-live="polite">{rejected}</p>
    </>
  );
}

export function RunFlowExample() {
  const [status, setStatus] = useState<Record<string, FlowTone>>({
    branch: 'running',
    parallel: 'paused',
    sequence: 'paused',
  });
  const [selected, setSelected] = useState('');
  return (
    <>
      <FlowBuilder
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        mode="run"
        nodeStatus={status}
        onNodeSelect={setSelected}
      />
      <Button onClick={() => setStatus((s) => ({ ...s, branch: 'done' }))}>Complete branch</Button>
      <p aria-live="polite">{selected && `Selected node: ${selected}`}</p>
    </>
  );
}
