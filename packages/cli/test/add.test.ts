import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { rewriteSpecifiers } from '../src/copy.js';
import { cli, FIXTURES, viteProject } from './helpers.js';

const read = (dir: string, f: string) => readFile(path.join(dir, f), 'utf8');

describe('add', () => {
  it('component: installs the package and prints the import line', async () => {
    const dir = await viteProject();
    const r = await cli(['add', 'button', 'dialog', '--json', '--cwd', dir, '--registry', FIXTURES]);
    expect(r.code).toBe(0);
    expect(r.json.files).toEqual([]);
    expect(r.json.imports).toEqual([
      "import { Button, IconButton } from '@gntik-ai/ui';",
      "import { Dialog, DialogTrigger, DialogContent } from '@gntik-ai/ui';",
    ]);
    expect(r.json.install).toMatchObject({ packages: ['@gntik-ai/ui'], ran: true, exitCode: 0 });
    expect(r.execs).toEqual([{ cmd: 'pnpm', args: ['add', '@gntik-ai/ui'], cwd: dir }]);
  });

  it('component: --dry-run and --no-install never run the installer', async () => {
    const dir = await viteProject();
    const dry = await cli(['add', 'button', '--json', '--dry-run', '--cwd', dir, '--registry', FIXTURES]);
    expect(dry.json.install).toMatchObject({ commands: ['pnpm add @gntik-ai/ui'], ran: false });
    expect(dry.execs).toEqual([]);
    const noInstall = await cli(['add', 'button', '--no-install', '--cwd', dir, '--registry', FIXTURES]);
    expect(noInstall.execs).toEqual([]);
    expect(noInstall.stdout).toContain("import { Button, IconButton } from '@gntik-ai/ui';");
  });

  it('block --dry-run plans the copy without writing', async () => {
    const dir = await viteProject();
    const r = await cli(['add', 'stats-row', '--json', '--dry-run', '--cwd', dir, '--registry', FIXTURES]);
    expect(r.code).toBe(0);
    expect(r.json.files.map((f: { target: string; status: string }) => [f.target, f.status])).toEqual([
      ['src/components/blocks/stat-card/StatCard.tsx', 'create'],
      ['src/components/blocks/stat-card/index.ts', 'create'],
      ['src/components/blocks/stats-row/StatsRow.tsx', 'create'],
      ['src/components/blocks/stats-row/index.ts', 'create'],
    ]);
    expect(r.json.written).toEqual([]);
    expect(existsSync(path.join(dir, 'src/components/blocks'))).toBe(false);
  });

  it('template: copies the closure and rewrites imports', async () => {
    const dir = await viteProject();
    const r = await cli(['add', 'dashboard', '--json', '--no-install', '--cwd', dir, '--registry', FIXTURES]);
    expect(r.code).toBe(0);
    expect(r.json.written).toContain('src/components/templates/dashboard/DashboardPage.tsx');
    const row = await read(dir, 'src/components/blocks/stats-row/StatsRow.tsx');
    expect(row).toContain("import { Button } from '@gntik-ai/ui';");
    expect(row).toContain("import { cn } from '@gntik-ai/ui';");
    expect(row).toContain("import { StatCard } from '../stat-card/StatCard';");
    const page = await read(dir, 'src/components/templates/dashboard/DashboardPage.tsx');
    expect(page).toContain("import { StatsRow } from '../../blocks/stats-row';");
    expect(r.json.items.find((i: { id: string }) => i.id === 'button')).toMatchObject({ mode: 'package', requested: false });
    expect(r.json.install.packages).toEqual(['@gntik-ai/ui', 'lucide-react']);
    expect(r.json.rewrites).toContainEqual({ file: 'src/components/blocks/stats-row/StatsRow.tsx', from: '../../../../ui/src/components/Button', to: '@gntik-ai/ui' });
  });

  it('honours the aliases in gntik-ui.json', async () => {
    const dir = await viteProject();
    await writeFile(
      path.join(dir, 'gntik-ui.json'),
      JSON.stringify({ version: 1, framework: 'vite', packageManager: 'pnpm', css: 'src/index.css', brand: 'gntik', aliases: { components: 'src/ui', blocks: 'src/sections', templates: 'src/pages' } }),
    );
    const r = await cli(['add', 'dashboard', '--json', '--no-install', '--cwd', dir, '--registry', FIXTURES]);
    expect(r.json.configured).toBe(true);
    const page = await read(dir, 'src/pages/dashboard/DashboardPage.tsx');
    expect(page).toContain("from '../../sections/stats-row'");
  });

  it('reports conflicts, writes nothing, exits 4; --overwrite replaces', async () => {
    const dir = await viteProject();
    await mkdir(path.join(dir, 'src/components/blocks/stat-card'), { recursive: true });
    await writeFile(path.join(dir, 'src/components/blocks/stat-card/StatCard.tsx'), '// mine\n');
    const r = await cli(['add', 'stats-row', '--json', '--no-install', '--cwd', dir, '--registry', FIXTURES]);
    expect(r.code).toBe(4);
    expect(r.json).toMatchObject({ ok: false, conflicts: ['src/components/blocks/stat-card/StatCard.tsx'], written: [], error: { code: 'CONFLICT' } });
    expect(existsSync(path.join(dir, 'src/components/blocks/stats-row'))).toBe(false);
    expect(await read(dir, 'src/components/blocks/stat-card/StatCard.tsx')).toBe('// mine\n');

    const o = await cli(['add', 'stats-row', '--json', '--no-install', '--overwrite', '--cwd', dir, '--registry', FIXTURES]);
    expect(o.code).toBe(0);
    expect(o.json.files[0].status).toBe('overwrite');
    expect(await read(dir, 'src/components/blocks/stat-card/StatCard.tsx')).toContain('export function StatCard');

    const again = await cli(['add', 'stats-row', '--json', '--no-install', '--cwd', dir, '--registry', FIXTURES]);
    expect(again.json.files.every((f: { status: string }) => f.status === 'identical')).toBe(true);
  });

  it('unknown ids exit 3; failed installs exit 1', async () => {
    const dir = await viteProject();
    expect((await cli(['add', 'nope', '--json', '--cwd', dir, '--registry', FIXTURES])).json.error.code).toBe('NOT_FOUND');
    const failed = await cli(['add', 'button', '--json', '--cwd', dir, '--registry', FIXTURES], { execCode: 1 });
    expect(failed.code).toBe(1);
    expect(failed.json.error.code).toBe('INSTALL');
  });

  it('rewriteSpecifiers covers import/export/dynamic forms', () => {
    const code = `import a from './a';\nexport * from "./b";\nimport './c.css';\nconst d = await import('./d');\nimport { x } from 'pkg';`;
    expect(rewriteSpecifiers(code, (s) => (s.startsWith('.') ? s.toUpperCase() : s))).toBe(
      `import a from './A';\nexport * from "./B";\nimport './C.CSS';\nconst d = await import('./D');\nimport { x } from 'pkg';`,
    );
  });
});
