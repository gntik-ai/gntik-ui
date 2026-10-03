import type { LogLine, TokenUsagePeriod, TraceSpan } from '@gntik-ai/blocks';
import type { BreadcrumbItem } from '@gntik-ai/ui';

/** Inputs, outputs and live state of one span, shown in the inspector. */
export interface SpanDetail {
  /** JSON-serialisable input of the span (request, prompt, tool arguments…). */
  input?: unknown;
  /** JSON-serialisable output; omit while the span is still running. */
  output?: unknown;
  /** The span has not finished yet: the inspector shows a live Timer. */
  running?: boolean;
}

/** Summary of the run the trace belongs to. */
export interface TraceRun {
  id: string;
  name: string;
  /** StatusTag key: running, succeeded, failed… */
  status: string;
  /** When the run started (ISO). Running spans time themselves from `startedAt + span.start`. */
  startedAt: string;
  model: string;
  environment: string;
}

export const traceRun: TraceRun = {
  id: 'run_8c41f2',
  name: 'Answer support question',
  status: 'running',
  startedAt: '2026-05-04T09:12:03.000Z',
  model: 'general-large',
  environment: 'production',
};

export const traceBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Runs', href: '/runs' },
  { label: traceRun.id, mono: true },
];

export const traceSpans: TraceSpan[] = [
  { id: 'root', name: 'POST /v1/answer', kind: 'http', start: 0, duration: 4200, status: 'ok', attributes: { 'http.method': 'POST', 'request.id': 'req_7f3a' } },
  { id: 'retrieve', parentId: 'root', name: 'retrieve context', kind: 'retrieval', start: 40, duration: 380, status: 'ok', attributes: { documents: 6 } },
  { id: 'embed', parentId: 'retrieve', name: 'embed query', kind: 'llm', start: 45, duration: 115, status: 'ok', attributes: { model: 'embed-small', 'tokens.input': 24 } },
  { id: 'search', parentId: 'retrieve', name: 'vector search', kind: 'retrieval', start: 170, duration: 240, status: 'ok', attributes: { index: 'docs-v3', topK: 6 } },
  { id: 'lookup', parentId: 'root', name: 'tool: lookup_order', kind: 'tool', start: 440, duration: 150, status: 'error', attributes: { error: 'timeout after 150ms' } },
  { id: 'lookup-retry', parentId: 'root', name: 'tool: lookup_order (retry)', kind: 'tool', start: 600, duration: 240, status: 'ok', attributes: { attempt: 2 } },
  { id: 'generate', parentId: 'root', name: 'generate answer', kind: 'llm', start: 860, duration: 3340, status: 'ok', attributes: { model: 'general-large', temperature: 0.2 } },
];

export const traceSpanDetails: Record<string, SpanDetail> = {
  root: {
    input: { method: 'POST', path: '/v1/answer', body: { question: 'Where is my order 10482?', customerId: 'cus_2291' } },
    running: true,
  },
  retrieve: { input: { query: 'Where is my order 10482?', topK: 6 }, output: { documents: ['shipping-policy.md', 'order-status.md', 'returns.md'], scores: [0.91, 0.88, 0.62] } },
  embed: { input: { model: 'embed-small', text: 'Where is my order 10482?' }, output: { dimensions: 768, tokens: 24 } },
  search: { input: { index: 'docs-v3', topK: 6 }, output: { hits: 6, tookMs: 236 } },
  lookup: { input: { tool: 'lookup_order', arguments: { orderId: '10482' } }, output: { error: { code: 'timeout', message: 'timeout after 150ms' } } },
  'lookup-retry': {
    input: { tool: 'lookup_order', arguments: { orderId: '10482' }, attempt: 2 },
    output: { orderId: '10482', status: 'shipped', carrier: 'Parcel Co', eta: '2026-05-06' },
  },
  generate: {
    input: {
      model: 'general-large',
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'Answer using the retrieved documents and tool results.' },
        { role: 'user', content: 'Where is my order 10482?' },
      ],
    },
    running: true,
  },
};

export const traceUsage: TokenUsagePeriod[] = [{ id: 'run', label: 'This run', inputTokens: 4_180, outputTokens: 312, cost: 0.021, budget: 0.05 }];

const LOGS: Array<[LogLine['level'], string, string]> = [
  ['info', 'gateway', 'POST /v1/answer accepted (req_7f3a)'],
  ['debug', 'retriever', 'embedding query with embed-small (24 tokens)'],
  ['info', 'retriever', 'vector search on docs-v3 returned 6 hits in 236ms'],
  ['debug', 'agent', 'calling tool lookup_order {"orderId":"10482"}'],
  ['error', 'tools', 'lookup_order timed out after 150ms'],
  ['warn', 'agent', 'retrying lookup_order (attempt 2 of 3)'],
  ['info', 'tools', 'lookup_order returned status=shipped'],
  ['info', 'agent', 'generating answer with general-large (temperature 0.2)'],
  ['debug', 'agent', 'streaming tokens…'],
];

/** Run log, oldest first. */
export const traceLogs: LogLine[] = LOGS.map(([level, source, message], i) => ({
  id: `log-${i}`,
  timestamp: `09:12:0${3 + Math.floor(i / 3)}.${String(100 + i * 87).padStart(3, '0')}`,
  level,
  source,
  message,
}));
