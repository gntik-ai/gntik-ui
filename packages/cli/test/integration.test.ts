import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { readFile, writeFile } from 'node:fs/promises';
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

  it('search hook finds the ui-hooks item, a kind this CLI already accepts', async () => {
    const r = await cli(['search', 'hook', '--json', '--registry', REPO]);
    expect(r.code).toBe(0);
    const hooks = r.json.items.find((i: { id: string }) => i.id === 'ui-hooks');
    expect(hooks).toMatchObject({ id: 'ui-hooks', kind: 'component', group: 'Hooks' });
  });

  it('add ui-hooks recommends importing the hooks from the hooks subpath', async () => {
    const dir = await viteProject();
    const r = await cli(['add', 'ui-hooks', '--json', '--dry-run', '--no-install', '--cwd', dir, '--registry', REPO]);
    expect(r.code).toBe(0);
    expect(r.json.imports).toHaveLength(1);
    expect(r.json.imports[0]).toMatch(/^import \{ .*\buseToast\b.*\buseFitCount\b.* \} from '@gntik-ai\/ui\/hooks';$/);
    expect(r.json.imports[0]).not.toMatch(/\bHooks\b/);
  });

  it('eject ui-hooks names the hooks and a local entry, and finds subpath usages', async () => {
    const dir = await viteProject();
    await writeFile(
      path.join(dir, 'src/App.tsx'),
      "import { useToast } from '@gntik-ai/ui/hooks';\nimport { useOs } from '@gntik-ai/ui';\nexport default () => null;\n",
    );
    const r = await cli(['eject', 'ui-hooks', '--json', '--dry-run', '--no-install', '--cwd', dir, '--registry', REPO]);
    expect(r.code).toBe(0);
    expect(r.json.localImport).toBe('src/components/hooks');
    expect(r.json.exports).toEqual(expect.arrayContaining(['useToast', 'useFitCount', 'useClipboard']));
    expect(r.json.exports).not.toContain('Hooks');
    expect(
      r.json.usages
        .map((u: { names: string[] }) => u.names)
        .flat()
        .sort(),
    ).toEqual(['useOs', 'useToast']);
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
