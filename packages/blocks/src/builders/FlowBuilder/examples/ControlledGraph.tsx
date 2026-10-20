import { useState } from 'react';
import { FlowBuilder, builderNodes, builderEdges, cleanFlowGraph, type FlowGraph } from '../FlowBuilder';

/** Apply reported graph content while the builder retains canvas selection and drag state. */
export default function ControlledGraph() {
  const [graph, setGraph] = useState<FlowGraph>(() => cleanFlowGraph({ nodes: builderNodes, edges: builderEdges }));
  return <FlowBuilder graph={graph} onGraphChange={setGraph} />;
}
