/* ============================================================================
   @gntik-ai/evals · run.ts — CLI: run the battery, score it, write results
   ----------------------------------------------------------------------------
   tsx src/run.ts --dry-run                      replay the fixture, no API
   tsx src/run.ts --confirm-spend [--only a,b]   real run (costs money)
   Options: --only id,id · --model <id> · --effort low|medium|high|xhigh|max
            --out <dir> · --max-turns <n> · --no-fallback · --no-eager
   ============================================================================ */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { DEFAULT_CONFIG, runAgent, type AgentConfig, type Effort, type Episode, type MessagesClient } from './agent.js';
import { loadBattery, type Task } from './battery.js';
import { estimateCost, pricingFor, usd } from './cost.js';
import { loadFixture, replayClient } from './replay.js';
import { WEIGHTS, scorePage, type Dimension, type Scores } from './score.js';
import { EVALS_ROOT } from './tools.js';

const EFFORTS: Effort[] = ['low', 'medium', 'high', 'xhigh', 'max'];

export interface CliOptions {
  dryRun: boolean;
  confirmSpend: boolean;
  only?: string[];
  model: string;
  effort: Effort;
  out?: string;
  maxTurns: number;
  fallback: boolean;
  eager: boolean;
  help: boolean;
}

export function parseArgs(argv: string[]): CliOptions {
  const o: CliOptions = {
    dryRun: false,
    confirmSpend: false,
    model: DEFAULT_CONFIG.model,
    effort: DEFAULT_CONFIG.effort,
    maxTurns: DEFAULT_CONFIG.maxTurns,
    fallback: DEFAULT_CONFIG.fallback,
    eager: DEFAULT_CONFIG.eagerInputStreaming,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] ?? '';
    const [flag, inline] = a.includes('=') ? [a.slice(0, a.indexOf('=')), a.slice(a.indexOf('=') + 1)] : [a, undefined];
    const value = () => {
      const v = inline ?? argv[++i];
      if (v === undefined || v.startsWith('--')) throw new Error(`${flag} needs a value`);
      return v;
    };
    switch (flag) {
      case '--dry-run': o.dryRun = true; break;
      case '--confirm-spend': o.confirmSpend = true; break;
      case '--only': o.only = value().split(',').map((s) => s.trim()).filter(Boolean); break;
      case '--model': o.model = value(); break;
      case '--effort': {
        const e = value() as Effort;
        if (!EFFORTS.includes(e)) throw new Error(`--effort must be one of ${EFFORTS.join(', ')}`);
        o.effort = e;
        break;
      }
      case '--out': o.out = value(); break;
      case '--max-turns': {
        const n = Number(value());
        if (!Number.isInteger(n) || n < 1) throw new Error('--max-turns must be a positive integer');
        o.maxTurns = n;
        break;
      }
      case '--no-fallback': o.fallback = false; break;
      case '--no-eager': o.eager = false; break;
      case '-h': case '--help': o.help = true; break;
      default: throw new Error(`unknown option ${a}`);
    }
  }
  return o;
}

/** Where the SDK would find a credential, or undefined (mirrors the SDK's resolution order). */
export function credentialSource(env: NodeJS.ProcessEnv = process.env, home = os.homedir()): string | undefined {
  if (env.ANTHROPIC_API_KEY) return 'ANTHROPIC_API_KEY';
  if (env.ANTHROPIC_AUTH_TOKEN) return 'ANTHROPIC_AUTH_TOKEN';
  if (env.ANTHROPIC_PROFILE) return `ANTHROPIC_PROFILE=${env.ANTHROPIC_PROFILE}`;
  if (env.ANTHROPIC_FEDERATION_RULE_ID && env.ANTHROPIC_ORGANIZATION_ID && env.ANTHROPIC_SERVICE_ACCOUNT_ID && (env.ANTHROPIC_IDENTITY_TOKEN_FILE || env.ANTHROPIC_IDENTITY_TOKEN)) {
    return 'workload identity federation';
  }
  const dir = path.join(env.XDG_CONFIG_HOME || path.join(home, '.config'), 'anthropic');
  try {
    if (fs.readdirSync(dir).length) return `profile in ${dir} (ant auth login)`;
  } catch {
    /* no profile directory */
  }
  return undefined;
}

