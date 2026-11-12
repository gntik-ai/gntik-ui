import { FlowCanvas } from '../FlowCanvas';
import { useFlowState } from '../useFlowState';
import { pipelineEdges, pipelineNodes } from './pipeline';

const button =
  'rounded-md border border-border bg-card px-2.5 py-1 text-[12px] text-foreground focus-ring aria-disabled:text-muted-foreground';

/** useFlowState with history: drag, connect or delete, then Undo and Redo through the recorded steps. */
export default function UndoRedoCanvas() {
  const { undo, redo, canUndo, canRedo, ...flow } = useFlowState(pipelineNodes, pipelineEdges, { history: true });
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button type="button" className={button} aria-disabled={!canUndo} onClick={() => canUndo && undo()}>
          Undo
        </button>
        <button type="button" className={button} aria-disabled={!canRedo} onClick={() => canRedo && redo()}>
          Redo
        </button>
      </div>
      <FlowCanvas aria-label="Pipeline with history" height={420} {...flow} />
    </div>
  );
}
