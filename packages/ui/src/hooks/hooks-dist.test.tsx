import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { build } from 'tsdown';

// These tests read the built package (`pnpm build` first), like the other entry tests.
const dist = (file: string) => resolve('dist', file);
const load = (file: string) =>
  import(/* @vite-ignore */ pathToFileURL(dist(file)).href) as Promise<Record<string, unknown>>;
const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8')) as { exports: Record<string, unknown> };

it('publishes the ./hooks subpath with types and a build', () => {
  expect(pkg.exports['./hooks']).toEqual({ types: './dist/hooks.d.ts', default: './dist/hooks.js' });
});

it('starts dist/hooks.js with the use client banner', () => {
  expect(readFileSync(dist('hooks.js'), 'utf8').startsWith("'use client';")).toBe(true);
});

const GENERIC_HOOKS = [
  'useUrlState',
  'UrlStateProvider',
  'useAnnounce',
  'useToast',
  'useAsyncOptions',
  'useFitCount',
  'useVirtualWindow',
] as const;

it('exports from the subpath the very functions the root exports', async () => {
  const [hooks, root] = await Promise.all([load('hooks.js'), load('index.js')]);
  for (const name of GENERIC_HOOKS) {
    expect(typeof hooks[name], name).toBe('function');
    expect(root[name], name).toBe(hooks[name]);
  }
  for (const name of Object.keys(hooks)) expect(root[name], name).toBe(hooks[name]);
});

it('shows a toast for useToast from the subpath under a ToastProvider from the root', async () => {
  const hooks = await load('hooks.js');
  const root = await load('index.js');
  const { ToastProvider, Toaster } = root as unknown as {
    ToastProvider: React.ComponentType<{ children?: React.ReactNode }>;
    Toaster: React.ComponentType;
  };
  const useToast = hooks.useToast as () => { add: (options: { title: string }) => string };
  function Trigger() {
    const toast = useToast();
    return <button onClick={() => toast.add({ title: 'Saved from the subpath' })}>Show</button>;
  }
  render(
    <ToastProvider>
      <Trigger />
      <Toaster />
    </ToastProvider>,
  );
  await userEvent.setup().click(screen.getByRole('button', { name: 'Show' }));
  expect(await screen.findByText('Saved from the subpath')).toBeInTheDocument();
});

it('bundles useFitCount alone without Toast or Combobox code', async () => {
  const work = mkdtempSync(join(tmpdir(), 'gntik-hooks-bundle-'));
  try {
    const entry = join(work, 'entry.js');
    writeFileSync(entry, `import { useFitCount } from ${JSON.stringify(dist('hooks.js'))};\nexport { useFitCount };\n`);
    await build({
      config: false,
      entry: { bundle: entry },
      outDir: join(work, 'out'),
      format: ['esm'],
      platform: 'neutral',
      dts: false,
      clean: true,
      external: ['react', 'react-dom'],
      logLevel: 'silent',
    });
    const out = join(work, 'out');
    const code = readdirSync(out)
      .filter((file) => file.endsWith('.js'))
      .map((file) => readFileSync(join(out, file), 'utf8'))
      .join('\n');
    expect(code).toContain('ResizeObserver');
    expect(code).not.toMatch(/toast|combobox/i);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});
