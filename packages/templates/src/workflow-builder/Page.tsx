import {
  CodePanel,
  builderNodes,
  builderEdges,
  cleanFlowGraph,
  type CodePanelProps,
  FlowBuilder,
  type ConsoleEntry,
  type FlowBuilderProps,
  type FlowEdge,
  type FlowGraph,
  type FlowNode,
  type FlowNodeKind,
  type PaletteItem,
} from '@gntik-ai/blocks';
import { Save, Upload } from '@gntik-ai/icons';
import { Breadcrumbs, Button, CanvasLayout, StatusTag, useI18n, type BreadcrumbItem } from '@gntik-ai/ui';
import { useRef, useState } from 'react';
import { flowBuilderBreadcrumbs, flowBuilderContent } from './data';

export interface FlowBuilderPageProps<Kind extends string = FlowNodeKind> extends Pick<
  FlowBuilderProps<Kind>,
  | 'nodeTypes'
  | 'onConnectEdge'
  | 'onConnect'
  | 'isValidConnection'
  | 'onConnectionRejected'
  | 'validationIssues'
  | 'mode'
  | 'nodeStatus'
  | 'onNodeSelect'
  | 'graph'
  | 'onGraphChange'
> {
  /** Optional companion code panel; run mode forces readOnly. */
  codePanel?: CodePanelProps;
  title: string;
  /** StatusTag key next to the title (draft, active…). */
  status: string;
  /** Initial graph and palette; omitted values use the FlowBuilder block samples. */
  nodes: FlowNode<Kind | FlowNodeKind>[];
  edges: FlowEdge[];
  palette: PaletteItem[];
  /** Return console entries (or a promise of them) to log the real run; nothing logs a simulated run. */
  onRun: NonNullable<FlowBuilderProps<Kind>['onRun']>;
  /** Run console output (controlled); report changes with `onConsoleChange`. */
  consoleEntries: ConsoleEntry[];
  /** Initial run console output (uncontrolled). */
  defaultConsoleEntries: ConsoleEntry[];
  onConsoleChange: (entries: ConsoleEntry[]) => void;
  onConsoleClear: () => void;
  onSave: (graph: FlowGraph<Kind>) => void | Promise<void>;
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
export default function FlowBuilderPage<Kind extends string = FlowNodeKind>(
  props: Partial<FlowBuilderPageProps<Kind>>,
) {
  const {
    title = flowBuilderContent.title,
    status = flowBuilderContent.status,
    nodes = builderNodes,
    edges = builderEdges,
    palette,
    onRun,
    consoleEntries,
    defaultConsoleEntries,
    onConsoleChange,
    onConsoleClear,
    onSave,
    onPublish,
    nodeTypes,
    onConnectEdge,
    onConnect,
    isValidConnection,
    onConnectionRejected,
    validationIssues,
    mode,
    nodeStatus,
    onNodeSelect,
    graph,
    onGraphChange,
    codePanel,
    breadcrumbs = flowBuilderBreadcrumbs,
    height = 640,
    fullScreen = true,
  } = props;
  const [saving, setSaving] = useState(false);
  const [initialGraph] = useState<FlowGraph<Kind>>(() => ({ nodes, edges }));
  const [latestGraph, setLatestGraph] = useState<FlowGraph<Kind>>();
  const [saveState, setSaveState] = useState<'initial' | 'unsaved' | 'saved'>('initial');
  const revision = useRef(0);
  const { t } = useI18n();
  const savedNote =
    saveState === 'initial'
      ? flowBuilderContent.lastSaved
      : t(saveState === 'unsaved' ? 'actionBar.unsaved' : 'actionBar.saved');

  const save = async () => {
    setSaving(true);
    const savedRevision = revision.current;
    try {
      await onSave?.(cleanFlowGraph(graph ?? latestGraph ?? initialGraph));
      if (revision.current === savedRevision) setSaveState('saved');
    } catch {
      // The host owns persistence errors; retain the unsaved note and allow a retry.
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
            {mode !== 'run' && (
              <p aria-live="polite" className="hidden text-[12px] text-muted-foreground sm:block">
                {savedNote}
              </p>
            )}
          </div>
          {mode !== 'run' && (
            <div className="flex shrink-0 items-center gap-2">
              <Button size="sm" variant="secondary" icon={Save} loading={saving} onClick={() => void save()}>
                Save
              </Button>
              <Button size="sm" icon={Upload} onClick={onPublish}>
                Publish
              </Button>
            </div>
          )}
        </>
      }
    >
      <div className="h-full overflow-auto p-3 sm:p-4">
        <FlowBuilder
          title={title}
          nodes={nodes}
          edges={edges}
          graph={graph}
          onGraphChange={(next, change) => {
            revision.current += 1;
            setLatestGraph(next);
            setSaveState('unsaved');
            onGraphChange?.(next, change);
          }}
          palette={palette}
          onRun={onRun}
          consoleEntries={consoleEntries}
          defaultConsoleEntries={defaultConsoleEntries}
          onConsoleChange={onConsoleChange}
          onConsoleClear={onConsoleClear}
          height={height}
          nodeTypes={nodeTypes}
          onConnectEdge={onConnectEdge}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onConnectionRejected={onConnectionRejected}
          validationIssues={validationIssues}
          mode={mode}
          nodeStatus={nodeStatus}
          onNodeSelect={onNodeSelect}
        />
        {codePanel && (
          <CodePanel
            {...codePanel}
            headingLevel={codePanel.headingLevel ?? 2}
            readOnly={mode === 'run' ? true : codePanel.readOnly}
          />
        )}
      </div>
    </CanvasLayout>
  );
}
