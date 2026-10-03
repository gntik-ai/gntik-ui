import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { cli, FIXTURES, viteProject } from './helpers.js';

const read = (dir: string, f: string) => readFile(path.join(dir, f), 'utf8');

describe('eject', () => {
  it('--dry-run lists the files of the item and its registry dependencies', async () => {
    const dir = await viteProject();
    const r = await cli(['eject', 'button', '--json', '--dry-run', '--cwd', dir, '--registry', FIXTURES]);
    expect(r.code).toBe(0);
    expect(r.json.items).toEqual(['ui-utils', 'spinner', 'button']);
    expect(r.json.files.map((f: { target: string }) => f.target)).toEqual([
      'src/components/utils/cn.ts',
      'src/components/utils/tv.ts',
      'src/components/ui/spinner/Spinner.tsx',
      'src/components/ui/spinner/index.ts',
      'src/components/ui/spinner/Spinner.doc.ts',
      'src/components/ui/button/Button.tsx',
      'src/components/ui/button/button.variants.ts',
      'src/components/ui/button/index.ts',
      'src/components/ui/button/Button.doc.ts',
    ]);
    expect(existsSync(path.join(dir, 'src/components'))).toBe(false);
  });

  it('copies the source, keeps relative imports and finds usages', async () => {
    const dir = await viteProject();
    await writeFile(path.join(dir, 'src/App.tsx'), "import { Button, Card } from '@gntik-ai/ui';\nexport default () => <Button>Hi</Button>;\n");
    const r = await cli(['eject', 'button', '--json', '--no-install', '--cwd', dir, '--registry', FIXTURES]);
    expect(r.code).toBe(0);
    const btn = await read(dir, 'src/components/ui/button/Button.tsx');
    expect(btn).toContain("import { cn } from '../../utils/cn';");
    expect(btn).toContain("import { Spinner } from '../spinner/Spinner';");
    expect(await read(dir, 'src/components/ui/button/Button.doc.ts')).toContain("import type { ComponentDoc } from '@gntik-ai/ui';");
    expect(r.json.localImport).toBe('src/components/ui/button');
    expect(r.json.exports).toEqual(['Button', 'IconButton']);
    expect(r.json.usages).toEqual([{ file: 'src/App.tsx', line: 1, names: ['Button'], replacement: "import { Button } from './components/ui/button';" }]);
    expect(r.json.install.packages).toEqual(['@base-ui/react', '@gntik-ai/ui', 'clsx', 'tailwind-merge', 'tailwind-variants']);
  });

  it('--no-deps copies only the item and points dependencies at the package', async () => {
    const dir = await viteProject();
    const r = await cli(['eject', 'button', '--no-deps', '--json', '--no-install', '--cwd', dir, '--registry', FIXTURES]);
    expect(r.json.items).toEqual(['button']);
    const btn = await read(dir, 'src/components/ui/button/Button.tsx');
    expect(btn).toContain("import { cn } from '@gntik-ai/ui';");
    expect(btn).toContain("import { Spinner } from '@gntik-ai/ui';");
    expect(await read(dir, 'src/components/ui/button/button.variants.ts')).toContain("from '@gntik-ai/ui'");
  });

  it('a second eject reuses identical shared files and flags edited ones', async () => {
    const dir = await viteProject();
    await cli(['eject', 'button', '--no-install', '--cwd', dir, '--registry', FIXTURES]);
    const second = await cli(['eject', 'dialog', '--json', '--no-install', '--cwd', dir, '--registry', FIXTURES]);
    expect(second.code).toBe(0);
    expect(second.json.files.find((f: { target: string }) => f.target.endsWith('utils/cn.ts')).status).toBe('identical');

    await writeFile(path.join(dir, 'src/components/utils/cn.ts'), '// customised\n');
    const third = await cli(['eject', 'dialog', '--json', '--no-install', '--cwd', dir, '--registry', FIXTURES]);
    expect(third.code).toBe(4);
    expect(third.json.conflicts).toEqual(['src/components/utils/cn.ts']);
  });
});
