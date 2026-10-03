import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { compareVersions, runCodemods, selectTransforms, transforms } from '../src/index.js';

const dirs: string[] = [];
afterAll(() => Promise.all(dirs.map((d) => rm(d, { recursive: true, force: true }))));

async function project(files: Record<string, string>) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'gntik-codemods-'));
  dirs.push(dir);
  for (const [f, c] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(dir, f)), { recursive: true });
    await writeFile(path.join(dir, f), c);
  }
  return dir;
}

const FILES = {
  'src/App.tsx': "import { FlowBuilderPage } from '@gntik-ai/templates';\nimport { Link } from '@gntik-ai/ui';\n\nexport const App = () => <><FlowBuilderPage /><Link href=\"/\">Home</Link></>;\n",
  'src/chip.ts': "export const chip = 'bg-success/14 text-success-text';\n",
  'src/clean.ts': 'export const x = 1;\n',
  'src/broken.tsx': 'export const = ;\n',
  'src/types.d.ts': "declare const t: 'bg-success/14 text-success-text';\n",
  'node_modules/pkg/index.js': "export const chip = 'bg-success/14 text-success-text';\n",
  'dist/out.js': "export const chip = 'bg-success/14 text-success-text';\n",
};

describe('runCodemods', () => {
  it('is dry by default and reports per file', async () => {
    const cwd = await project(FILES);
    const r = await runCodemods({ cwd });
    expect(r.dry).toBe(true);
    expect(r.scanned).toBe(4);
    expect(r.transforms.map((t) => t.id)).toEqual(transforms.map((t) => t.id));
    expect(r.files.map((f) => [f.file, f.status])).toEqual([
      ['src/App.tsx', 'modified'],
      ['src/broken.tsx', 'error'],
      ['src/chip.ts', 'modified'],
    ]);
    const app = r.files[0]!;
    expect(app.transforms).toEqual(['templates-renamed-ids']);
    expect(app.reports).toEqual([{ transform: 'link-underline-default', line: 4, message: expect.stringContaining('without underline') }]);
    expect(r.outputs['src/chip.ts']).toBe("export const chip = 'bg-success/14 text-success-chip-text';\n");
    expect(await readFile(path.join(cwd, 'src/chip.ts'), 'utf8')).toBe(FILES['src/chip.ts']);
  });

  it('writes with dry: false, limited to the given transforms and files', async () => {
    const cwd = await project(FILES);
    const r = await runCodemods({ cwd, dry: false, transforms: ['chip-text-aliases'], files: ['src/chip.ts', 'src/App.tsx'] });
    expect(r.scanned).toBe(2);
    expect(r.files.map((f) => f.file)).toEqual(['src/chip.ts']);
    expect(await readFile(path.join(cwd, 'src/chip.ts'), 'utf8')).toContain('text-success-chip-text');
    expect(await readFile(path.join(cwd, 'src/App.tsx'), 'utf8')).toContain('FlowBuilderPage');
    await expect(runCodemods({ cwd, transforms: ['nope'] })).rejects.toThrow(/Unknown codemod/);
  });
});

describe('selectTransforms', () => {
  const ids = (o: Parameters<typeof selectTransforms>[0]) => selectTransforms(o).map((t) => t.id);

  it('selects by version range', () => {
    expect(ids({})).toHaveLength(transforms.length);
    expect(ids({ from: '0.1.0', to: '0.2.0' })).toHaveLength(transforms.length);
    expect(ids({ from: '0.2.0' })).toEqual([]);
    expect(ids({ from: '0.1.0', to: '0.1.5' })).toEqual([]);
    expect(ids({ from: '^0.1.2', to: 'latest' })).toHaveLength(transforms.length);
  });

  it('uses per-package versions, falling back to the lowest', () => {
    expect(ids({ from: { '@gntik-ai/ui': '0.2.0', '@gntik-ai/templates': '0.1.0' } })).toEqual(['templates-renamed-ids', 'flow-builder-controlled-console', 'chip-text-aliases']);
    expect(ids({ from: { '@gntik-ai/ui': 'workspace:*' } })).toHaveLength(transforms.length);
  });

  it('filters by only/skip, force ignores versions, validates input', () => {
    expect(ids({ only: ['chip-text-aliases'] })).toEqual(['chip-text-aliases']);
    expect(ids({ skip: ['link-underline-default', 'chip-text-aliases'] })).toEqual(['templates-renamed-ids', 'flow-builder-controlled-console']);
    expect(ids({ from: '1.0.0', only: ['chip-text-aliases'] })).toEqual([]);
    expect(ids({ from: '1.0.0', only: ['chip-text-aliases'], force: true })).toEqual(['chip-text-aliases']);
    expect(() => ids({ only: ['nope'] })).toThrow(/Unknown codemod/);
    expect(() => ids({ to: 'next' })).toThrow(/Invalid version/);
  });

  it('compares versions', () => {
    expect(compareVersions('0.10.0', '0.9.9')).toBe(1);
    expect(compareVersions('0.2.0-canary-1', '0.2.0')).toBe(-1);
    expect(compareVersions('~1.2', '1.2.0')).toBe(0);
  });
});
