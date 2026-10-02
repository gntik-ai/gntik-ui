import type { Edge } from '@xyflow/react';
import type { FlowNode } from '../nodes';

const CARD = { width: 208, height: 90 } as const;
const SLIM = { width: 208, height: 56 } as const;

/** Neutral fixture: ingest → validate → route → transform / enrich / review → publish. */
export const pipelineNodes: FlowNode[] = [
  { id: 'ingest', type: 'trigger', position: { x: 0, y: 176 }, ...SLIM, data: { title: 'Ingest', subtitle: 'webhook · /v1/events' } },
  { id: 'validate', type: 'step', position: { x: 256, y: 160 }, ...CARD, data: { title: 'Validate', subtitle: 'schema check', meta: 'v2.3', tone: 'running' } },
  { id: 'route', type: 'router', position: { x: 520, y: 176 }, ...SLIM, data: { title: 'Route', subtitle: '3 branches' } },
  { id: 'transform', type: 'step', position: { x: 800, y: 32 }, ...CARD, data: { title: 'Transform', subtitle: 'normalize fields', meta: 'batch 512', tone: 'degraded' } },
  { id: 'enrich', type: 'step', position: { x: 800, y: 176 }, ...CARD, data: { title: 'Enrich', subtitle: 'lookup service', meta: 'retry 2/3', tone: 'failed' } },
  { id: 'review', type: 'output', position: { x: 800, y: 320 }, ...CARD, data: { title: 'Review', subtitle: 'manual approval', tone: 'review' } },
  { id: 'publish', type: 'output', position: { x: 1084, y: 112 }, ...CARD, data: { title: 'Publish', subtitle: 'release to catalog', tone: 'done' } },
];

export const pipelineEdges: Edge[] = [
  { id: 'e-ingest-validate', source: 'ingest', target: 'validate', animated: true, label: 'event' },
  { id: 'e-validate-route', source: 'validate', target: 'route', animated: true, label: 'valid' },
  { id: 'e-route-transform', source: 'route', target: 'transform', label: 'structured' },
  { id: 'e-route-enrich', source: 'route', target: 'enrich', label: 'partial' },
  { id: 'e-route-review', source: 'route', target: 'review', label: 'flagged' },
  { id: 'e-transform-publish', source: 'transform', target: 'publish' },
  { id: 'e-enrich-review', source: 'enrich', target: 'review' },
];

/** One node of each kind, chained (for the node-types strip). */
export const kindNodes: FlowNode[] = [
  { id: 't', type: 'trigger', position: { x: 0, y: 30 }, ...SLIM, data: { title: 'Trigger', subtitle: 'incoming event' } },
  { id: 's', type: 'step', position: { x: 252, y: 18 }, ...CARD, data: { title: 'Step', subtitle: 'processing step', meta: 'v1.0', tone: 'running' } },
  { id: 'r', type: 'router', position: { x: 516, y: 30 }, ...SLIM, data: { title: 'Router', subtitle: 'conditional branch' } },
  { id: 'o', type: 'output', position: { x: 780, y: 18 }, ...CARD, data: { title: 'Output', subtitle: 'final action', tone: 'done' } },
];

export const kindEdges: Edge[] = [
  { id: 'k1', source: 't', target: 's', animated: true, label: 'in' },
  { id: 'k2', source: 's', target: 'r' },
  { id: 'k3', source: 'r', target: 'o', label: 'match' },
];
