import { useState } from 'react';
import { FlowBuilder, builderNodes, builderEdges, cleanFlowGraph, type FlowGraph } from '../FlowBuilder';

/** Undo and Redo of the last 20 edits: Mod+Z, Shift+Mod+Z and Ctrl+Y inside the builder, or the header buttons. */
export default function History() {
  const [graph, setGraph] = useState<FlowGraph>(() => cleanFlowGraph({ nodes: builderNodes, edges: builderEdges }));
  return <FlowBuilder history={{ limit: 20 }} graph={graph} onGraphChange={setGraph} />;
}
