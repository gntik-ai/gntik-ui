import { useId } from 'react';
import { MousePointerClick, Plus, Trash2 } from '@gntik-ai/icons';
import { FLOW_TONES, KIND_CHIP, KindGlyph, type FlowNode, type FlowNodeData, type FlowTone } from '@gntik-ai/flow';
import { Button, Field, FieldLabel, Input, SimpleSelect, cn } from '@gntik-ai/ui';
import type { ConsoleEntry, PaletteItem } from './fixtures';

/** Heading level of a panel title (one below the builder's title). */
export type PanelHeading = 'h3' | 'h4' | 'h5';

const panelTitle = 'px-3 pt-3 pb-2 font-mono text-[10.5px] font-medium tracking-[0.12em] text-muted-foreground uppercase';

export interface NodePaletteProps {
  items: PaletteItem[];
  onAdd: (item: PaletteItem) => void;
  /** Heading level of the panel title (default h3). */
  titleAs?: PanelHeading;
}

/** Left rail: node kinds to add to the canvas. */
export function NodePalette({ items, onAdd, titleAs: TitleTag = 'h3' }: NodePaletteProps) {
  const titleId = useId();
  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <TitleTag id={titleId} className={panelTitle}>
        Nodes
      </TitleTag>
      <ul aria-labelledby={titleId} className="flex-1 overflow-y-auto px-2 pb-2">
        {items.map((item) => (
          <li key={item.kind + item.title}>
            <button
              type="button"
              onClick={() => onAdd(item)}
              aria-label={`Add ${item.title}`}
              title={item.description}
              className="group flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left hover:bg-secondary/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              <span className={cn('grid size-7 shrink-0 place-items-center rounded-md', KIND_CHIP[item.kind])}>
                <KindGlyph kind={item.kind} size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-medium text-foreground">{item.title}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{item.description}</span>
              </span>
              <Plus size={14} aria-hidden className="shrink-0 text-muted-foreground group-hover:text-foreground" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const TONE_ITEMS = [
  { value: 'none', label: 'No status' },
  ...(Object.keys(FLOW_TONES) as FlowTone[]).map((t) => ({ value: t, label: FLOW_TONES[t].label })),
];

export interface NodeInspectorProps {
  node: FlowNode | undefined;
  onChange: (id: string, patch: Partial<FlowNodeData>) => void;
  onDelete: (id: string) => void;
  /** Heading level of the panel title (default h3). */
  titleAs?: PanelHeading;
}

/** Right rail: the selected node's editable fields. */
export function NodeInspector({ node, onChange, onDelete, titleAs: TitleTag = 'h3' }: NodeInspectorProps) {
  const titleId = useId();
  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <TitleTag id={titleId} className={panelTitle}>
        Inspector
      </TitleTag>
      {node ? (
        <form
          aria-labelledby={titleId}
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3"
        >
          <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <span className={cn('grid size-5 place-items-center rounded', KIND_CHIP[node.type ?? 'step'])}>
              <KindGlyph kind={node.type ?? 'step'} size={11} />
            </span>
            <span className="capitalize">{node.type}</span>
            <span className="font-mono text-[11px]">· {node.id}</span>
          </p>
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input size="sm" value={node.data.title} onValueChange={(v) => onChange(node.id, { title: String(v) })} />
          </Field>
          <Field>
            <FieldLabel>Subtitle</FieldLabel>
            <Input size="sm" value={node.data.subtitle ?? ''} onValueChange={(v) => onChange(node.id, { subtitle: String(v) || undefined })} />
          </Field>
          <Field>
            <FieldLabel>Meta</FieldLabel>
            <Input size="sm" value={node.data.meta ?? ''} onValueChange={(v) => onChange(node.id, { meta: String(v) || undefined })} />
          </Field>
          <SimpleSelect
            label="Status"
            size="sm"
            items={TONE_ITEMS}
            value={node.data.tone ?? 'none'}
            onValueChange={(v) => onChange(node.id, { tone: v && v !== 'none' ? (v as FlowTone) : undefined })}
          />
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => onDelete(node.id)} className="mt-auto self-start">
            Delete node
          </Button>
        </form>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 pb-6 text-center">
          <MousePointerClick size={18} aria-hidden className="text-muted-foreground" />
          <p className="text-[12.5px] text-muted-foreground">Select a node to edit its fields.</p>
        </div>
      )}
    </div>
  );
}

const CONSOLE_LEVEL: Record<ConsoleEntry['level'], string> = {
  info: 'text-muted-foreground',
  success: 'text-success-text',
  warn: 'text-warning-text',
  error: 'text-destructive-text',
};

export interface RunConsoleProps {
  entries: ConsoleEntry[];
  onClear: () => void;
  /** Heading level of the panel title (default h3). */
  titleAs?: PanelHeading;
}

/** Bottom panel: run output (role="log"). */
export function RunConsole({ entries, onClear, titleAs: TitleTag = 'h3' }: RunConsoleProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex items-center justify-between border-b border-border pr-2">
        <TitleTag className={cn(panelTitle, 'pb-2')}>Run console</TitleTag>
        <Button variant="ghost" size="sm" onClick={onClear} disabled={entries.length === 0} className="h-7">
          Clear
        </Button>
      </div>
      <div role="log" aria-label="Run console" tabIndex={0} className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[11.5px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring">
        {entries.length === 0 ? (
          <p className="font-sans text-[12.5px] text-muted-foreground">No output yet. Run the flow to see its steps.</p>
        ) : (
          entries.map((e) => (
            <p key={e.id} className="flex gap-3 py-0.5">
              <span className="shrink-0 text-muted-foreground tabular-nums">{e.time}</span>
              <span className={cn('w-14 shrink-0 uppercase', CONSOLE_LEVEL[e.level])}>{e.level}</span>
              <span className="min-w-0 text-foreground">{e.message}</span>
            </p>
          ))
        )}
      </div>
    </div>
  );
}
