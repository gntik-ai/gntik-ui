import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { scaffoldPage } from '../../mcp/src/scaffold.js';
import type { Task } from '../src/battery.js';
import { WEIGHTS, kitImports, scoreComposition, scoreEfficiency, scoreKitOnly, scorePage, usedKitIds } from '../src/score.js';
import { EVALS_ROOT, kit } from '../src/tools.js';

const page = (name: string) => fs.readFileSync(path.join(EVALS_ROOT, 'test', 'fixtures', 'pages', `${name}.tsx`), 'utf8');
const k = kit();
const members: Task = {
  id: 'members',
  prompt: 'Build a members management page.',
  expect: { templates: ['settings-members'], blocks: ['members-table', 'invite-members-dialog'], layout: 'settings-layout' },
  mustNot: ['data-table'],
};
const goodCode = scaffoldPage(k, { template: 'settings-members' }).code ?? '';

describe('score', () => {
  it('weights add up to 100', () => {
    expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
  });

  it('a scaffolded template page scores 100', () => {
    const s = scorePage({ ...members, id: 'score-good' }, goodCode, 4);
    expect(s.dimensions.brand.pass).toBe(true);
    expect(s.dimensions.kitOnly.pass).toBe(true);
    expect(s.dimensions.typecheck.pass).toBe(true);
    expect(s.dimensions.composition.detail[0]).toBe('recall 4/4');
    expect(s.total).toBe(100);
  }, 60_000);

  it('brand violations fail the brand dimension (and kit-only, for the colour literal)', () => {
    const s = scorePage({ ...members, id: 'score-brand' }, page('brand-violation'), 3, { typecheck: false });
    expect(s.dimensions.brand.pass).toBe(false);
    expect(s.dimensions.brand.score).toBe(0);
    expect(s.dimensions.brand.detail.join('\n')).toMatch(/palette-class/);
    expect(s.dimensions.kitOnly.pass).toBe(false);
    expect(s.total).toBeLessThan(60);
  });

  it('a non-kit import fails kit-only', () => {
    const r = scoreKitOnly(page('non-kit-import'));
    expect(r.pass).toBe(false);
    expect(r.detail.join('\n')).toMatch(/import of "@mui\/material"/);
    expect(scoreKitOnly("import '@gntik-ai/ui/styles.css';\nexport default () => null;").pass).toBe(false);
    expect(scoreKitOnly("import { useState } from 'react';\nimport { Button } from '@gntik-ai/ui';").pass).toBe(true);
  });

  it('own styling is a soft penalty; comments are ignored', () => {
    const r = scoreKitOnly('// className="x" #fff\n<div className="p-4" />\n<div style={{ padding: 4 }} />');
    expect(r.pass).toBe(true);
    expect(r.score).toBeCloseTo(0.8);
  });

  it('a type error fails typecheck', () => {
    const s = scorePage({ ...members, id: 'score-types' }, page('type-error'), 3);
    expect(s.dimensions.typecheck.pass).toBe(false);
    expect(s.dimensions.typecheck.detail.join('\n')).toMatch(/TS2305/);
    expect(s.dimensions.typecheck.detail.join('\n')).toMatch(/TS2322/);
  }, 60_000);

  it('composition: template credit covers its blocks and layout; partial recall; mustNot penalty', () => {
    expect(scoreComposition(members, goodCode, k).recall).toBe(1);
    const blocksOnly = "import { MembersTable, DataTable } from '@gntik-ai/blocks';\nexport default function P() { return <><MembersTable /><DataTable /></>; }";
    const r = scoreComposition(members, blocksOnly, k);
    expect(r.recall).toBe(0.25);
    expect(r.score).toBe(0);
    expect(r.detail).toContain('mustNot used: data-table');
    const unused = "import { MembersTable } from '@gntik-ai/blocks';\nexport default function P() { return null; }";
    expect(scoreComposition(members, unused, k).recall).toBe(0);
  });

  it('ConsoleShell credits the console layout; aliases resolve', () => {
    const { all, direct } = usedKitIds(page('incident-kanban'), k);
    expect([...direct].sort()).toEqual(['card', 'grid', 'page', 'page-header', 'stack', 'status-tag']);
    expect(all.has('sidebar-layout')).toBe(true);
    expect(kitImports("import { Card as Box, type CardProps } from '@gntik-ai/ui';")).toEqual([{ pkg: '@gntik-ai/ui', name: 'Card', local: 'Box' }]);
  });

  it('efficiency and a missing submission', () => {
    expect(scoreEfficiency(6).score).toBe(1);
    expect(scoreEfficiency(13).score).toBe(0.5);
    expect(scoreEfficiency(25).score).toBe(0);
    expect(scorePage(members, undefined, 3).total).toBe(0);
  });
});
