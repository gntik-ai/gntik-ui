import { useState } from 'react';
import { builderNodes, builderEdges, cleanFlowGraph, type FlowGraph } from '@gntik-ai/blocks';
import WorkflowBuilderPage from '../Page';

/** Save the graph currently on screen to browser storage; products own persistence. */
export default function SaveGraph() {
  const [graph, setGraph] = useState<FlowGraph>(() => cleanFlowGraph({ nodes: builderNodes, edges: builderEdges }));
  return (
    <WorkflowBuilderPage
      graph={graph}
      onGraphChange={setGraph}
      onSave={(next) => {
        localStorage.setItem('workflow-builder-example', JSON.stringify(next));
      }}
    />
  );
}
