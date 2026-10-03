import { existsSync } from 'node:fs';
import { mkdir, readFile, symlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it } from 'vitest';
import { parseCliArgs } from '../src/args.js';
import { declaredVersions } from '../src/commands/upgrade.js';
import { cli, tempProject } from './helpers.js';

interface Calls {
  select: unknown[];
  run: unknown[];
  result?: unknown;
}
const g = globalThis as typeof globalThis & { __gntikCodemods?: Calls };

/** A stand-in @gntik-ai/codemods: records the calls the CLI makes and returns canned results. */
const FAKE_MODULE = `
const T = (id, pkg, reportOnly = false) => ({ id, package: pkg, fromVersion: '0.1.0', toVersion: '0.2.0', description: id + ' description', reportOnly });
export const VERSION = '9.9.9';
export const transforms = [T('rename-a', '@gntik-ai/templates'), T('report-b', '@gntik-ai/ui', true)];
const calls = () => globalThis.__gntikCodemods;
export function selectTransforms(options) {
  calls().select.push(options);
  if (options.from === '0.2.0') return [];
  return transforms.filter((t) => !(options.skip ?? []).includes(t.id) && (!options.only || options.only.includes(t.id)));
}
export async function runCodemods(options) {
  calls().run.push(options);
  return calls().result ?? {
    scanned: 3,
    files: [
      { file: 'src/z.tsx', status: 'unchanged', transforms: [], reports: [{ transform: 'report-b', line: 4, message: 'Link without underline' }] },
      { file: 'src/a.tsx', status: 'modified', transforms: ['rename-a'], reports: [] },
    ],
  };
}
`;

async function projectWithCodemods(deps: Record<string, string> = { '@gntik-ai/ui': '^0.1.0', '@gntik-ai/templates': '~0.1.3', react: '^19.0.0' }) {
  return tempProject({
    'package.json': JSON.stringify({ name: 'app', dependencies: deps }),
    'pnpm-lock.yaml': 'lockfileVersion: 9\n',
    'node_modules/@gntik-ai/codemods/package.json': JSON.stringify({ name: '@gntik-ai/codemods', type: 'module', exports: { '.': './index.js' } }),
    'node_modules/@gntik-ai/codemods/index.js': FAKE_MODULE,
  });
}

beforeEach(() => {
  g.__gntikCodemods = { select: [], run: [] };
});
const calls = () => g.__gntikCodemods as Calls;

