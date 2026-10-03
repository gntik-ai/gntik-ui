/* ============================================================================
   @gntik-ai/evals · replay.ts — a MessagesClient that replays scripted turns
   ----------------------------------------------------------------------------
   Used by `--dry-run` (test/fixtures/dry-run-transcript.json) and the tests:
   no network, no credentials. Each step is a partial BetaMessage; the missing
   fields get neutral defaults. Every request's params are kept for asserts.
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import type Anthropic from '@anthropic-ai/sdk';
import type { MessagesClient, StreamParams } from './agent.js';
import { EVALS_ROOT } from './tools.js';

type BetaMessage = Anthropic.Beta.Messages.BetaMessage;

export interface ReplayStep {
  stop_reason: BetaMessage['stop_reason'];
  content: unknown[];
  usage?: Partial<BetaMessage['usage']>;
  model?: string;
  stop_details?: BetaMessage['stop_details'];
}

export interface ReplayFixture {
  note?: string;
  model?: string;
  tasks: Record<string, ReplayStep[]>;
}

export const DRY_RUN_FIXTURE = path.join(EVALS_ROOT, 'test', 'fixtures', 'dry-run-transcript.json');

export function loadFixture(file = DRY_RUN_FIXTURE): ReplayFixture {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as ReplayFixture;
}

let seq = 0;

export function toMessage(step: ReplayStep, model = 'claude-opus-5-5'): BetaMessage {
  const usage = {
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
    cache_creation: null,
    fallback_credit: null,
    inference_geo: null,
    iterations: null,
    server_tool_use: null,
    service_tier: null,
    speed: null,
    ...step.usage,
  };
  return {
    id: `msg_replay_${++seq}`,
    type: 'message',
    role: 'assistant',
    model: step.model ?? model,
    content: step.content,
    stop_reason: step.stop_reason,
    stop_sequence: null,
    stop_details: step.stop_details ?? null,
    container: null,
    context_management: null,
    diagnostics: null,
    usage,
  } as unknown as BetaMessage;
}

export interface ReplayClient extends MessagesClient {
  /** Params of every request, in order (deep-copied at call time). */
  requests: StreamParams[];
  /** Steps not consumed yet. */
  remaining(): number;
}

/** Replays `steps` in order; throws when the loop asks for more turns than were scripted. */
export function replayClient(steps: ReplayStep[], model?: string): ReplayClient {
  const queue = [...steps];
  const requests: StreamParams[] = [];
  return {
    requests,
    remaining: () => queue.length,
    stream(params) {
      requests.push(structuredClone(params));
      const step = queue.shift();
      return {
        finalMessage: async () => {
          if (!step) throw new Error('replay: no scripted turn left');
          return toMessage(step, model ?? params.model);
        },
      };
    },
  };
}
