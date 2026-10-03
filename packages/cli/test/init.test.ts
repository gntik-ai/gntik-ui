import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CSS_IMPORTS, patchCss, patchNpmrc, SCOPE_LINE } from '../src/commands/init.js';
import { cli, nextProject, tempProject, viteProject } from './helpers.js';

const read = (dir: string, f: string) => readFile(path.join(dir, f), 'utf8');

describe('init', () => {
  it('Vite --dry-run: detects the project and writes nothing', async () => {
    const dir = await viteProject();
    const r = await cli(['init', '--json', '--dry-run', '--cwd', dir]);
    expect(r.code).toBe(0);
    expect(r.json.project).toMatchObject({ framework: 'vite', packageManager: 'pnpm', css: 'src/index.css', cssExisted: true, entry: 'src/main.tsx' });
    expect(r.json.changes).toEqual([
      { file: '.npmrc', action: 'create' },
      { file: 'src/index.css', action: 'patch' },
      { file: 'gntik-ui.json', action: 'create' },
    ]);
    expect(r.json.install.commands).toEqual([
      'pnpm add @fontsource/geist @fontsource/geist-mono @gntik-ai/tokens @gntik-ai/ui',
      'pnpm add -D @tailwindcss/vite tailwindcss',
    ]);
    expect(r.execs).toEqual([]);
    expect(existsSync(path.join(dir, 'gntik-ui.json'))).toBe(false);
    expect(await read(dir, 'src/index.css')).toBe('body { margin: 0; }\n');
    expect(r.json.snippet.map((s: { file: string }) => s.file)).toEqual(['src/main.tsx', 'vite.config.ts']);
    expect(r.json.snippet[0].code).toContain('<ThemeProvider brand={gntikPreset}>');
  });

  it('Vite: writes .npmrc, CSS imports and config, then installs', async () => {
    const dir = await viteProject();
    const r = await cli(['init', '--json', '--brand', 'musematic', '--cwd', dir]);
    expect(r.code).toBe(0);
    expect(await read(dir, '.npmrc')).toBe(`${SCOPE_LINE}\n`);
    expect(await read(dir, 'src/index.css')).toBe(`${CSS_IMPORTS.join('\n')}\n\nbody { margin: 0; }\n`);
    expect(JSON.parse(await read(dir, 'gntik-ui.json'))).toEqual({
      version: 1,
      framework: 'vite',
      packageManager: 'pnpm',
      css: 'src/index.css',
      brand: 'musematic',
      aliases: { components: 'src/components', blocks: 'src/components/blocks', templates: 'src/components/templates' },
    });
    expect(r.execs.map((e) => [e.cmd, ...e.args].join(' '))).toEqual([
      'pnpm add @fontsource/geist @fontsource/geist-mono @gntik-ai/tokens @gntik-ai/ui',
      'pnpm add -D @tailwindcss/vite tailwindcss',
    ]);
    // Idempotent second run.
    const again = await cli(['init', '--json', '--no-install', '--cwd', dir]);
    expect(again.json.changes.every((c: { action: string }) => c.action === 'unchanged')).toBe(true);
    expect(again.json.config.brand).toBe('musematic');
  });

  it('Next: patches existing files and prints the layout with suppressHydrationWarning', async () => {
    const dir = await nextProject();
    const r = await cli(['init', '--json', '--no-install', '--cwd', dir]);
    expect(r.code).toBe(0);
    expect(r.json.project).toMatchObject({ framework: 'next', packageManager: 'npm', css: 'app/globals.css', entry: 'app/layout.tsx', src: false });
    expect(await read(dir, '.npmrc')).toBe(`save-exact=true\n${SCOPE_LINE}\n`);
    const css = await read(dir, 'app/globals.css');
    expect(css.match(/@import "tailwindcss";/g)).toHaveLength(1);
    expect(css).toContain(':root { --x: 1; }');
    expect(JSON.parse(await read(dir, 'gntik-ui.json')).aliases.components).toBe('components');
    const layout = r.json.snippet.find((s: { file: string }) => s.file === 'app/layout.tsx');
    expect(layout.code).toContain('suppressHydrationWarning');
    expect(layout.code).toContain("import './globals.css';");
    expect(r.json.snippet[0].code).toContain('themeScript()');
    expect(r.json.install).toMatchObject({ commands: ['npm install @fontsource/geist @fontsource/geist-mono @gntik-ai/tokens @gntik-ai/ui'], ran: false });
    expect(r.execs).toEqual([]);
  });

  it('generic project without a CSS entry creates one', async () => {
    const dir = await tempProject({ 'package.json': '{"name":"x"}', 'src/main.tsx': '' });
    const r = await cli(['init', '--json', '--no-install', '--cwd', dir]);
    expect(r.json.project).toMatchObject({ framework: 'generic', packageManager: 'npm', css: 'src/index.css', cssExisted: false });
    expect(await read(dir, 'src/index.css')).toBe(`${CSS_IMPORTS.join('\n')}\n`);
  });

  it('rejects unknown brands', async () => {
    const dir = await viteProject();
    expect((await cli(['init', '--brand', 'acme', '--json', '--cwd', dir])).code).toBe(2);
  });

  it('patchCss / patchNpmrc are idempotent and move existing imports', () => {
    const once = patchCss('@import "@gntik-ai/ui/styles.css";\n@import "tailwindcss";\n.a{}\n');
    expect(once).toBe(`${CSS_IMPORTS.join('\n')}\n\n.a{}\n`);
    expect(patchCss(once)).toBe(once);
    expect(patchNpmrc(`${SCOPE_LINE}\n`)).toBe(`${SCOPE_LINE}\n`);
    expect(patchNpmrc('@gntik-ai:registry=https://old\n')).toBe(`${SCOPE_LINE}\n`);
  });
});
