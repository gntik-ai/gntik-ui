/* ============================================================================
   @gntik-ai/evals · battery.ts — the prompt battery (prompts/battery.json)
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { EVALS_ROOT } from './tools.js';

export interface Expectation {
  /** Alternatives: using any one of them satisfies the template expectation. */
  templates?: string[];
  /** Every block is expected (directly, or through a template that composes it). */
  blocks?: string[];
  /** Every component is expected. */
  components?: string[];
  /** Layout id (directly, or through the template's / ConsoleShell's layout). */
  layout?: string;
}

export interface Task {
  id: string;
  prompt: string;
  expect: Expectation;
  /** Kit ids the page must not use. */
  mustNot?: string[];
}

export const BATTERY_FILE = path.join(EVALS_ROOT, 'prompts', 'battery.json');

export function loadBattery(file = BATTERY_FILE): Task[] {
  const tasks = JSON.parse(fs.readFileSync(file, 'utf8')) as Task[];
  const seen = new Set<string>();
  for (const t of tasks) {
    if (!t.id || !t.prompt || !t.expect) throw new Error(`battery: malformed task ${JSON.stringify(t)}`);
    if (seen.has(t.id)) throw new Error(`battery: duplicate id "${t.id}"`);
    seen.add(t.id);
  }
  return tasks;
}

/** Every kit id a task references (expectations + mustNot). */
export function referencedIds(t: Task): string[] {
  const e = t.expect;
  return [...(e.templates ?? []), ...(e.blocks ?? []), ...(e.components ?? []), ...(e.layout ? [e.layout] : []), ...(t.mustNot ?? [])];
}
