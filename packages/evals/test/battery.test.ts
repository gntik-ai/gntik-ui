import { describe, expect, it } from 'vitest';
import { loadBattery, referencedIds } from '../src/battery.js';
import { loadFixture } from '../src/replay.js';
import { kit } from '../src/tools.js';

const k = kit();
const tasks = loadBattery();

describe('prompt battery', () => {
  it('has 12 tasks with unique ids', () => {
    expect(tasks).toHaveLength(12);
    expect(new Set(tasks.map((t) => t.id)).size).toBe(12);
  });

  it('references only ids that exist in kit-registry.json, with the right kind', () => {
    const problems: string[] = [];
    const check = (taskId: string, id: string, kind?: string) => {
      const item = k.byId.get(id);
      if (!item) problems.push(`${taskId}: unknown id "${id}"`);
      else if (kind && item.kind !== kind) problems.push(`${taskId}: "${id}" is a ${item.kind}, expected ${kind}`);
    };
    for (const t of tasks) {
      t.expect.templates?.forEach((id) => check(t.id, id, 'template'));
      t.expect.blocks?.forEach((id) => check(t.id, id, 'block'));
      t.expect.components?.forEach((id) => check(t.id, id, 'component'));
      if (t.expect.layout) check(t.id, t.expect.layout, 'layout');
      t.mustNot?.forEach((id) => check(t.id, id));
      expect(referencedIds(t).length, `${t.id} expects nothing`).toBeGreaterThan(0);
    }
    expect(problems).toEqual([]);
  });

  it('prompts are product-agnostic', () => {
    for (const t of tasks) expect(t.prompt).not.toMatch(/musematic|falcone|llmwiki|gntik/i);
  });

  it('the dry-run fixture scripts every battery task', () => {
    expect(Object.keys(loadFixture().tasks).sort()).toEqual(tasks.map((t) => t.id).sort());
  });
});
