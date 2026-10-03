import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { installLines, runInstall, withInstallStatus, type CommandResult, type Context } from '../context.js';
import { CliError } from '../errors.js';
import {
  CONFIG_FILE,
  NPM_REGISTRY,
  SCOPE,
  defaultConfig,
  detectProject,
  installedPackages,
  loadConfig,
  type Framework,
  type GntikConfig,
} from '../project.js';

export const BRANDS = ['gntik', 'musematic'] as const;
export const SCOPE_LINE = `${SCOPE}:registry=${NPM_REGISTRY}`;
export const CSS_IMPORTS = [
  '@import "tailwindcss";',
  '@import "@fontsource/geist";',
  '@import "@fontsource/geist-mono";',
  '@import "@gntik-ai/ui/styles.css";',
];
const IMPORT_TARGETS = ['tailwindcss', '@fontsource/geist', '@fontsource/geist-mono', '@gntik-ai/ui/styles.css'];

export type ChangeAction = 'create' | 'patch' | 'unchanged';
export interface Change {
  file: string;
  action: ChangeAction;
  content: string;
}

/** Ensures the scope line is in .npmrc. */
export function patchNpmrc(text: string | null): string {
  const lines = text === null ? [] : text.split(/\r?\n/);
  if (lines.some((l) => l.trim().replace(/\s+/g, '') === SCOPE_LINE)) return text ?? '';
  const kept = lines.filter((l) => !l.trim().startsWith(`${SCOPE}:registry`));
  while (kept.length && kept[kept.length - 1] === '') kept.pop();
  return [...kept, SCOPE_LINE, ''].join('\n');
}

/**
 * Puts Tailwind, the Geist fonts and the kit styles at the top of the CSS entry, in that order,
 * keeping everything else. Existing copies of those imports are moved, not duplicated.
 */
export function patchCss(text: string | null): string {
  const lines = text === null ? [] : text.split(/\r?\n/);
  const isOurs = (l: string) => {
    const m = /^\s*@import\s+(?:url\()?\s*["']([^"']+)["']/.exec(l);
    return !!m && IMPORT_TARGETS.includes(m[1] ?? '');
  };
  const head = lines.slice(0, CSS_IMPORTS.length).map((l) => l.trim());
  if (CSS_IMPORTS.every((l, i) => head[i] === l) && lines.slice(CSS_IMPORTS.length).every((l) => !isOurs(l))) return text ?? '';
  const rest = lines.filter((l) => !isOurs(l));
  while (rest.length && rest[0]?.trim() === '') rest.shift();
  return [...CSS_IMPORTS, '', ...rest].join('\n').replace(/\n*$/, '\n');
}

const presetName = (brand: string) => `${brand}Preset`;

export function themeSnippet(framework: Framework, entry: string, css: string, brand: string) {
  const preset = presetName(brand);
  const cssImport = (from: string) => {
    let rel = path.posix.relative(path.posix.dirname(from), css);
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return rel;
  };
  if (framework === 'next') {
    const dir = path.posix.dirname(entry);
    const providers = `${dir}/providers.tsx`;
    return [
      {
        file: providers,
        code: `'use client';
import type { ReactNode } from 'react';
import { ThemeProvider, ${preset}, themeScript } from '@gntik-ai/ui';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Applies the stored theme before first paint (no flash). */}
      <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
      <ThemeProvider brand={${preset}}>{children}</ThemeProvider>
    </>
  );
}
`,
      },
      {
        file: entry,
        code: `import type { ReactNode } from 'react';
import { Providers } from './providers';
import '${cssImport(entry)}';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The theme script sets the class before React hydrates.
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
`,
      },
    ];
  }
  const files = [
    {
      file: entry,
      code: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, ${preset} } from '@gntik-ai/ui';
import App from './App';
import '${cssImport(entry)}';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider brand={${preset}}>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
`,
    },
  ];
  if (framework === 'vite') {
    files.push({
      file: 'vite.config.ts',
      code: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { themeScript } from '@gntik-ai/ui';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Inlines the theme script in <head> so the stored theme applies before first paint.
    { name: 'gntik-theme', transformIndexHtml: () => [{ tag: 'script', children: themeScript(), injectTo: 'head-prepend' }] },
  ],
});
`,
    });
  } else {
    files.push({
      file: 'index.html',
      code: `<!-- In <head>: inline the output of themeScript() from @gntik-ai/ui to avoid a theme flash. -->
<script>/* themeScript() output */</script>
`,
    });
  }
  return files;
}

