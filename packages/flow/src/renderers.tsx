import { memo, type ReactNode } from 'react';
import { Handle, Position, type NodeProps, type NodeTypes } from '@xyflow/react';
import { FlowNodeIssues, FlowStatusBadge } from './decorations';
import { flowNodeTypes, type FlowNode, type FlowNodeData } from './nodes';

/** Named connection point. Positions default to left for targets and right for sources. */
export interface FlowHandle {
  id: string;
  kind: 'source' | 'target';
  position?: 'left' | 'right' | 'top' | 'bottom';
  label?: string;
}

/** Kit-owned renderer input: no React Flow component types are required by consumers. */
export interface FlowNodeRenderProps {
  id: string;
  type: string;
  data: FlowNodeData;
  selected: boolean;
  connectable: boolean;
}

export interface FlowNodeRenderer {
  type: string;
  handles: readonly FlowHandle[];
  /** Defaults to kit overlays. Consumer renderers may own accessible status and issue decorations. */
  decorations?: 'kit' | 'consumer';
  render: (props: FlowNodeRenderProps) => ReactNode;
}

const POSITIONS = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

/** Internal adapter; only the kit contracts above are exported from the package entry. */
export function adaptNodeRenderers(renderers: readonly FlowNodeRenderer[]): NodeTypes {
  const types: NodeTypes = { ...flowNodeTypes };
  for (const definition of renderers) {
    types[definition.type] = memo(function CustomNode({ id, data, selected, isConnectable }: NodeProps<FlowNode<string>>) {
      return (
        <div className="relative h-full w-full">
          {definition.handles.map((handle, index) => (
            <Handle
              key={`${handle.kind}-${handle.id}`}
              id={handle.id}
              type={handle.kind}
              position={POSITIONS[handle.position ?? (handle.kind === 'target' ? 'left' : 'right')]}
              isConnectable={isConnectable}
              aria-label={handle.label ?? handle.id}
              role="button"
              tabIndex={isConnectable ? 0 : -1}
              aria-disabled={!isConnectable}
              onKeyDown={(event) => {
                if (!isConnectable || (event.key !== 'Enter' && event.key !== ' ')) return;
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.click();
              }}
              style={{
                [handle.position === 'top' || handle.position === 'bottom' ? 'left' : 'top']:
                  `${((index + 1) / (definition.handles.length + 1)) * 100}%`,
              }}
            />
          ))}
          {definition.decorations !== 'consumer' && (
            <>
              {data.decoration?.status && (
                <div className="pointer-events-none absolute -top-2 right-1 z-10">
                  <FlowStatusBadge status={data.decoration.status} />
                </div>
              )}
              <FlowNodeIssues issues={data.decoration?.issues} />
            </>
          )}
          {definition.render({
            id,
            type: definition.type,
            data,
            selected,
            connectable: isConnectable,
          })}
        </div>
      );
    });
  }
  return types;
}
