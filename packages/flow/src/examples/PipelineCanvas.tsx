import { FlowCanvas } from '../FlowCanvas';
import { useFlowState } from '../useFlowState';
import { pipelineEdges, pipelineNodes } from './pipeline';

/** Interactive pipeline: drag nodes, pull a handle to connect, zoom and pan. */
export default function PipelineCanvas() {
  const flow = useFlowState(pipelineNodes, pipelineEdges);
  return <FlowCanvas aria-label="Data pipeline" height={500} {...flow} />;
}