/* ── results ──────────────────────────────────────────────────────────────── */

export interface TaskResult {
  task: Task;
  episode: Episode;
  scores: Scores;
  costUsd: number;
}

const DIMS = Object.keys(WEIGHTS) as Dimension[];
const pct = (n: number) => `${Math.round(n * 100)}%`;

export function summaryMarkdown(results: TaskResult[], meta: { mode: string; model: string; effort: Effort; started: string }): string {
  const rows = results.map(({ task, episode: e, scores: s, costUsd }) => {
    const d = s.dimensions;
    return `| ${task.id} | ${e.outcome} | **${s.total}** | ${pct(d.brand.score)} | ${pct(d.kitOnly.score)} | ${d.typecheck.pass ? 'pass' : 'fail'} | ${pct(d.composition.score)} | ${e.toolCalls.length} | ${e.usage.inputTokens + e.usage.cacheReadTokens + e.usage.cacheWriteTokens} / ${e.usage.outputTokens} | ${usd(costUsd)} |`;
  });
  const n = results.length || 1;
  const mean = results.reduce((s, r) => s + r.scores.total, 0) / n;
  const cost = results.reduce((s, r) => s + r.costUsd, 0);
  const submitted = results.filter((r) => r.episode.outcome === 'submitted').length;
  return [
    `# gntik-ui agent evals — ${meta.started}`,
    '',
    `Mode: **${meta.mode}** · model \`${meta.model}\` · effort \`${meta.effort}\` · ${results.length} tasks · ${submitted} submitted`,
    '',
    `**Mean score: ${mean.toFixed(1)} / 100** · estimated cost ${usd(cost)}${meta.mode === 'dry-run' ? ' (synthetic usage from the fixture)' : ''}`,
    '',
    '| task | outcome | total | brand | kit-only | typecheck | composition | tool calls | tokens in / out | est. cost |',
    '| --- | --- | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: |',
    ...rows,
    '',
    `Weights: ${DIMS.map((d) => `${d} ${WEIGHTS[d]}`).join(' · ')} (see README.md).`,
    '',
  ].join('\n');
}

function writeResults(dir: string, results: TaskResult[], summary: string): void {
  fs.mkdirSync(dir, { recursive: true });
  for (const r of results) {
    const { submitted, ...episode } = r.episode;
    const record = { task: r.task, outcome: r.episode.outcome, scores: r.scores, usage: r.episode.usage, costUsd: r.costUsd, transcript: episode, submitted: submitted ?? null };
    fs.writeFileSync(path.join(dir, `${r.task.id}.json`), `${JSON.stringify(record, null, 2)}\n`);
    if (submitted) fs.writeFileSync(path.join(dir, `${r.task.id}.tsx`), submitted.code);
  }
  fs.writeFileSync(path.join(dir, 'summary.md'), summary);
}

/* ── main ─────────────────────────────────────────────────────────────────── */

const HELP = `Usage: tsx src/run.ts [--dry-run | --confirm-spend] [options]
  --dry-run            replay test/fixtures/dry-run-transcript.json (no API calls, no cost)
  --confirm-spend      required for a real run (calls the Claude API; costs money)
  --only id,id         run a subset of prompts/battery.json
  --model <id>         default ${DEFAULT_CONFIG.model}
  --effort <level>     low | medium | high | xhigh | max (default ${DEFAULT_CONFIG.effort})
  --out <dir>          default results/<timestamp>/
  --max-turns <n>      default ${DEFAULT_CONFIG.maxTurns}
  --no-fallback        disable the server-side refusal fallback (fallbacks: "default")
  --no-eager           disable eager_input_streaming on the tools`;

