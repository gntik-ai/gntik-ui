/* ============================================================================
   @gntik-ai/evals · agent.ts — manual tool-use loop over the Messages API
   ----------------------------------------------------------------------------
   One episode = one battery task: the model explores the kit through the
   tools in tools.ts and ends by calling submit_page. Streaming + finalMessage
   (large max_tokens), adaptive thinking, explicit effort, tool_choice auto
   (forced tool_choice is rejected on claude-opus-5-5: the system prompt steers
   it to submit_page), parallel tool calls answered in one user message,
   append-only history (thinking blocks echoed unchanged).
   ============================================================================ */
import Anthropic from '@anthropic-ai/sdk';
import type { Task } from './battery.js';
import { runTool as defaultRunTool, toolDefinitions, type ToolResult } from './tools.js';

type BetaMessage = Anthropic.Beta.Messages.BetaMessage;
type BetaMessageParam = Anthropic.Beta.Messages.BetaMessageParam;
type BetaContentBlock = Anthropic.Beta.Messages.BetaContentBlock;
type BetaToolResultBlockParam = Anthropic.Beta.Messages.BetaToolResultBlockParam;
type BetaToolUseBlock = Anthropic.Beta.Messages.BetaToolUseBlock;
export type StreamParams = Parameters<Anthropic['beta']['messages']['stream']>[0];
export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

/** The slice of `client.beta.messages` the loop needs — real client or a mock. */
export interface MessagesClient {
  stream(params: StreamParams): { finalMessage(): Promise<BetaMessage> };
}

export const DEFAULT_MODEL = 'claude-opus-5-5';
export const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

export interface AgentConfig {
  model: string;
  effort: Effort;
  maxTokens: number;
  maxTurns: number;
  /** Server-side refusal fallback (`fallbacks: "default"`, beta server-side-fallback-2026-07-01). */
  fallback: boolean;
  /** eager_input_streaming on the tools (inputs validated client-side in runTool). */
  eagerInputStreaming: boolean;
  /** Re-prompts after a turn that ends without any tool call and without submit_page. */
  maxNudges: number;
}

export const DEFAULT_CONFIG: AgentConfig = {
  model: DEFAULT_MODEL,
  effort: 'high',
  maxTokens: 64_000,
  maxTurns: 20,
  fallback: true,
  eagerInputStreaming: true,
  maxNudges: 2,
};

export const SYSTEM_PROMPT = `You build product pages with gntik-ui, a product-agnostic React 19 + Tailwind CSS 4 design system (components on Base UI, layouts, page blocks and page templates over one token layer). Packages: @gntik-ai/ui (components, layouts, ThemeProvider), @gntik-ai/blocks (page blocks), @gntik-ai/templates (full pages + ConsoleShell), @gntik-ai/chat, @gntik-ai/icons (lucide + Icon), @gntik-ai/charts, @gntik-ai/flow, @gntik-ai/editor.

Build the page with the kit. Prefer, in this order:
1. A template (list_kit kind=template). Every template prop is optional and falls back to fixtures; console templates render inside ConsoleShell and take a \`shell\` prop. scaffold_page template=<id> writes the file.
2. A layout + blocks: ConsoleShell (or a @gntik-ai/ui layout) + Page + blocks in a Stack. scaffold_page blocks=[…] layout=… writes the file.
3. Components to fill gaps (get_component). Never restyle a kit component with ad-hoc colours.

Hard rules:
- Import only from react, react-dom and @gntik-ai/*. No other libraries, no CSS imports in the page.
- Token classes only (bg-*, text-*, border-*, fill-* that resolve to tokens). No hex/rgb/hsl literals, no Tailwind palette colours (bg-red-500), no gradients, no glow, no dark: variants. Prefer kit props over your own className/style.
- Brand-coloured text: text-primary-text, text-success-text, text-warning-text, text-destructive-text; on tinted chips text-<tone>-chip-text. Inline links are underlined.
- Strict TypeScript (noUncheckedIndexedAccess), no any. English copy; never name a real product.

Work efficiently: a few targeted lookups, then write the page. You may check it with validate_page. Finish by calling submit_page exactly once with the complete TSX file (one default-exported component). The task is not done until submit_page is called.`;

export const NUDGE = 'You have not submitted the page yet. Finish it and call submit_page with the complete TSX file.';

/* ── episode record ───────────────────────────────────────────────────────── */

export interface UsageTally {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  cacheWriteTokens: number;
  cacheReadTokens: number;
}

export interface ToolCallRecord {
  turn: number;
  id: string;
  name: string;
  /** Input with long strings shortened. */
  input: unknown;
  isError: boolean;
  resultChars: number;
  resultExcerpt: string;
}

export interface TurnRecord {
  turn: number;
  stopReason: string | null;
  model: string;
  text: string;
  toolCalls: string[];
}

export type Outcome = 'submitted' | 'refusal' | 'max_tokens' | 'max_turns' | 'no_submit' | 'error';

export interface Episode {
  taskId: string;
  model: string;
  effort: Effort;
  outcome: Outcome;
  submitted?: { filename: string; code: string };
  turns: TurnRecord[];
  toolCalls: ToolCallRecord[];
  usage: UsageTally;
  refusal?: { category: string | null; explanation: string | null };
  /** Server-side fallback switch points ("from → to"). */
  fallbacks: string[];
  error?: string;
}

export const emptyUsage = (): UsageTally => ({ requests: 0, inputTokens: 0, outputTokens: 0, cacheWriteTokens: 0, cacheReadTokens: 0 });

