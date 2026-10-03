export type SpanKind = 'chain' | 'llm' | 'tool' | 'retrieval' | 'http';

export interface TraceSpan {
  id: string;
  /** Parent span id; omit for the root span(s). */
  parentId?: string;
  name: string;
  kind: SpanKind;
  /** Start offset from the trace start, in ms. */
  start: number;
  /** Duration in ms. */
  duration: number;
  /** `running`: still in progress (its `duration` is the time elapsed so far). */
  status: 'ok' | 'error' | 'running';
  /** Extra key/value details shown in the side panel. */
  attributes?: Record<string, string | number>;
}

export const traceSpans: TraceSpan[] = [
  { id: 's1', name: 'POST /v1/answer', kind: 'http', start: 0, duration: 2450, status: 'ok', attributes: { 'http.status': 200, 'request.id': 'req_7f3a' } },
  { id: 's2', parentId: 's1', name: 'retrieve context', kind: 'retrieval', start: 40, duration: 380, status: 'ok', attributes: { documents: 8 } },
  { id: 's3', parentId: 's2', name: 'embed query', kind: 'llm', start: 45, duration: 115, status: 'ok', attributes: { model: 'embed-small', 'tokens.input': 24 } },
  { id: 's4', parentId: 's2', name: 'vector search', kind: 'retrieval', start: 170, duration: 240, status: 'ok', attributes: { index: 'docs-v3', topK: 8 } },
  { id: 's5', parentId: 's1', name: 'generate answer', kind: 'llm', start: 440, duration: 1760, status: 'ok', attributes: { model: 'general-large', 'tokens.input': 3120, 'tokens.output': 412, temperature: 0.2 } },
  { id: 's6', parentId: 's5', name: 'tool: lookup_order', kind: 'tool', start: 900, duration: 150, status: 'error', attributes: { error: 'timeout after 150ms' } },
  { id: 's7', parentId: 's5', name: 'tool: lookup_order (retry)', kind: 'tool', start: 1060, duration: 240, status: 'ok', attributes: { attempt: 2 } },
  { id: 's8', parentId: 's1', name: 'format response', kind: 'chain', start: 2210, duration: 220, status: 'ok' },
];

/** A trace still in progress: the answer is being generated. */
export const runningTraceSpans: TraceSpan[] = [
  { id: 'r1', name: 'POST /v1/answer', kind: 'http', start: 0, duration: 1840, status: 'running', attributes: { 'request.id': 'req_9c21' } },
  { id: 'r2', parentId: 'r1', name: 'retrieve context', kind: 'retrieval', start: 30, duration: 410, status: 'ok', attributes: { documents: 6 } },
  { id: 'r3', parentId: 'r1', name: 'generate answer', kind: 'llm', start: 450, duration: 1390, status: 'running', attributes: { model: 'general-large', 'tokens.output': 188 } },
  { id: 'r4', parentId: 'r3', name: 'tool: search_docs', kind: 'tool', start: 620, duration: 310, status: 'ok', attributes: { results: 4 } },
];
