import type { FlowCanvasProps, FlowNode, FlowNodeKind } from '@gntik-ai/flow';

/** React Flow edge, as FlowCanvas takes it. */
export type FlowEdge = NonNullable<FlowCanvasProps['edges']>[number];

export interface PaletteItem {
  kind: FlowNodeKind;
  /** Default title of a node created from this item. */
  title: string;
  description: string;
}

export interface ConsoleEntry {
  id: string;
  /** Display time, e.g. "10:42:07". */
  time: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

const CARD = { width: 208, height: 90 } as const;
const SLIM = { width: 208, height: 56 } as const;

/** Neutral starter flow: webhook → validate → route → notify / store. */
export const builderNodes: FlowNode[] = [
  { id: 'webhook', type: 'trigger', position: { x: 0, y: 112 }, ...SLIM, data: { title: 'Webhook', subtitle: 'POST /v1/orders' } },
  { id: 'validate', type: 'step', position: { x: 256, y: 96 }, ...CARD, data: { title: 'Validate payload', subtitle: 'schema check', meta: 'v1.4', tone: 'done' } },
  { id: 'route', type: 'router', position: { x: 512, y: 112 }, ...SLIM, data: { title: 'Route by region', subtitle: '2 branches' } },
  { id: 'notify', type: 'output', position: { x: 768, y: 16 }, ...CARD, data: { title: 'Notify team', subtitle: 'email digest' } },
  { id: 'store', type: 'output', position: { x: 768, y: 192 }, ...CARD, data: { title: 'Store record', subtitle: 'orders table' } },
];

export const builderEdges: FlowEdge[] = [
  { id: 'e-webhook-validate', source: 'webhook', target: 'validate', animated: true },
  { id: 'e-validate-route', source: 'validate', target: 'route' },
  { id: 'e-route-notify', source: 'route', target: 'notify', label: 'eu' },
  { id: 'e-route-store', source: 'route', target: 'store', label: 'other' },
];

export const builderPalette: PaletteItem[] = [
  { kind: 'trigger', title: 'Trigger', description: 'Starts the flow on an event' },
  { kind: 'step', title: 'Step', description: 'Processes or transforms data' },
  { kind: 'router', title: 'Router', description: 'Branches on a condition' },
  { kind: 'output', title: 'Output', description: 'Sends the final result' },
];

export const builderConsole: ConsoleEntry[] = [
  { id: 'c1', time: '10:41:58', level: 'info', message: 'Flow loaded · 5 nodes, 4 edges' },
  { id: 'c2', time: '10:42:01', level: 'success', message: 'Validation passed' },
];