export async function main(argv = process.argv.slice(2)): Promise<number> {
  let opts: CliOptions;
  try {
    opts = parseArgs(argv);
  } catch (e) {
    console.error(`${(e as Error).message}\n\n${HELP}`);
    return 2;
  }
  if (opts.help) {
    console.log(HELP);
    return 0;
  }

  let tasks = loadBattery();
  if (opts.only) {
    const unknown = opts.only.filter((id) => !tasks.some((t) => t.id === id));
    if (unknown.length) {
      console.error(`Unknown task id(s): ${unknown.join(', ')}. Known: ${tasks.map((t) => t.id).join(', ')}`);
      return 2;
    }
    tasks = tasks.filter((t) => opts.only?.includes(t.id));
  }

  const fixture = opts.dryRun ? loadFixture() : undefined;
  let makeClient: (task: Task) => MessagesClient | undefined;
  if (fixture) {
    makeClient = (task) => (fixture.tasks[task.id] ? replayClient(fixture.tasks[task.id] ?? [], opts.model) : undefined);
  } else {
    const source = credentialSource();
    if (!source || !opts.confirmSpend) {
      console.error(
        [
          'Refusing to run against the Claude API.',
          source ? `Credential found (${source}).` : 'No credential found (ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN, an `ant auth login` profile or WIF variables).',
          opts.confirmSpend ? '' : 'A real run spends money: pass --confirm-spend to proceed (or --dry-run to replay the fixture).',
        ].filter(Boolean).join('\n'),
      );
      return 2;
    }
    if (!pricingFor(opts.model).known) console.warn(`No pricing for ${opts.model}; cost estimates use ${DEFAULT_CONFIG.model} prices.`);
    const anthropic = new Anthropic();
    const client: MessagesClient = { stream: (params) => anthropic.beta.messages.stream(params) };
    makeClient = () => client;
  }

  const config: Partial<AgentConfig> = { model: opts.model, effort: opts.effort, maxTurns: opts.maxTurns, fallback: opts.fallback, eagerInputStreaming: opts.eager };
  const started = new Date().toISOString();
  const outDir = path.resolve(opts.out ?? path.join(EVALS_ROOT, 'results', started.replace(/[:.]/g, '-')));
  const results: TaskResult[] = [];
  console.log(`${opts.dryRun ? 'Dry run (fixture replay, no API calls)' : 'REAL run'} · ${opts.model} · effort ${opts.effort} · ${tasks.length} task(s)`);

  for (const task of tasks) {
    const client = makeClient(task);
    if (!client) {
      console.log(`  ${task.id.padEnd(20)} skipped (no scripted transcript)`);
      continue;
    }
    const episode = await runAgent(task, client, config);
    const scores = scorePage(task, episode.submitted?.code, episode.toolCalls.length);
    const costUsd = estimateCost(episode.usage, opts.model);
    results.push({ task, episode, scores, costUsd });
    const d = scores.dimensions;
    console.log(
      `  ${task.id.padEnd(20)} ${episode.outcome.padEnd(10)} ${String(scores.total).padStart(5)}  brand ${pct(d.brand.score).padStart(4)} · kit ${pct(d.kitOnly.score).padStart(4)} · tsc ${d.typecheck.pass ? 'pass' : 'FAIL'} · recall ${pct(d.composition.score).padStart(4)} · ${episode.toolCalls.length} calls · ${usd(costUsd)}${episode.error ? ` · ${episode.error}` : ''}`,
    );
  }

  const summary = summaryMarkdown(results, { mode: opts.dryRun ? 'dry-run' : 'real', model: opts.model, effort: opts.effort, started });
  writeResults(outDir, results, summary);
  const mean = results.length ? results.reduce((s, r) => s + r.scores.total, 0) / results.length : 0;
  const cost = results.reduce((s, r) => s + r.costUsd, 0);
  const usage = results.reduce((s, r) => s + r.episode.usage.inputTokens + r.episode.usage.cacheReadTokens + r.episode.usage.cacheWriteTokens, 0);
  const output = results.reduce((s, r) => s + r.episode.usage.outputTokens, 0);
  console.log(`\nMean score ${mean.toFixed(1)}/100 · ${usage} input (incl. cache) / ${output} output tokens · estimated cost ${usd(cost)}${opts.dryRun ? ' (synthetic usage)' : ''}`);
  const shown = path.relative(process.cwd(), outDir);
  console.log(`Results: ${shown && !shown.startsWith('..') ? shown : outDir}/summary.md`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then((code) => process.exit(code), (e: unknown) => {
    console.error(e);
    process.exit(1);
  });
}
