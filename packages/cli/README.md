# @gntik-ai/cli

`gntik-ui` sets up a product on the gntik-ui design system, adds components (from npm) and
blocks/page templates (copied in), ejects a component's source, and browses the registry.
Every command has `--json` with a stable shape, so agents can drive it as well as people.
No runtime dependencies; Node ≥ 22.

```bash
# .npmrc: @gntik-ai:registry=https://npm.pkg.github.com (init adds it)
pnpm dlx @gntik-ai/cli init
npx @gntik-ai/cli add button dialog
```

## Commands

| Command | What it does |
| --- | --- |
| `init [--brand gntik\|musematic]` | Detects framework (Vite `vite.config.*`, Next `next.config.*`, else generic), package manager (lockfile, walking up; then `packageManager`) and CSS entry (`src/index.css`, `src/styles.css`, `app/globals.css`, …). Adds the scope line to `.npmrc`, puts `@import "tailwindcss"`, the Geist fonts and `@import "@gntik-ai/ui/styles.css"` at the top of the CSS entry, writes `gntik-ui.json`, prints the ThemeProvider + `themeScript` wiring (Next: `providers.tsx` + `layout.tsx` with `suppressHydrationWarning`; Vite: `main.tsx` + a `transformIndexHtml` plugin) and installs `@gntik-ai/ui @gntik-ai/tokens @fontsource/geist @fontsource/geist-mono` (+ Tailwind v4 as dev deps when missing). |
| `add <id...>` | Components/layouts: installs their package if missing and prints the import line. Blocks/templates: copies them and their `registryDependencies` (recursively) into the configured dirs, rewriting imports. |
| `eject <id> [--no-deps]` | Copies a component's source (plus doc file and, unless `--no-deps`, its registry dependencies) into the components dir, and lists the imports in your code to switch to the local copy. |
| `list [--kind k] [--group g]` | Table, or JSON. |
| `search <query> [--kind k] [--limit n]` | Fuzzy match on id, name, group and description; every term must match. |
| `docs <id>` | Description, status, package, files, dependencies, and the keyboard table parsed from the item's `*.doc.ts`. |

Options: `--json`, `--cwd <dir>`, `--registry <dir|file|url>`, `--dry-run` (init/add/eject),
`--overwrite`, `--no-install`, `--yes` (accepted; the CLI never prompts), `--help`, `--version`.

### Registry

`kit-registry.json` lives at the kit repo root (`{ version: 1, items: [...] }`, see
`src/registry.ts`). Source order: `--registry`, `$GNTIK_UI_REGISTRY`, `"registry"` in
`gntik-ui.json`, then `https://raw.githubusercontent.com/gntik-ai/gntik-ui/main/`. A local
checkout dir or a `kit-registry.json` path works too; files are read relative to it.

### Copying and import rewriting

Targets in the registry (`components/…`, `blocks/…`, `templates/…`) map through the
`aliases` in `gntik-ui.json`:

```json
{
  "version": 1, "framework": "vite", "packageManager": "pnpm", "css": "src/index.css", "brand": "gntik",
  "aliases": { "components": "src/components", "blocks": "src/components/blocks", "templates": "src/components/templates" }
}
```

Relative imports between files copied in the same run are re-pointed at their new location;
relative imports into kit code that is not copied become package imports
(`'../../components/Button'` → `'@gntik-ai/ui'`). Files that exist with different content are
**conflicts**: nothing is written and the exit code is 4 unless `--overwrite`. Identical files
are reported as `identical` and left alone.

## Exit codes

`0` ok · `1` error (registry unreadable, install failed) · `2` usage · `3` unknown item · `4` conflicts.

## JSON shapes

Every `--json` response is one object with `ok` and `command`; failures add
`error: { code: "USAGE"|"NOT_FOUND"|"CONFLICT"|"REGISTRY"|"INSTALL"|"ERROR", message }`.

```ts
type Summary = { id; kind: 'component'|'layout'|'block'|'template'; name; package; group; status; description };
type Install = { packages: string[]; dev: string[]; commands: string[]; ran: boolean; exitCode: number | null };
type File = { id; source; target; status: 'create'|'identical'|'conflict'|'overwrite' };

list   → { ok, command, registry, count, items: Summary[] }
search → { ok, command, query, count, items: (Summary & { score: number })[] }
docs   → { ok, command, item: Summary & { files, dependencies, registryDependencies, docs: string|null },
           primitive: string|null, pattern: string|null, keyboard: { key, behaviour }[] }
add    → { ok, command, dryRun, configured, items: { id, kind, package, mode: 'copy'|'package', requested }[],
           files: File[], written: string[], conflicts: string[], rewrites: { file, from, to }[],
           warnings: string[], imports: string[], install: Install }
eject  → { ok, command, dryRun, configured, id, items: string[], files, written, conflicts, rewrites, warnings,
           localImport: string, exports: string[], usages: { file, line, names, replacement }[],
           nextSteps: string[], install: Install }
init   → { ok, command, dryRun, project: { framework, packageManager, css, cssExisted, entry, src },
           config, changes: { file, action: 'create'|'patch'|'unchanged' }[],
           snippet: { file, code }[], warnings: string[], install: Install }
```

Paths in output are project-relative (posix). With `--json`, installer output is captured, not
streamed, so stdout stays a single JSON document.

## For agents

- Plan with `--dry-run --json`, check `conflicts` and `install.commands`, then run without `--dry-run`.
- `--no-install` when the agent manages dependencies itself; run `install.commands` later.
- `search <words> --json --limit 5` → `docs <id> --json` → `add <id> --json`.

## Develop

```bash
pnpm --filter @gntik-ai/cli test       # vitest (node env, temp projects via mkdtemp)
pnpm --filter @gntik-ai/cli build      # tsdown → dist/index.js
node dist/index.js list --registry ../.. --json
```
