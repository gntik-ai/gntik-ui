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
| `upgrade [paths...]` | Runs the `@gntik-ai/codemods` transforms for the breaking changes between two versions. Dry run unless `--apply`. See [Upgrading](#upgrading). |

Options: `--json`, `--cwd <dir>`, `--registry <dir|file|url>`, `--dry-run` (init/add/eject/upgrade),
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

### Upgrading

```bash
pnpm add -D @gntik-ai/codemods        # once; upgrade loads it from the project
npx gntik-ui upgrade --list           # every codemod, and which ones this upgrade selects
npx gntik-ui upgrade                  # dry run: files it would change + warnings
npx gntik-ui upgrade --apply          # write the changes
npx gntik-ui upgrade src --codemod chip-text-aliases --apply
```

The CLI stays dependency-free: `upgrade` imports `@gntik-ai/codemods` from the project's
`node_modules` (walking up from `--cwd`); when it is missing it prints the install command for
the detected package manager and exits 1 (`CODEMODS`). `--from` defaults to the `@gntik-ai/*`
versions declared in `package.json` (per package; every codemod when none are declared, e.g.
`workspace:*`), `--to` to `latest`; a codemod is selected when the upgrade crosses its
`toVersion`. `--codemod <id>` (repeatable or comma-separated) runs exactly those, whatever the
versions; `--skip-codemod <id>` leaves some out. Paths limit the run to files/dirs; by default the
whole project is scanned without `node_modules`, `dist`, `build`, `.next`, … Report-only codemods
(`link-underline-default`) never write; their findings are `reports`.

| Codemod | Package | What it does |
| --- | --- | --- |
| `templates-renamed-ids` | templates | `FlowBuilderPage` → `WorkflowBuilderPage`, `MfaChallengePage` → `MfaPage`, `flowBuilderTemplateMeta` → `workflowBuilderTemplateMeta`, `mfaChallengeTemplateMeta` → `mfaTemplateMeta` (imports, references, re-exports). |
| `flow-builder-controlled-console` | blocks | `<FlowBuilder consoleEntries={x}>` without `onConsoleChange` → `defaultConsoleEntries={x}` (spread props: reported, left alone). |
| `chip-text-aliases` | tokens | In a class string/template with `bg-<tone>/NN` and `text-<tone>-text` (primary, success, warning, destructive) → `text-<tone>-chip-text`. |
| `link-underline-default` | ui | Report only: `<Link>` from `@gntik-ai/ui` without `underline` (now underlined by default). |

## Exit codes

`0` ok · `1` error (registry unreadable, install failed, codemods missing, a file failed to transform) · `2` usage · `3` unknown item · `4` conflicts.

## JSON shapes

Every `--json` response is one object with `ok` and `command`; failures add
`error: { code: "USAGE"|"NOT_FOUND"|"CONFLICT"|"REGISTRY"|"INSTALL"|"CODEMODS"|"ERROR", message }`.

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
upgrade → { ok, command, dryRun, from: string | Record<pkg, version> | null, to: string,
           codemods: { installed, version: string|null, install: string|null },
           transforms: Codemod[], scanned, files: { file, status: 'modified'|'unchanged'|'error', transforms: string[],
           reports: { transform, line, message }[], error? }[], changed: string[],
           reports: { file, line, transform, message }[], errors: { file, message }[] }
upgrade --list → { ok, command, dryRun, from, to, codemods, transforms: (Codemod & { selected: boolean })[] }
           // Codemod = { id, package, fromVersion, toVersion, reportOnly, description }
           // codemods missing → { ok: false, …, codemods: { installed: false, version: null, install: "pnpm add -D @gntik-ai/codemods" } }
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