export function addUsage(t: UsageTally, u: BetaMessage['usage'] | undefined): void {
  t.requests += 1;
  if (!u) return;
  t.inputTokens += u.input_tokens ?? 0;
  t.outputTokens += u.output_tokens ?? 0;
  t.cacheWriteTokens += u.cache_creation_input_tokens ?? 0;
  t.cacheReadTokens += u.cache_read_input_tokens ?? 0;
}

const shorten = (v: unknown, n = 200): unknown => {
  if (typeof v === 'string') return v.length > n ? `${v.slice(0, n)}… (${v.length} chars)` : v;
  if (Array.isArray(v)) return v.map((x) => shorten(x, n));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shorten(x, n)]));
  return v;
};

/**
 * Content to echo back as the assistant turn. Unchanged, except after a mid-output server-side
 * fallback: thinking / tool_use blocks that precede the last `fallback` block are dropped.
 */
export function echoable(content: BetaContentBlock[]): BetaContentBlock[] {
  const last = content.map((b) => b.type).lastIndexOf('fallback');
  if (last < 0) return content;
  const drop = new Set(['thinking', 'redacted_thinking', 'tool_use', 'server_tool_use']);
  return content.filter((b, i) => i >= last || !drop.has(b.type));
}

/** Errors worth one retry: the SDK failing to parse a streamed (eager) tool input. */
const isStreamJsonError = (e: unknown) => !(e instanceof Anthropic.APIError) && e instanceof Error && /JSON/i.test(`${e.name} ${e.message}`);

export function buildParams(config: AgentConfig, messages: BetaMessageParam[]): StreamParams {
  return {
    model: config.model,
    max_tokens: config.maxTokens,
    system: SYSTEM_PROMPT,
    tools: toolDefinitions({ eagerInputStreaming: config.eagerInputStreaming }),
    tool_choice: { type: 'auto' },
    thinking: { type: 'adaptive' },
    output_config: { effort: config.effort },
    cache_control: { type: 'ephemeral' },
    messages,
    ...(config.fallback ? { betas: [FALLBACK_BETA], fallbacks: 'default' as const } : {}),
  };
}

export type ToolRunner = (name: string, input: unknown) => ToolResult;

/* ── the loop ─────────────────────────────────────────────────────────────── */

export async function runAgent(
  task: Task,
  client: MessagesClient,
  partial: Partial<AgentConfig> = {},
  runTool: ToolRunner = (name, input) => defaultRunTool(name, input),
): Promise<Episode> {
  const config = { ...DEFAULT_CONFIG, ...partial };
  const ep: Episode = { taskId: task.id, model: config.model, effort: config.effort, outcome: 'max_turns', turns: [], toolCalls: [], usage: emptyUsage(), fallbacks: [] };
  const messages: BetaMessageParam[] = [{ role: 'user', content: task.prompt }];
  let nudges = 0;
  let jsonRetries = 0;

  for (let turn = 1; turn <= config.maxTurns; turn++) {
    let msg: BetaMessage;
    try {
      msg = await client.stream(buildParams(config, messages)).finalMessage();
    } catch (e) {
      if (isStreamJsonError(e) && jsonRetries < 2) {
        jsonRetries++;
        turn--; // the turn produced nothing usable: redo it
        continue;
      }
      ep.outcome = 'error';
      ep.error = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
      return ep;
    }
    addUsage(ep.usage, msg.usage);
    for (const b of msg.content) if (b.type === 'fallback') ep.fallbacks.push(`${b.from.model} → ${b.to.model}`);
    const toolUses = msg.content.filter((b): b is BetaToolUseBlock => b.type === 'tool_use');
    ep.turns.push({
      turn,
      stopReason: msg.stop_reason,
      model: msg.model,
      text: msg.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('\n').slice(0, 500),
      toolCalls: toolUses.map((t) => t.name),
    });

    // Never run tools from a refused or truncated turn: their inputs may be cut off.
    if (msg.stop_reason === 'refusal') {
      ep.outcome = 'refusal';
      ep.refusal = { category: msg.stop_details?.category ?? null, explanation: msg.stop_details?.explanation ?? null };
      return ep;
    }
    if (msg.stop_reason === 'max_tokens') {
      ep.outcome = 'max_tokens';
      return ep;
    }

    messages.push({ role: 'assistant', content: echoable(msg.content) });

    if (msg.stop_reason === 'pause_turn') continue;
    if (!toolUses.length) {
      if (nudges >= config.maxNudges) {
        ep.outcome = 'no_submit';
        return ep;
      }
      nudges++;
      messages.push({ role: 'user', content: NUDGE });
      continue;
    }

    // Parallel tool calls: run them all, answer with every tool_result in ONE user message.
    const results: BetaToolResultBlockParam[] = [];
    for (const call of toolUses) {
      const r = runTool(call.name, call.input);
      ep.toolCalls.push({
        turn,
        id: call.id,
        name: call.name,
        input: shorten(call.input),
        isError: r.isError,
        resultChars: r.content.length,
        resultExcerpt: r.content.slice(0, 200),
      });
      results.push({ type: 'tool_result', tool_use_id: call.id, content: r.content, ...(r.isError ? { is_error: true } : {}) });
      if (r.submitted && !ep.submitted) ep.submitted = r.submitted;
    }
    messages.push({ role: 'user', content: results });
    if (ep.submitted) {
      ep.outcome = 'submitted';
      return ep;
    }
  }
  ep.outcome = 'max_turns';
  return ep;
}
