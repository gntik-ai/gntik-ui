import { useEffect, useState } from 'react';
import { MarkerType, type DefaultEdgeOptions, type Edge, type EdgeMarker } from '@xyflow/react';
import { currentTheme, observeTheme, tokenColor, type Theme } from '@gntik-ai/tokens/runtime';

export interface FlowTheme {
  theme: Theme;
  /** Idle edge / arrow colour. */
  edge: string;
  /** Active (animated) edge / arrow colour. */
  edgeActive: string;
  /** Background dot pattern. */
  pattern: string;
  /** Resolves any brand token (e.g. "--warning") to a concrete colour. */
  color: (token: string, alpha?: number) => string;
}

function readFlowTheme(theme: Theme): FlowTheme {
  return {
    theme,
    edge: tokenColor('--muted-foreground'),
    edgeActive: tokenColor('--primary'),
    pattern: tokenColor('--border'),
    color: (token, alpha) => tokenColor(token, alpha),
  };
}

/**
 * Brand colours for the parts React Flow paints from props (arrow markers, minimap nodes,
 * background pattern), resolved through `@gntik-ai/tokens/runtime` so they also survive
 * SVG/PNG export. Re-read on every theme class change.
 */
export function useFlowTheme(): FlowTheme {
  const [snapshot, setSnapshot] = useState<FlowTheme>(() => readFlowTheme(currentTheme()));
  useEffect(() => observeTheme((next) => setSnapshot(readFlowTheme(next))), []);
  return snapshot;
}

/** Closed arrow marker in a given colour. */
export function flowMarker(color: string): EdgeMarker {
  return { type: MarkerType.ArrowClosed, width: 15, height: 15, color };
}

/** Brand edge defaults: orthogonal (smoothstep) routing. */
export const brandEdgeOptions: DefaultEdgeOptions = { type: 'smoothstep' };

/** Adds an arrow to edges that have none: primary when animated (active), muted otherwise. */
export function withBrandMarkers<E extends Edge>(edges: readonly E[], t: FlowTheme): E[] {
  return edges.map((e) =>
    e.markerEnd ? e : { ...e, markerEnd: flowMarker(e.animated ? t.edgeActive : t.edge) },
  );
}
