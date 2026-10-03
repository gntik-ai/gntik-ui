import { useCallback, useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type NodeTypes,
  type ReactFlowProps,
} from '@xyflow/react';
import { flowNodeTypes, type FlowNode } from './nodes';
import { brandEdgeOptions, flowMarker, useFlowTheme, withBrandMarkers } from './theme';
import { cx, nodeToken } from './tones';

export interface FlowCanvasProps<N extends Node = FlowNode, E extends Edge = Edge>
  extends Omit<ReactFlowProps<N, E>, 'aria-label' | 'height' | 'width'> {
  /** Accessible name of the canvas region (required). */
  'aria-label': string;
  /** Canvas height (px or CSS length). */
  height?: number | string;
  showControls?: boolean;
  showMiniMap?: boolean;
  showBackground?: boolean;
  /** false = static diagram: no pan/zoom/connect/select (nodes still render). */
  interactive?: boolean;
  /** Class for the inner `.react-flow` element (`className` goes on the wrapper). */
  canvasClassName?: string;
}

const STATIC_PROPS = {
  nodesDraggable: false,
  nodesConnectable: false,
  elementsSelectable: false,
  panOnDrag: false,
  panOnScroll: false,
  zoomOnScroll: false,
  zoomOnPinch: false,
  zoomOnDoubleClick: false,
  preventScrolling: false,
} as const;

/**
 * React Flow canvas themed from the brand tokens: dotted background, controls and minimap,
 * brand node types, smoothstep edges with arrows (primary when animated). Drag, connect and
 * zoom/pan are on by default. Import `@gntik-ai/flow/styles.css` once.
 */
export function FlowCanvas<N extends Node = FlowNode, E extends Edge = Edge>({
  'aria-label': label,
  height = 480,
  showControls = true,
  showMiniMap = true,
  showBackground = true,
  interactive = true,
  className,
  canvasClassName,
  nodeTypes,
  edges,
  defaultEdgeOptions,
  proOptions,
  children,
  ...rest
}: FlowCanvasProps<N, E>) {
  const t = useFlowTheme();
  const brandedEdges = useMemo(() => (edges ? withBrandMarkers(edges, t) : undefined), [edges, t]);
  const edgeOptions = useMemo(
    () => ({ ...brandEdgeOptions, markerEnd: flowMarker(t.edge), ...defaultEdgeOptions }),
    [t, defaultEdgeOptions],
  );
  const miniColor = useCallback((n: N) => t.color(nodeToken(n.data.tone, n.type)), [t]);
  return (
    <div
      role="region"
      aria-label={label}
      data-theme={t.theme}
      className={cx('gu-flow relative w-full bg-background', className)}
      style={{ height }}
    >
      <ReactFlow<N, E>
        nodeTypes={nodeTypes ?? (flowNodeTypes as NodeTypes)}
        edges={brandedEdges}
        defaultEdgeOptions={edgeOptions}
        fitView
        fitViewOptions={{ padding: 0.12, maxZoom: 1 }}
        minZoom={0.3}
        maxZoom={1.75}
        snapToGrid
        snapGrid={[16, 16]}
        proOptions={proOptions ?? (interactive ? undefined : { hideAttribution: true })}
        {...(interactive ? undefined : STATIC_PROPS)}
        {...rest}
        className={canvasClassName}
      >
        {showBackground && <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={t.pattern} />}
        {interactive && showControls && <Controls />}
        {interactive && showMiniMap && (
          <MiniMap<N> pannable zoomable nodeColor={miniColor} nodeStrokeWidth={0} nodeBorderRadius={3} />
        )}
        {children}
      </ReactFlow>
    </div>
  );
}
