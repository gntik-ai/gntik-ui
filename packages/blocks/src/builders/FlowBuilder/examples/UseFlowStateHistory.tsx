import { Redo2, Undo2 } from '@gntik-ai/icons';
import { FlowCanvas, useFlowState } from '@gntik-ai/flow';
import { Button, useI18n } from '@gntik-ai/ui';
import { builderEdges, builderNodes } from '../fixtures';

/** useFlowState with { history: true }: drag, connect or delete, then undo and redo the recorded steps. */
export default function UseFlowStateHistory() {
  const { t } = useI18n();
  const { undo, redo, canUndo, canRedo, ...flow } = useFlowState(builderNodes, builderEdges, { history: true });
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" icon={Undo2} aria-disabled={!canUndo} onClick={() => canUndo && undo()}>
          {t('flow.undo')}
        </Button>
        <Button size="sm" variant="secondary" icon={Redo2} aria-disabled={!canRedo} onClick={() => canRedo && redo()}>
          {t('flow.redo')}
        </Button>
      </div>
      <FlowCanvas aria-label={t('flow.canvas')} height={420} {...flow} />
    </div>
  );
}
