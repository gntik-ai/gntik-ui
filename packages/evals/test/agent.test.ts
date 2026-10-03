import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, FALLBACK_BETA, NUDGE, echoable, runAgent, type MessagesClient } from '../src/agent.js';
import type { Task } from '../src/battery.js';
import { replayClient, toMessage, type ReplayStep } from '../src/replay.js';
import type { ToolResult } from '../src/tools.js';

const task: Task = { id: 'members', prompt: 'Build a members management page.', expect: { templates: ['settings-members'] } };
const PAGE = "import { SettingsMembersPage } from '@gntik-ai/templates';\nexport default function P() { return <SettingsMembersPage />; }\n";
let n = 0;
const tu = (name: string, input: unknown) => ({ type: 'tool_use', id: `toolu_${++n}`, name, input });
const usage = { input_tokens: 10, output_tokens: 5, cache_creation_input_tokens: 100, cache_read_input_tokens: 50 };
const step = (content: unknown[], stop_reason: ReplayStep['stop_reason'] = 'tool_use'): ReplayStep => ({ stop_reason, content, usage });
type Blocks = Array<{ type: string; tool_use_id?: string; is_error?: boolean; content?: unknown }>;

describe('agent loop', () => {
  it('tool_use → tool_result → submit_page, with the expected request shape', async () => {
    const client = replayClient([
      step([{ type: 'thinking', thinking: '', signature: 's' }, tu('list_kit', { kind: 'template', query: 'members' })]),
      step([tu('submit_page', { filename: 'Members.tsx', code: PAGE })]),
    ]);
    const ep = await runAgent(task, client);
    expect(ep.outcome).toBe('submitted');
    expect(ep.submitted?.code).toBe(PAGE);
    expect(ep.toolCalls.map((c) => c.name)).toEqual(['list_kit', 'submit_page']);
    expect(ep.usage).toEqual({ requests: 2, inputTokens: 20, outputTokens: 10, cacheWriteTokens: 200, cacheReadTokens: 100 });

    const [first, second] = client.requests;
    expect(first).toMatchObject({
      model: 'claude-opus-5-5',
      max_tokens: 64_000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'high' },
      tool_choice: { type: 'auto' },
      betas: [FALLBACK_BETA],
      fallbacks: 'default',
    });
    expect(first?.system).toMatch(/submit_page/);
    expect(first?.tools?.every((t) => 'strict' in t && t.strict === true)).toBe(true);
    // append-only: the assistant turn (thinking block included) is echoed, then one tool_result
    const msgs = second?.messages ?? [];
    expect(msgs).toHaveLength(3);
    expect((msgs[1]?.content as Blocks)[0]?.type).toBe('thinking');
    const results = msgs[2]?.content as Blocks;
    expect(results).toHaveLength(1);
    const call = (msgs[1]?.content as Array<{ id?: string }>)[1];
    expect(results[0]).toMatchObject({ type: 'tool_result', tool_use_id: call?.id });
    expect(results[0]?.is_error).toBeUndefined();
  });

  it('answers parallel tool calls in one user message, flagging is_error results', async () => {
    const a = tu('get_template', { id: 'settings-members' });
    const b = tu('get_component', { id: 'docs-page' });
    const c = tu('list_kit', { colour: 'red' });
    const client = replayClient([step([a, b, c]), step([tu('submit_page', { filename: 'P.tsx', code: PAGE })])]);
    const ep = await runAgent(task, client);
    const last = client.requests[1]?.messages.at(-1);
    expect(last?.role).toBe('user');
    const blocks = last?.content as Blocks;
    expect(blocks.map((x) => x.tool_use_id)).toEqual([a.id, b.id, c.id]);
    expect(blocks.map((x) => x.is_error ?? false)).toEqual([false, true, true]);
    expect(ep.toolCalls.filter((x) => x.isError)).toHaveLength(2);
    expect(ep.turns[0]?.toolCalls).toEqual(['get_template', 'get_component', 'list_kit']);
  });

  it('stops on refusal without running the turn’s tools', async () => {
    let ran = 0;
    const client = replayClient([
      { ...step([tu('submit_page', { filename: 'P.tsx', code: PAGE })], 'refusal'), stop_details: { type: 'refusal', category: 'cyber', explanation: 'declined' } as ReplayStep['stop_details'] },
    ]);
    const ep = await runAgent(task, client, {}, () => {
      ran++;
      return { content: '', isError: false } satisfies ToolResult;
    });
    expect(ep.outcome).toBe('refusal');
    expect(ep.refusal).toEqual({ category: 'cyber', explanation: 'declined' });
    expect(ran).toBe(0);
    expect(ep.submitted).toBeUndefined();
  });

  it('stops on max_tokens (a tool input may be truncated)', async () => {
    const ep = await runAgent(task, replayClient([step([tu('submit_page', { filename: 'P.tsx', code: 'export def' })], 'max_tokens')]));
    expect(ep.outcome).toBe('max_tokens');
    expect(ep.toolCalls).toHaveLength(0);
  });

  it('caps the episode at maxTurns (default 20)', async () => {
    const steps = Array.from({ length: 25 }, () => step([tu('list_kit', { kind: 'block' })]));
    const client = replayClient(steps);
    const ep = await runAgent(task, client);
    expect(DEFAULT_CONFIG.maxTurns).toBe(20);
    expect(ep.outcome).toBe('max_turns');
    expect(client.requests).toHaveLength(20);
    expect(client.remaining()).toBe(5);
    const short = await runAgent(task, replayClient(steps), { maxTurns: 3 });
    expect(short.turns).toHaveLength(3);
  });

  it('nudges after a text-only turn, then gives up after maxNudges', async () => {
    const text = step([{ type: 'text', text: 'Here is the page…', citations: null }], 'end_turn');
    const client = replayClient([text, step([tu('submit_page', { filename: 'P.tsx', code: PAGE })])]);
    const ep = await runAgent(task, client);
    expect(ep.outcome).toBe('submitted');
    expect(client.requests[1]?.messages.at(-1)).toEqual({ role: 'user', content: NUDGE });
    const stubborn = await runAgent(task, replayClient([text, text, text, text]));
    expect(stubborn.outcome).toBe('no_submit');
    expect(stubborn.turns).toHaveLength(3);
  });

  it('honours config: model, effort, no fallback, no eager streaming', async () => {
    const client = replayClient([step([tu('submit_page', { filename: 'P.tsx', code: PAGE })])]);
    await runAgent(task, client, { model: 'claude-sonnet-5-5', effort: 'medium', fallback: false, eagerInputStreaming: false });
    const p = client.requests[0];
    expect(p).toMatchObject({ model: 'claude-sonnet-5-5', output_config: { effort: 'medium' } });
    expect(p).not.toHaveProperty('fallbacks');
    expect(p).not.toHaveProperty('betas');
    expect(p?.tools?.some((t) => 'eager_input_streaming' in t)).toBe(false);
  });

  it('records fallbacks and drops pre-fallback thinking/tool_use when echoing', async () => {
    const content = [
      { type: 'thinking', thinking: '', signature: 's' },
      { type: 'text', text: 'partial', citations: null },
      { type: 'fallback', from: { model: 'claude-opus-5-5' }, to: { model: 'claude-opus-4-8' }, trigger: { type: 'refusal' } },
      tu('submit_page', { filename: 'P.tsx', code: PAGE }),
    ];
    const msg = toMessage(step(content));
    expect(echoable(msg.content).map((b) => b.type)).toEqual(['text', 'fallback', 'tool_use']);
    const ep = await runAgent(task, replayClient([step(content)]));
    expect(ep.fallbacks).toEqual(['claude-opus-5-5 → claude-opus-4-8']);
    expect(ep.outcome).toBe('submitted');
  });

  it('retries a turn whose streamed tool JSON failed to parse; API errors end the episode', async () => {
    let calls = 0;
    const flaky: MessagesClient = {
      stream: () => ({
        finalMessage: async () => {
          calls++;
          if (calls === 1) throw new SyntaxError('Unexpected end of JSON input');
          return toMessage(step([tu('submit_page', { filename: 'P.tsx', code: PAGE })]));
        },
      }),
    };
    expect((await runAgent(task, flaky)).outcome).toBe('submitted');
    expect(calls).toBe(2);
    const broken: MessagesClient = { stream: () => ({ finalMessage: async () => Promise.reject(new Error('overloaded')) }) };
    const ep = await runAgent(task, broken);
    expect(ep.outcome).toBe('error');
    expect(ep.error).toMatch(/overloaded/);
  });
});
