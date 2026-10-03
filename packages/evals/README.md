# @gntik-ai/evals — agent evaluations

Measures how well a Claude agent builds product pages **with the kit**. Each task in
`prompts/battery.json` is a product-agnostic request ("Billing page.", "A 404 page."…). The agent
gets the same tools the MCP server exposes (`list_kit`, `get_component`, `get_block`,
`get_template`, `scaffold_page`, `validate_page`), run in-process from `packages/mcp/src`, plus
`submit_page`, which ends the episode. The submitted TSX file is scored deterministically: no
model grades another model.

```
prompts/battery.json   12 tasks: prompt + expected kit ids (+ ids it must not use)
src/tools.ts           tool schemas (strict, additionalProperties: false) + in-process execution
src/agent.ts           manual tool-use loop (@anthropic-ai/sdk, client.beta.messages.stream)
src/score.ts           brand · kit-only · typecheck · composition · efficiency
src/run.ts             CLI: --dry-run / --confirm-spend, results/<timestamp>/
src/replay.ts          scripted MessagesClient (dry run + tests)
test/fixtures/         dry-run transcript + good/bad pages for the scorer
```

## What the battery measures

| Dimension | Weight | How | Score |
| --- | ---: | --- | --- |
| **brand** | 25 | `validate_page` (the MCP brand validator: hex/rgb/hsl, Tailwind palette, gradients, glow, `dark:`, fonts). Its `no-tokens` warning is ignored: a page made only of kit components has no classes of its own. | 0 errors = pass; 1 − 0.05 per warning (at least 0.7). Any error = 0 |
| **kitOnly** | 20 | The rules of `apps/musematic/scripts/check-kit-only.mjs`: imports only from `react`, `react-dom`, `@gntik-ai/*` or relative paths; no hex / CSS colour-function literals; no CSS imports in the page. `className=` / `style=` (own styling) is a soft penalty. | Hard violation = 0; else 1 − 0.1 per own-styling use (at least 0.5) |
| **typecheck** | 25 | The page is written to `.work/<task>/Page.tsx` with a tsconfig whose `paths` resolve `@gntik-ai/*` to each package's published `dist/*.d.ts` (from its `exports`) and `react` to `packages/ui/node_modules/@types`; then `tsc --noEmit` (strict, `noUncheckedIndexedAccess`, `jsx: react-jsx`). | 0 errors = 1, else 0 |
| **composition** | 20 | Recall of the expected ids. An id counts when its export (resolved with `exportNamesOf` from the MCP kit module) is imported from its package **and** referenced. A used template also counts its `template.meta.ts` blocks and layout; a ConsoleShell (direct or via a console template) counts `sidebar-layout`, `app-sidebar`, `app-topbar`. `templates` are alternatives (any one satisfies that part); every block, component and the layout are one part each. | hits / parts, − 0.25 per `mustNot` id used |
| **efficiency** | 10 | Tool calls in the episode (including `submit_page`). | 1 up to 6 calls, linear to 0 at 20 |

**Total** = Σ weight × score, 0–100. An episode that never calls `submit_page` (refusal,
`max_tokens`, 20 turns, or it stopped) scores 0. Per-dimension details (findings, tsc errors,
hit/miss per id) are in each task's JSON.

## Agent setup

- Model `claude-opus-5-5`, `thinking: { type: "adaptive" }`, `output_config: { effort: "high" }`
  (this model's default is `medium`, so it is set explicitly), `max_tokens: 64000`, streamed with
  `.finalMessage()`.
- `tool_choice: auto`: forced tool choice is rejected on this model, so the system prompt (a
  condensed AGENTS.md: kit order template → layout + blocks → components, hard brand rules)
  tells it to finish with `submit_page`. A text-only turn gets up to 2 reminders.
- Strict tools; `eager_input_streaming: true` so the large `submit_page` code streams as it is
  generated. Inputs are then validated client-side and a bad input comes back as an `is_error`
  tool result.
- Server-side refusal fallback on by default: `betas: ["server-side-fallback-2026-07-01"]` +
  `fallbacks: "default"`. A fallback is recorded in the transcript (`fallbacks`), and the
  pre-fallback thinking/tool_use blocks are not echoed back. Use `--no-fallback` when you want a
  pure single-model measurement.
- Parallel tool calls are answered with all `tool_result`s in one user message. History is
  append-only (thinking blocks are echoed back unchanged). Top-level `cache_control` caches the
  growing prefix. The episode stops on `refusal` or `max_tokens` without running that turn's
  tools, and after 20 turns.

## Running

```bash
pnpm --filter @gntik-ai/evals test        # vitest, no network
pnpm --filter @gntik-ai/evals typecheck
pnpm --filter @gntik-ai/evals eval:dry    # = tsx src/run.ts --dry-run
```

**Dry run** (`--dry-run`) costs nothing. It replays `test/fixtures/dry-run-transcript.json`: the
model turns are scripted, but the tool calls run for real against the kit and the result is scored
like a real run. Use it to check the harness after changing tools, scoring or the battery. Its
token counts are illustrative, so its cost line is not a real cost.

**Real run.** It calls the Claude API and **costs money**. It needs a credential the SDK can find
(`ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, an `ant auth login` profile or WIF variables) **and**
`--confirm-spend`. Without both it refuses to run.

```bash
cd packages/evals
npx tsx src/run.ts --confirm-spend --only members,not-found     # start small
npx tsx src/run.ts --confirm-spend                              # whole battery
npx tsx src/run.ts --confirm-spend --effort medium --out results/medium
```

Options: `--only id,id` · `--model <id>` · `--effort low|medium|high|xhigh|max` · `--out <dir>`
(default `results/<timestamp>/`) · `--max-turns <n>` · `--no-fallback` · `--no-eager`.

Output: `<task>.json` (task, outcome, scores with details, usage, estimated cost, transcript summary
with every tool call and turn) and `<task>.tsx` (the submitted page) for each task, plus `summary.md`
(the table, mean score and total cost). `.work/` and `results/` are git-ignored.

**Cost.** The estimate uses `claude-opus-5-5` prices: $4 / MTok input, $20 / MTok output, $0.20 /
MTok cache reads, and $5 / MTok cache writes (1.25× input, 5-minute TTL). It ignores fallback
repricing; the invoice is what counts. A real episode re-sends the whole history on every turn, so
input grows with the number of turns and with how much source the agent reads
(`include_source: true`; each tool result is capped at 40 000 characters). Run one or two tasks
first, look at `usage` in their JSON, and only then run the full battery.

## Adding a prompt

1. Append a task to `prompts/battery.json`:
   ```json
   { "id": "team-calendar", "prompt": "A team calendar with a week view.",
     "expect": { "blocks": ["week-calendar"], "layout": "sidebar-layout" },
     "mustNot": ["data-table"] }
   ```
   Keep the prompt product-agnostic (a test rejects product names). Every id must exist in
   `kit-registry.json` with the right kind (`templates` → template, `blocks` → block, `components`
   → component, `layout` → layout); `test/battery.test.ts` checks this.
2. Script its dry-run turns in `test/fixtures/dry-run-transcript.json` (`tasks.<id>`: a list of
   `{ stop_reason, content, usage }` model turns ending in a `submit_page` call). A test requires
   every battery task to have a script.
3. Run `npx vitest run` and `npx tsx src/run.ts --dry-run --only <id>`.

When `pnpm registry` adds a template that answers a task, point the task's `expect.templates` at it
and script the dry run to use it (as done for `incident-kanban` → `incident-board` and
`docs-article` → `docs-article`).
