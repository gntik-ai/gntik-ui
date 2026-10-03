import { Database, GitBranch, Globe, Maximize, Minus, Play, Plus, Save, Trash2, Webhook } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../../../components/Badge';
import { Button, IconButton } from '../../../components/Button';
import { Field, FieldLabel } from '../../../components/Field';
import { Input } from '../../../components/Input';
import { Toolbar, ToolbarButton, ToolbarSeparator } from '../../../components/Toolbar';
import { CanvasLayout } from '../CanvasLayout';

const PALETTE = [
  { label: 'HTTP trigger', icon: Globe },
  { label: 'Webhook', icon: Webhook },
  { label: 'Branch', icon: GitBranch },
  { label: 'Database query', icon: Database },
];

const NODES = [
  { id: 'trigger', label: 'HTTP trigger', kind: 'Trigger', x: 48, y: 72 },
  { id: 'branch', label: 'Route by plan', kind: 'Branch', x: 260, y: 150 },
  { id: 'query', label: 'Load project', kind: 'Query', x: 480, y: 80 },
];

const LOGS = [
  ['12:04:31', 'info', 'Validated 3 nodes and 2 edges'],
  ['12:04:32', 'info', 'Dry run started for deployment “billing-sync”'],
  ['12:04:33', 'warn', 'Node “Load project” has no timeout; using 30s'],
] as const;

export default function CanvasLayoutFlowEditor() {
  const [selected, setSelected] = useState('branch');
  const node = NODES.find((n) => n.id === selected);
  return (
    <div className="h-[520px] overflow-hidden rounded-lg border border-border">
      <CanvasLayout
        header={
          <>
            <span className="truncate text-[13px] font-semibold">billing-sync</span>
            <Badge tone="neutral" size="sm">Draft</Badge>
            <div className="ml-auto flex items-center gap-1.5">
              <Button size="sm" variant="secondary" icon={Save}>Save</Button>
              <Button size="sm" icon={Play}>Run</Button>
            </div>
          </>
        }
        toolbar={
          <Toolbar aria-label="Canvas tools" variant="floating">
            <ToolbarButton icon={Plus} aria-label="Zoom in" />
            <ToolbarButton icon={Minus} aria-label="Zoom out" />
            <ToolbarButton icon={Maximize} aria-label="Fit view" />
            <ToolbarSeparator />
            <ToolbarButton icon={Trash2} aria-label="Delete selection" />
          </Toolbar>
        }
        palette={
          <ul className="grid gap-1">
            {PALETTE.map(({ label, icon: Icon }) => (
              <li key={label}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-md border border-border bg-background px-2.5 py-2 text-left text-[12.5px] transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none"
                >
                  <Icon size={15} aria-hidden className="text-muted-foreground" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        }
        inspector={
          node ? (
            <div className="grid gap-4">
              <p className="font-mono text-[11px] text-muted-foreground">{node.kind} · {node.id}</p>
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input key={node.id} size="sm" defaultValue={node.label} />
              </Field>
              <Field>
                <FieldLabel>Timeout (seconds)</FieldLabel>
                <Input size="sm" type="number" defaultValue="30" />
              </Field>
            </div>
          ) : (
            <p className="text-[12.5px] text-muted-foreground">Select a node to edit it.</p>
          )
        }
        console={
          <ul className="divide-y divide-border">
            {LOGS.map(([time, level, text]) => (
              <li key={time} className="flex gap-3 px-3 py-1.5">
                <span className="text-muted-foreground">{time}</span>
                <span className={level === 'warn' ? 'text-warning-text' : 'text-primary-text'}>{level}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        }
        consoleActions={<IconButton icon={Trash2} size="sm" label="Clear console" />}
      >
        <div className="relative size-full bg-background">
          <svg aria-hidden className="pointer-events-none absolute inset-0 size-full">
            <path d="M 208 98 C 240 98, 230 176, 260 176" className="fill-none stroke-border" strokeWidth={2} />
            <path d="M 420 176 C 450 176, 450 106, 480 106" className="fill-none stroke-primary" strokeWidth={2} />
          </svg>
          {NODES.map((n) => (
            <button
              key={n.id}
              type="button"
              aria-pressed={selected === n.id}
              onClick={() => setSelected(n.id)}
              style={{ left: n.x, top: n.y }}
              className="absolute w-40 rounded-lg border border-border bg-card px-3 py-2 text-left shadow-sm transition-colors aria-pressed:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none"
            >
              <span className="block font-mono text-[10px] tracking-wide text-muted-foreground uppercase">{n.kind}</span>
              <span className="block text-[12.5px] font-medium">{n.label}</span>
            </button>
          ))}
        </div>
      </CanvasLayout>
    </div>
  );
}
