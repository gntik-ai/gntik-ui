import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from '../src/cli.js';

export const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

export interface CliRun {
  code: number;
  stdout: string;
  stderr: string;
  json: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  execs: Array<{ cmd: string; args: string[]; cwd: string }>;
}

export async function cli(argv: string[], opts: { cwd?: string; execCode?: number } = {}): Promise<CliRun> {
  let stdout = '';
  let stderr = '';
  const execs: CliRun['execs'] = [];
  const code = await run(argv, {
    cwd: opts.cwd ?? FIXTURES,
    env: {},
    stdout: (s) => (stdout += s),
    stderr: (s) => (stderr += s),
    exec: (cmd, args, { cwd }) => {
      execs.push({ cmd, args, cwd });
      return opts.execCode ?? 0;
    },
  });
  let json: unknown = null;
  if (argv.includes('--json')) json = JSON.parse(stdout);
  return { code, stdout, stderr, json, execs };
}

const created: string[] = [];

/** Removes every temp project made by this test file (called from test/setup.ts). */
export async function cleanupTempProjects() {
  await Promise.all(created.splice(0).map((d) => rm(d, { recursive: true, force: true })));
}

export async function tempProject(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'gntik-cli-'));
  created.push(dir);
  for (const [file, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(dir, file)), { recursive: true });
    await writeFile(path.join(dir, file), content);
  }
  return dir;
}

export const viteProject = () =>
  tempProject({
    'package.json': JSON.stringify({ name: 'app', dependencies: { react: '^19.0.0' }, devDependencies: { vite: '^8.0.0' } }),
    'pnpm-lock.yaml': 'lockfileVersion: 9\n',
    'vite.config.ts': 'export default {};\n',
    'src/main.tsx': "import './index.css';\n",
    'src/index.css': 'body { margin: 0; }\n',
  });

export const nextProject = () =>
  tempProject({
    'package.json': JSON.stringify({ name: 'web', dependencies: { next: '^16.0.0', react: '^19.0.0', tailwindcss: '^4.0.0' } }),
    'package-lock.json': '{}\n',
    'next.config.mjs': 'export default {};\n',
    'app/layout.tsx': 'export default function RootLayout() { return null; }\n',
    'app/globals.css': '@import "tailwindcss";\n\n:root { --x: 1; }\n',
    '.npmrc': 'save-exact=true\n',
  });
