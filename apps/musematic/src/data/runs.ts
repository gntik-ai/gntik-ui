import type { DeploymentRow, TokenUsagePeriod, TraceSpan } from '@gntik-ai/blocks';
import { agents } from './agents';
import { minutesAgo } from './time';

/** One agent run, with its trace. */
export interface Run {
  id: string;
  agentId: string;
  agentName: string;
  model: string;
  region: string;
  /** Kit StatusTag key: running, queued, paused (awaiting approval), degraded (retrying), failed. */
  status: DeploymentRow['status'];
  trigger: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  startedAt: Date;
  durationMs: number;
  spans: TraceSpan[];
}

const STATUSES: Run['status'][] = ['running', 'running', 'failed', 'queued', 'running', 'paused', 'degraded', 'running', 'failed', 'running'];
const TRIGGERS = ['ticket.created', 'webhook', 'schedule', 'pull_request.opened', 'chat', 'api'];

/** The span tree of a run: http entry → retrieval → llm with tool calls → format. */
function spansFor(agentName: string, model: string, tool: string, failed: boolean, seed: number): TraceSpan[] {
  const llm = 900 + (seed % 7) * 180;
  const total = 520 + llm + 420;
  return [
    { id: 's1', name: `POST /v1/agents/${agentName}/runs`, kind: 'http', start: 0, duration: total, status: failed ? 'error' : 'ok', attributes: { 'http.status': failed ? 500 : 200, 'run.trigger': TRIGGERS[seed % TRIGGERS.length] ?? 'api' } },
    { id: 's2', parentId: 's1', name: 'plan', kind: 'chain', start: 20, duration: 160, status: 'ok', attributes: { steps: 3 } },
    { id: 's3', parentId: 's1', name: 'retrieve knowledge', kind: 'retrieval', start: 190, duration: 300, status: 'ok', attributes: { documents: 6 + (seed % 5), index: `${agentName}-kb` } },
    { id: 's4', parentId: 's3', name: 'embed query', kind: 'llm', start: 195, duration: 90, status: 'ok', attributes: { model: 'embed-small', 'tokens.input': 38 } },
    { id: 's5', parentId: 's1', name: `generate · ${model}`, kind: 'llm', start: 510, duration: llm, status: failed ? 'error' : 'ok', attributes: { model, 'tokens.input': 2_400 + seed * 37, 'tokens.output': 380 + seed * 11, temperature: 0.2 } },
    { id: 's6', parentId: 's5', name: `tool: ${tool}`, kind: 'tool', start: 760, duration: 210, status: 'error', attributes: { error: 'timeout after 200ms' } },
    { id: 's7', parentId: 's5', name: `tool: ${tool} (retry)`, kind: 'tool', start: 980, duration: 260, status: failed ? 'error' : 'ok', attributes: { attempt: 2 } },
    { id: 's8', parentId: 's1', name: 'guardrails', kind: 'chain', start: 520 + llm, duration: 140, status: failed ? 'error' : 'ok', attributes: failed ? { policy: 'pii-redaction', verdict: 'blocked' } : { policy: 'pii-redaction', verdict: 'pass' } },
    { id: 's9', parentId: 's1', name: 'format response', kind: 'chain', start: 680 + llm, duration: 240, status: 'ok' },
  ];
}

export const runs: Run[] = Array.from({ length: 22 }, (_, i) => {
  const agent = agents[(i * 5) % agents.length] ?? agents[0]!;
  const status = STATUSES[i % STATUSES.length] ?? 'running';
  const spans = spansFor(agent.name, agent.model, agent.tools[0] ?? 'kb.lookup', status === 'failed', i);
  const inputTokens = 2_400 + i * 37 + 38;
  const outputTokens = 380 + i * 11;
  return {
    id: `run_${(48_211 + i * 97).toString(36)}`,
    agentId: agent.id,
    agentName: agent.name,
    model: agent.model,
    region: agent.region,
    status,
    trigger: TRIGGERS[i % TRIGGERS.length] ?? 'api',
    inputTokens,
    outputTokens,
    cost: Math.round((inputTokens * 3 + outputTokens * 15) / 10_000) / 100,
    startedAt: minutesAgo(3 + i * 11),
    durationMs: spans[0]?.duration ?? 0,
    spans,
  };
});

export const findRun = (id: string) => runs.find((r) => r.id === id);

/** Runs as kit ResourceIndex rows: tokens in the "requests" figure. */
export const runRows: DeploymentRow[] = runs.map((r) => ({
  id: r.id,
  name: `${r.agentName} · ${r.id}`,
  region: r.region,
  status: r.status,
  requests: r.inputTokens + r.outputTokens,
  cost: r.cost,
  updatedAt: r.startedAt,
}));

/** TokenCostCard input for one run (a single period hides the switch). */
export const runUsage = (r: Run): TokenUsagePeriod[] => [
  { id: 'run', label: 'This run', inputTokens: r.inputTokens, outputTokens: r.outputTokens, cost: r.cost, budget: 0.25 },
];
