import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { cli, viteProject } from './helpers.js';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const hasRegistry = existsSync(path.join(REPO, 'kit-registry.json'));

describe.skipIf(!hasRegistry)('against the repo kit-registry.json', () => {
  it('list --json', async () => {
    const r = await cli(['list', '--json', '--registry', REPO]);
    expect(r.code).toBe(0);
    expect(r.json.count).toBeGreaterThan(0);
    expect(r.json.items.map((i: { id: string }) => i.id)).toContain('dialog');
  });

  it('docs dialog reads the real doc file', async () => {
    const r = await cli(['docs', 'dialog', '--json', '--registry', REPO]);
    expect(r.code).toBe(0);
    expect(r.json.item.id).toBe('dialog');
    expect(r.json.keyboard.length).toBeGreaterThan(0);
    expect(r.json.keyboard.map((k: { key: string }) => k.key).join(' ')).toMatch(/Esc/);
  });

  it('every file listed in the registry exists', async () => {
    const r = await cli(['list', '--json', '--registry', REPO]);
    for (const { id } of r.json.items) {
      const d = await cli(['docs', id, '--json', '--registry', REPO]);
      for (const f of d.json.item.files) expect(existsSync(path.join(REPO, f.path)), f.path).toBe(true);
    }
  });

  it('eject dialog keeps the relative utils import working', async () => {
    const dir = await viteProject();
    const r = await cli(['eject', 'dialog', '--json', '--no-install', '--cwd', dir, '--registry', REPO]);
    expect(r.code).toBe(0);
    const code = await readFile(path.join(dir, 'src/components/ui/dialog/Dialog.tsx'), 'utf8');
    expect(code).toContain("from '../../utils/cn'");
    expect(existsSync(path.join(dir, 'src/components/utils/cn.ts'))).toBe(true);
  });
});