async function readOrNull(file: string) {
  return existsSync(file) ? readFile(file, 'utf8') : null;
}

function change(file: string, before: string | null, after: string): Change {
  return { file, action: before === null ? 'create' : before === after ? 'unchanged' : 'patch', content: after };
}

export async function init(ctx: Context): Promise<CommandResult> {
  const brand = ctx.flags.brand ?? 'gntik';
  if (!(BRANDS as readonly string[]).includes(brand)) throw new CliError('USAGE', `--brand must be one of ${BRANDS.join(', ')}`);
  if (!existsSync(ctx.cwd)) throw new CliError('USAGE', `Directory not found: ${ctx.cwd}`);
  const info = detectProject(ctx.cwd);
  const existing = loadConfig(ctx.cwd);
  const config: GntikConfig = existing && !ctx.flags.overwrite ? existing : { ...defaultConfig(info, brand), ...(existing?.registry ? { registry: existing.registry } : {}) };
  const cssFile = config.css;

  const npmrcPath = path.join(ctx.cwd, '.npmrc');
  const cssPath = path.join(ctx.cwd, cssFile);
  const cfgPath = path.join(ctx.cwd, CONFIG_FILE);
  const npmrcBefore = await readOrNull(npmrcPath);
  const cssBefore = await readOrNull(cssPath);
  const cfgBefore = await readOrNull(cfgPath);
  const cfgText = `${JSON.stringify(config, null, 2)}\n`;
  const changes: Change[] = [
    change('.npmrc', npmrcBefore, patchNpmrc(npmrcBefore)),
    change(cssFile, cssBefore, patchCss(cssBefore)),
    change(CONFIG_FILE, cfgBefore, cfgBefore !== null && !ctx.flags.overwrite ? cfgBefore : cfgText),
  ];
  if (!ctx.flags.dryRun) {
    for (const c of changes) {
      if (c.action === 'unchanged') continue;
      const abs = path.join(ctx.cwd, c.file);
      await mkdir(path.dirname(abs), { recursive: true });
      await writeFile(abs, c.content);
    }
  }

  const warnings: string[] = [];
  if (cssBefore && /@tailwind\s+(base|components|utilities)/.test(cssBefore)) {
    warnings.push(`${cssFile} has Tailwind v3 directives (@tailwind …); the kit needs Tailwind v4 — remove them.`);
  }
  if (!info.packageJson) warnings.push('No package.json found in this directory.');
  const have = installedPackages(info.packageJson);
  const dev: string[] = [];
  if (!have.has('tailwindcss')) {
    dev.push('tailwindcss', info.framework === 'next' ? '@tailwindcss/postcss' : '@tailwindcss/vite');
    if (info.framework === 'next' && !existsSync(path.join(ctx.cwd, 'postcss.config.mjs'))) {
      warnings.push('Add postcss.config.mjs: export default { plugins: { "@tailwindcss/postcss": {} } };');
    }
  }
  const install = runInstall(ctx, config.packageManager, info.packageJson, ['@gntik-ai/ui', '@gntik-ai/tokens', '@fontsource/geist', '@fontsource/geist-mono'], dev);
  const snippet = themeSnippet(info.framework, info.entry, cssFile, config.brand);

  const label = (a: ChangeAction) => (ctx.flags.dryRun ? { create: 'would create', patch: 'would patch', unchanged: 'unchanged' } : { create: 'created', patch: 'patched', unchanged: 'unchanged' })[a];
  const text = [
    `Project: ${info.framework} · ${config.packageManager} · CSS ${cssFile}${info.css ? '' : ' (new)'}`,
    ...changes.map((c) => `  ${label(c.action).padEnd(13)} ${c.file}`),
    ...warnings.map((w) => `Warning: ${w}`),
    '',
    'Wire the theme (dark by default; light and high_contrast via useTheme().setMode):',
    ...snippet.flatMap((s) => ['', `// ${s.file}`, ...s.code.trimEnd().split('\n')]),
    '',
    ...installLines(install, ctx),
    'GitHub Packages needs a token with read:packages: //npm.pkg.github.com/:_authToken=… in your user ~/.npmrc.',
  ];
  const data = {
    dryRun: ctx.flags.dryRun,
    project: { framework: info.framework, packageManager: config.packageManager, css: cssFile, cssExisted: info.css !== null, entry: info.entry, src: info.src },
    config,
    changes: changes.map(({ file, action }) => ({ file, action })),
    snippet,
    warnings,
    install,
  };
  return withInstallStatus({ code: 0, data, text }, install);
}
