import { FlowCanvas } from '../FlowCanvas';
import { kindEdges, kindNodes } from './pipeline';

/** Static diagram of the four node kinds (no pan/zoom, no controls). */
export default function NodeTypesStrip() {
  return <FlowCanvas aria-label="Node types" height={230} interactive={false} nodes={kindNodes} edges={kindEdges} />;
}
