import type { FlowEdge, PaletteItem } from '@gntik-ai/blocks';
import type { FlowNode } from '@gntik-ai/flow';

export interface WorkflowDef {
  id: string;
  title: string;
  status: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const CARD = { width: 208, height: 90 } as const;
const SLIM = { width: 208, height: 56 } as const;

export const workflows: WorkflowDef[] = [
  {
    id: 'support-escalation',
    title: 'Support escalation',
    status: 'active',
    nodes: [
      { id: 'ticket', type: 'trigger', position: { x: 0, y: 128 }, ...SLIM, data: { title: 'Ticket created', subtitle: 'zendesk · webhook' } },
      { id: 'triage', type: 'step', position: { x: 256, y: 112 }, ...CARD, data: { title: 'support-triage', subtitle: 'classify + draft reply', meta: 'v13', tone: 'running' } },
      { id: 'route', type: 'router', position: { x: 512, y: 128 }, ...SLIM, data: { title: 'Confidence ≥ 0.8?', subtitle: '2 branches' } },
      { id: 'reply', type: 'output', position: { x: 768, y: 16 }, ...CARD, data: { title: 'Send reply', subtitle: 'zendesk.comment', tone: 'done' } },
      { id: 'review', type: 'step', position: { x: 768, y: 208 }, ...CARD, data: { title: 'Human review', subtitle: 'support on-call', meta: 'SLA 15 min', tone: 'review' } },
      { id: 'handoff', type: 'output', position: { x: 1024, y: 208 }, ...CARD, data: { title: 'Hand off', subtitle: 'tier-2 queue', tone: 'handoff' } },
    ],
    edges: [
      { id: 'e1', source: 'ticket', target: 'triage', animated: true },
      { id: 'e2', source: 'triage', target: 'route' },
      { id: 'e3', source: 'route', target: 'reply', label: 'yes' },
      { id: 'e4', source: 'route', target: 'review', label: 'no' },
      { id: 'e5', source: 'review', target: 'handoff' },
    ],
  },
  {
    id: 'invoice-matching',
    title: 'Invoice matching',
    status: 'draft',
    nodes: [
      { id: 'mail', type: 'trigger', position: { x: 0, y: 112 }, ...SLIM, data: { title: 'Invoice received', subtitle: 'ap@ mailbox' } },
      { id: 'ocr', type: 'step', position: { x: 256, y: 96 }, ...CARD, data: { title: 'Extract fields', subtitle: 'ocr.extract', tone: 'done' } },
      { id: 'match', type: 'step', position: { x: 512, y: 96 }, ...CARD, data: { title: 'invoice-reconciler', subtitle: 'match to PO', meta: 'v7', tone: 'running' } },
      { id: 'post', type: 'output', position: { x: 768, y: 96 }, ...CARD, data: { title: 'Post to ERP', subtitle: 'erp.post' } },
    ],
    edges: [
      { id: 'e1', source: 'mail', target: 'ocr', animated: true },
      { id: 'e2', source: 'ocr', target: 'match' },
      { id: 'e3', source: 'match', target: 'post' },
    ],
  },
];

export const findWorkflow = (id: string) => workflows.find((w) => w.id === id);

export const workflowPalette: PaletteItem[] = [
  { kind: 'trigger', title: 'Trigger', description: 'Webhook, schedule or chat message' },
  { kind: 'step', title: 'Agent', description: 'Runs an agent from this workspace' },
  { kind: 'router', title: 'Router', description: 'Branches on confidence or a field' },
  { kind: 'output', title: 'Action', description: 'Replies, posts or hands off' },
];
