import { FlowBuilder, type FlowEdge, type PaletteItem } from '@gntik-ai/blocks';
import type { FlowNode } from '@gntik-ai/flow';
import { Save, Upload } from '@gntik-ai/icons';
import { Breadcrumbs, Button, CanvasLayout, StatusTag, type BreadcrumbItem } from '@gntik-ai/ui';
import { useState } from 'react';
import { flowBuilderBreadcrumbs, flowBuilderContent } from './data';

export interface FlowBuilderPageProps {
  title: string;
  /** StatusTag key next to the title (draft, active…). */
  status: string;
  /** Initial graph and palette; omitted values use the FlowBuilder block samples. */
  nodes: FlowNode[];
  edges: FlowEdge[];
  palette: PaletteItem[];
  onRun: (graph: { nodes: FlowNode[]; edges: FlowEdge[] }) => void;
  onSave: () => void | Promise<void>;
  onPublish: () => void;
  breadcrumbs: BreadcrumbItem[];
  /** Builder height in px on wide screens. */
  height: number;
  fullScreen: boolean;
}

/**
 * Flow builder page: CanvasLayout + the FlowBuilder block. The app imports
 * '@gntik-ai/flow/styles.css' once for the React Flow canvas.
 */
export default function FlowBuilderPage(props: Partial<FlowBuilderPageProps>) {
  const {
    title = flowBuilderContent.title,
    status = flowBuilderContent.status,
    nodes,
    edges,
    palette,
    onRun,
    onSave,
    onPublish,
    breadcrumbs = flowBuilderBreadcrumbs,
    height = 640,
    fullScreen = true,
  } = props;
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState(flowBuilderContent.lastSaved);

  const save = async () => {
    setSaving(true);
    try {
      await onSave?.();
      setSavedNote('All changes saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CanvasLayout
      fullScreen={fullScreen}
      mainLabel={`${title} editor`}
      smallScreenNotice={null}
      header={
        <>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Breadcrumbs items={breadcrumbs} className="hidden min-w-0 md:flex" />
            <h1 className="truncate text-[14px] font-semibold text-foreground">{title}</h1>
            <StatusTag status={status} />
            <p aria-live="polite" className="hidden text-[12px] text-muted-foreground sm:block">
              {savedNote}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="secondary" icon={Save} loading={saving} onClick={() => void save()}>
              Save
            </Button>
            <Button size="sm" icon={Upload} onClick={onPublish}>
              Publish
            </Button>
          </div>
        </>
      }
    >
      <div className="h-full overflow-auto p-3 sm:p-4">
        <FlowBuilder title={title} nodes={nodes} edges={edges} palette={palette} onRun={onRun} height={height} />
      </div>
    </CanvasLayout>
  );
}
