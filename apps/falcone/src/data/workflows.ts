import type { PaletteItem } from '@gntik-ai/blocks';
import type { WorkflowBuilderPage } from '@gntik-ai/templates';
import type { ComponentProps } from 'react';

// Graph shapes, read from the template props (Falcone does not depend on @gntik-ai/flow directly).
type Props = ComponentProps<typeof WorkflowBuilderPage>;
type FlowNode = NonNullable<Props['nodes']>[number];
type FlowEdge = NonNullable<Props['edges']>[number];

export interface WorkflowDef {
  id: string;
  title: string;
  status: string;
  projectId: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const CARD = { width: 208, height: 90 } as const;
const SLIM = { width: 208, height: 56 } as const;

export const workflows: WorkflowDef[] = [
  {
    id: 'order-fulfilment',
    title: 'Order fulfilment',
    status: 'active',
    projectId: 'checkout-api',
    nodes: [
      { id: 'http', type: 'trigger', position: { x: 0, y: 128 }, ...SLIM, data: { title: 'POST /orders', subtitle: 'http · prod' } },
      { id: 'create', type: 'step', position: { x: 256, y: 112 }, ...CARD, data: { title: 'create-order', subtitle: 'node22 · p95 164 ms', meta: 'fn', tone: 'running' } },
      { id: 'route', type: 'router', position: { x: 512, y: 128 }, ...SLIM, data: { title: 'Payment method?', subtitle: '2 branches' } },
      { id: 'capture', type: 'step', position: { x: 768, y: 16 }, ...CARD, data: { title: 'capture-payment', subtitle: 'go1.24 · card', meta: 'fn', tone: 'done' } },
      { id: 'review', type: 'step', position: { x: 768, y: 208 }, ...CARD, data: { title: 'Manual approval', subtitle: 'invoice orders', meta: 'SLA 4 h', tone: 'review' } },
      { id: 'publish', type: 'output', position: { x: 1024, y: 112 }, ...CARD, data: { title: 'Publish event', subtitle: 'channel orders.live', tone: 'handoff' } },
    ],
    edges: [
      { id: 'e1', source: 'http', target: 'create', animated: true },
      { id: 'e2', source: 'create', target: 'route' },
      { id: 'e3', source: 'route', target: 'capture', label: 'card' },
      { id: 'e4', source: 'route', target: 'review', label: 'invoice' },
      { id: 'e5', source: 'capture', target: 'publish' },
      { id: 'e6', source: 'review', target: 'publish' },
    ],
  },
  {
    id: 'ticket-triage',
    title: 'Ticket triage',
    status: 'draft',
    projectId: 'support-copilot',
    nodes: [
      { id: 'queue', type: 'trigger', position: { x: 0, y: 112 }, ...SLIM, data: { title: 'Ticket created', subtitle: 'queue · tickets.in' } },
      { id: 'classify', type: 'step', position: { x: 256, y: 96 }, ...CARD, data: { title: 'classify-intent', subtitle: 'python3.13 · LLM', meta: 'BYOK', tone: 'done' } },
      { id: 'draft', type: 'step', position: { x: 512, y: 96 }, ...CARD, data: { title: 'draft-reply', subtitle: 'python3.13 · LLM', meta: 'BYOK', tone: 'degraded' } },
      { id: 'notify', type: 'output', position: { x: 768, y: 96 }, ...CARD, data: { title: 'Push to agent', subtitle: 'channel tickets.updates' } },
    ],
    edges: [
      { id: 'e1', source: 'queue', target: 'classify', animated: true },
      { id: 'e2', source: 'classify', target: 'draft' },
      { id: 'e3', source: 'draft', target: 'notify' },
    ],
  },
];

export const findWorkflow = (id: string) => workflows.find((w) => w.id === id);

export const workflowPalette: PaletteItem[] = [
  { kind: 'trigger', title: 'Trigger', description: 'HTTP route, queue, schedule or channel message' },
  { kind: 'step', title: 'Function', description: 'Invokes a function of this project' },
  { kind: 'router', title: 'Branch', description: 'Routes on a field or a function result' },
  { kind: 'output', title: 'Emit', description: 'Publishes to a channel, queue or webhook' },
];
