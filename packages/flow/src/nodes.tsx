import type { ReactNode } from 'react';
import { Handle, Position, type Node, type NodeProps, type NodeTypes } from '@xyflow/react';
import { NodeCard } from './NodeCard';
import type { FlowNodeKind, FlowTone } from './tones';

/** Generic node content. No domain data: title, subtitle, meta, icon and a status tone. */
export type FlowNodeData = {
  title: string;
  subtitle?: string;
  meta?: string;
  /** Decorative icon element (e.g. a lucide icon); defaults to the kind's glyph. */
  icon?: ReactNode;
  tone?: FlowTone;
  /** Override the kind's default handles. */
  handles?: { target?: boolean; source?: boolean };
};

export type FlowNode = Node<FlowNodeData, FlowNodeKind>;

const DEFAULT_HANDLES: Record<FlowNodeKind, { target: boolean; source: boolean }> = {
  trigger: { target: false, source: true },
  step: { target: true, source: true },
  router: { target: true, source: true },
  output: { target: true, source: false },
};

function makeNode(kind: FlowNodeKind) {
  function BrandNode({ data, selected, sourcePosition, targetPosition, isConnectable }: NodeProps<FlowNode>) {
    const handles = { ...DEFAULT_HANDLES[kind], ...data.handles };
    return (
      <div className="relative h-full w-full">
        {handles.target && (
          <Handle type="target" position={targetPosition ?? Position.Left} isConnectable={isConnectable} />
        )}
        <NodeCard
          kind={kind}
          title={data.title}
          subtitle={data.subtitle}
          meta={data.meta}
          icon={data.icon}
          tone={data.tone}
          selected={selected}
        />
        {handles.source && (
          <Handle type="source" position={sourcePosition ?? Position.Right} isConnectable={isConnectable} />
        )}
      </div>
    );
  }
  BrandNode.displayName = `${kind[0]?.toUpperCase()}${kind.slice(1)}Node`;
  return BrandNode;
}

/** Entry point: source handle only. */
export const TriggerNode = makeNode('trigger');
/** Processing step: target + source handles, optional meta and status. */
export const StepNode = makeNode('step');
/** Conditional branch: target + source handles. */
export const RouterNode = makeNode('router');
/** Terminal node: target handle only. */
export const OutputNode = makeNode('output');

/** `nodeTypes` map for `<FlowCanvas>` / `<ReactFlow>` (define it once, outside render). */
export const flowNodeTypes = {
  trigger: TriggerNode,
  step: StepNode,
  router: RouterNode,
  output: OutputNode,
} satisfies NodeTypes;
