import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { searchItems, parseDocFile } from '../src/commands/query.js';
import { loadRegistry, resolveSource } from '../src/registry.js';
import { cli, FIXTURES } from './helpers.js';

describe('registry', () => {
  it('loads from a local checkout dir or a kit-registry.json path', async () => {
    const reg = await loadRegistry(FIXTURES, '/');
    expect(reg.source).toEqual({ type: 'local', base: FIXTURES });
    expect(reg.get('button')?.files).toHaveLength(3);
    const viaFile = await loadRegistry(path.join(FIXTURES, 'kit-registry.json'), '/');
    expect(viaFile.items.length).toBe(reg.items.length);
    expect(await reg.read('packages/ui/src/utils/tv.ts')).toContain('tailwind-variants');
  });

  it('resolves URL sources', async () => {
    const r = await resolveSource('https://example.com/kit', '/');
    expect(r).toEqual({ source: { type: 'url', base: 'https://example.com/kit/' }, file: 'https://example.com/kit/kit-registry.json' });
  });

  it('resolves registryDependencies recursively, dependencies first', async () => {
    const reg = await loadRegistry(FIXTURES, '/');
    expect(reg.closure(['dashboard']).map((i) => i.id)).toEqual(['stat-card', 'ui-utils', 'spinner', 'button', 'stats-row', 'app-shell', 'dashboard']);
    expect(() => reg.closure(['nope'])).toThrow(/Unknown item/);
  });

  it('fails cleanly on a missing registry', async () => {
    const r = await cli(['list', '--json', '--registry', '/definitely/missing']);
    expect(r.code).toBe(1);
    expect(r.json.error.code).toBe('REGISTRY');
  });
});

describe('list / search / docs', () => {
  it('list --json returns every item with a stable shape', async () => {
    const r = await cli(['list', '--json', '--registry', FIXTURES]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ ok: true, command: 'list', count: 8 });
    expect(Object.keys(r.json.items[0])).toEqual(['id', 'kind', 'name', 'package', 'group', 'status', 'description']);
  });

  it('list filters by kind and group; table output for humans', async () => {
    expect((await cli(['list', '--json', '--kind', 'block', '--registry', FIXTURES])).json.items.map((i: { id: string }) => i.id)).toEqual(['stat-card', 'stats-row']);
    expect((await cli(['list', '--json', '--group', 'overlays', '--registry', FIXTURES])).json.count).toBe(1);
    const t = await cli(['list', '--registry', FIXTURES]);
    expect(t.stdout).toMatch(/^ID\s+KIND\s+GROUP/);
    expect((await cli(['list', '--kind', 'widget', '--registry', FIXTURES])).code).toBe(2);
  });

  it('search ranks exact and fuzzy matches', async () => {
    const r = await cli(['search', 'dialog', '--json', '--registry', FIXTURES]);
    expect(r.json.items[0]).toMatchObject({ id: 'dialog', score: 100 });
    const fuzzy = await cli(['search', 'btn', '--json', '--registry', FIXTURES]);
    expect(fuzzy.json.items[0].id).toBe('button');
    const multi = await cli(['search', 'kpi row', '--json', '--registry', FIXTURES]);
    expect(multi.json.items.map((i: { id: string }) => i.id)).toEqual(['stats-row']);
    expect((await cli(['search', 'zzzz', '--json', '--registry', FIXTURES])).json.count).toBe(0);
  });

  it('searchItems matches group and description', async () => {
    const reg = await loadRegistry(FIXTURES, '/');
    expect(searchItems(reg.items, 'overlays')[0]?.item.id).toBe('dialog');
    expect(searchItems(reg.items, 'indicator')[0]?.item.id).toBe('spinner');
  });

  it('docs prints the keyboard table parsed from the doc file', async () => {
    const r = await cli(['docs', 'button', '--json', '--registry', FIXTURES]);
    expect(r.json).toMatchObject({ ok: true, command: 'docs', primitive: '@base-ui/react/button', pattern: 'button' });
    expect(r.json.keyboard).toEqual([
      { key: 'Enter', behaviour: 'Activates the button' },
      { key: 'Space', behaviour: 'Activates the button' },
      { key: 'Tab', behaviour: 'Moves focus; a loading button stays focusable' },
    ]);
    const text = await cli(['docs', 'dialog', '--registry', FIXTURES]);
    expect(text.stdout).toContain('Keyboard:');
    expect(text.stdout).toContain('Shift + Tab');
    expect((await cli(['docs', 'nope', '--json', '--registry', FIXTURES])).code).toBe(3);
  });

  it('parseDocFile handles escaped quotes and missing tables', () => {
    expect(parseDocFile(`keyboard: [['\\'a\\'', "b"]]`).keyboard).toEqual([{ key: "'a'", behaviour: 'b' }]);
    expect(parseDocFile('export const doc = {}').keyboard).toEqual([]);
  });
});