describe('upgrade', () => {
  it('prints the install command when @gntik-ai/codemods is not resolvable', async () => {
    const cwd = await tempProject({ 'package.json': '{"name":"x"}', 'package-lock.json': '{}' });
    const r = await cli(['upgrade', '--json', '--cwd', cwd]);
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({ ok: false, command: 'upgrade', codemods: { installed: false, install: 'npm install -D @gntik-ai/codemods' }, error: { code: 'CODEMODS' } });
    const pnpm = await tempProject({ 'package.json': '{"name":"x"}', 'pnpm-lock.yaml': '' });
    const t = await cli(['upgrade', '--cwd', pnpm]);
    expect(t.stdout).toContain('pnpm add -D @gntik-ai/codemods');
    expect(t.stderr).toContain('not found');
  });

  it('dry run by default, versions detected from package.json, stable JSON shape', async () => {
    const cwd = await projectWithCodemods();
    const r = await cli(['upgrade', '--json', '--cwd', cwd]);
    expect(r.code).toBe(0);
    expect(Object.keys(r.json)).toEqual(['ok', 'command', 'dryRun', 'from', 'to', 'codemods', 'transforms', 'scanned', 'files', 'changed', 'reports', 'errors']);
    expect(r.json).toMatchObject({
      ok: true,
      dryRun: true,
      from: { '@gntik-ai/templates': '0.1.3', '@gntik-ai/ui': '0.1.0' },
      to: 'latest',
      codemods: { installed: true, version: '9.9.9', install: null },
      scanned: 3,
      changed: ['src/a.tsx'],
      reports: [{ file: 'src/z.tsx', line: 4, transform: 'report-b', message: 'Link without underline' }],
      errors: [],
    });
    expect(r.json.files.map((f: { file: string }) => f.file)).toEqual(['src/a.tsx', 'src/z.tsx']);
    expect(Object.keys(r.json.transforms[0])).toEqual(['id', 'package', 'fromVersion', 'toVersion', 'reportOnly', 'description']);
    expect(calls().select).toEqual([{ from: { '@gntik-ai/templates': '0.1.3', '@gntik-ai/ui': '0.1.0' }, to: 'latest', only: undefined, skip: [], force: false }]);
    expect(calls().run).toEqual([{ cwd, transforms: ['rename-a', 'report-b'], dry: true, files: undefined }]);
  });

  it('human output names the changes and warnings', async () => {
    const cwd = await projectWithCodemods();
    const r = await cli(['upgrade', '--cwd', cwd]);
    expect(r.stdout).toContain('Would modify 1 file(s):');
    expect(r.stdout).toContain('src/a.tsx (rename-a)');
    expect(r.stdout).toContain('src/z.tsx:4 [report-b] Link without underline');
    expect(r.stdout).toContain('--apply');
  });

  it('--apply, --codemod, --skip-codemod, --from/--to and paths reach the module', async () => {
    const cwd = await projectWithCodemods();
    const r = await cli(['upgrade', 'src', 'app/page.tsx', '--apply', '--codemod', 'rename-a,report-b', '--skip-codemod', 'report-b', '--from', '0.1.0', '--to', '0.2.0', '--json', '--cwd', cwd]);
    expect(r.code).toBe(0);
    expect(r.json.dryRun).toBe(false);
    expect(calls().select[0]).toEqual({ from: '0.1.0', to: '0.2.0', only: ['rename-a', 'report-b'], skip: ['report-b'], force: true });
    expect(calls().run[0]).toEqual({ cwd, transforms: ['rename-a'], dry: false, files: ['src', 'app/page.tsx'] });
    expect((await cli(['upgrade', '--apply', '--cwd', cwd])).stdout).toContain('Modified 1 file(s):');
  });

  it('nothing to do when no codemod applies; --list marks the selection without running', async () => {
    const cwd = await projectWithCodemods();
    const none = await cli(['upgrade', '--from', '0.2.0', '--json', '--cwd', cwd]);
    expect(none.json).toMatchObject({ ok: true, transforms: [], scanned: 0, changed: [] });
    expect(calls().run).toEqual([]);
    const list = await cli(['upgrade', '--list', '--skip-codemod', 'report-b', '--json', '--cwd', cwd]);
    expect(list.json.transforms.map((t: { id: string; selected: boolean }) => [t.id, t.selected])).toEqual([['rename-a', true], ['report-b', false]]);
    expect(calls().run).toEqual([]);
    expect((await cli(['upgrade', '--list', '--cwd', cwd])).stdout).toMatch(/ID\s+PACKAGE\s+VERSIONS\s+SELECTED/);
  });

  it('every codemod when the project declares no @gntik-ai versions', async () => {
    const cwd = await projectWithCodemods({ '@gntik-ai/ui': 'workspace:*' });
    const r = await cli(['upgrade', '--json', '--cwd', cwd]);
    expect(r.json.from).toBeNull();
    expect(calls().select[0]).toMatchObject({ from: undefined });
  });

  it('usage errors, unknown codemods and failed files', async () => {
    const cwd = await projectWithCodemods();
    expect((await cli(['upgrade', '--codemod', 'nope', '--json', '--cwd', cwd])).json.error.code).toBe('NOT_FOUND');
    expect((await cli(['upgrade', '--codemod', 'nope', '--cwd', cwd])).code).toBe(3);
    expect((await cli(['upgrade', '--from', 'next', '--cwd', cwd])).code).toBe(2);
    expect((await cli(['upgrade', '--apply', '--dry-run', '--cwd', cwd])).code).toBe(2);
    expect((await cli(['list', '--apply'])).code).toBe(2);
    calls().result = { scanned: 1, files: [{ file: 'src/bad.tsx', status: 'error', transforms: [], reports: [], error: 'Unexpected token' }] };
    const r = await cli(['upgrade', '--json', '--cwd', cwd]);
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({ ok: false, errors: [{ file: 'src/bad.tsx', message: 'Unexpected token' }], error: { code: 'ERROR' } });
  });

  it('declaredVersions and repeatable flags', () => {
    expect(declaredVersions({ dependencies: { '@gntik-ai/ui': '^0.3.1', '@gntik-ai/codemods': '0.1.0', lodash: '1.0.0' }, devDependencies: { '@gntik-ai/cli': 'file:../cli' } })).toEqual({ '@gntik-ai/ui': '0.3.1' });
    expect(parseCliArgs(['upgrade', '--codemod', 'a,b', '--codemod', 'c']).flags.codemods).toEqual(['a', 'b', 'c']);
  });
});

const CODEMODS_PKG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../codemods');
describe.skipIf(!existsSync(path.join(CODEMODS_PKG, 'dist/index.js')))('upgrade with the real @gntik-ai/codemods', () => {
  it('migrates a project end to end', async () => {
    const cwd = await tempProject({
      'package.json': JSON.stringify({ name: 'app', dependencies: { '@gntik-ai/templates': '^0.1.0' } }),
      'src/App.tsx': "import { MfaChallengePage } from '@gntik-ai/templates';\n\nexport const App = () => <MfaChallengePage />;\n",
    });
    await mkdir(path.join(cwd, 'node_modules/@gntik-ai'), { recursive: true });
    await symlink(CODEMODS_PKG, path.join(cwd, 'node_modules/@gntik-ai/codemods'), 'dir');
    const dry = await cli(['upgrade', '--json', '--cwd', cwd]);
    expect(dry.json).toMatchObject({ ok: true, changed: ['src/App.tsx'] });
    const applied = await cli(['upgrade', '--apply', '--json', '--cwd', cwd]);
    expect(applied.code).toBe(0);
    expect(await readFile(path.join(cwd, 'src/App.tsx'), 'utf8')).toBe("import { MfaPage } from '@gntik-ai/templates';\n\nexport const App = () => <MfaPage />;\n");
  });
});
