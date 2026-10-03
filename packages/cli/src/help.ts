import type { CommandName } from './args.js';

const GLOBAL = `Global options:
  --json              Machine-readable output on stdout (stable shape, see README)
  --cwd <dir>         Project directory (default: current directory)
  -r, --registry <p>  Registry: checkout dir, kit-registry.json path or base URL
                      (default: $GNTIK_UI_REGISTRY, gntik-ui.json "registry", then GitHub main)
  -y, --yes           Accepted for scripts; the CLI never prompts
  -h, --help          Help for a command
  -v, --version       Print the version

Exit codes: 0 ok · 1 error (registry, install, codemods) · 2 usage · 3 unknown item · 4 file conflicts`;

export const HELP: Record<'main' | CommandName, string> = {
  main: `gntik-ui — add the gntik-ui design system to a product.

Usage: gntik-ui <command> [options]

Commands:
  init               Set up a project (.npmrc, CSS imports, gntik-ui.json, packages)
  add <id...>        Add components/layouts (npm) or copy blocks/templates into the project
  eject <id>         Copy a component's source into the project so the team owns it
  list               List registry items (--kind, --group)
  search <query>     Fuzzy search on id, name, description and group
  docs <id>          Show an item's description, files, dependencies and keyboard contract
  upgrade [paths...] Run the codemods for @gntik-ai/* breaking changes (dry run unless --apply)

${GLOBAL}`,
  init: `Usage: gntik-ui init [--brand gntik|musematic|falcone] [--dry-run] [--no-install] [--overwrite]

Detects the framework (Vite, Next, generic), package manager and CSS entry, then:
  - adds "@gntik-ai:registry=https://npm.pkg.github.com" to .npmrc
  - puts @import "tailwindcss", the Geist fonts and "@gntik-ai/ui/styles.css" at the top of the CSS entry
  - writes gntik-ui.json (aliases for components, blocks, templates; brand preset); kept if present
    unless --overwrite
  - prints the ThemeProvider + themeScript wiring for the framework
  - installs @gntik-ai/ui @gntik-ai/tokens and the fonts (skipped with --no-install or --dry-run)

${GLOBAL}`,
  add: `Usage: gntik-ui add <id...> [--dry-run] [--overwrite] [--no-install]

Components and layouts install from their npm package; the import line is printed.
Blocks and templates are copied into the configured directories with their registry
dependencies; imports are rewritten (relative between copied files, package imports for kit
code). Existing files that differ are reported as conflicts and nothing is written unless
--overwrite is given.

${GLOBAL}`,
  eject: `Usage: gntik-ui eject <id> [--no-deps] [--dry-run] [--overwrite] [--no-install]

Copies the item's source (and its registry dependencies, unless --no-deps) into the components
directory, rewrites imports, and lists the imports in the project to switch to the local copy.

${GLOBAL}`,
  list: `Usage: gntik-ui list [--kind component|layout|block|template] [--group <group>]

${GLOBAL}`,
  search: `Usage: gntik-ui search <query> [--kind <kind>] [--limit <n>]

All terms must match (id, name, group or description); results are ranked.

${GLOBAL}`,
  docs: `Usage: gntik-ui docs <id>

Prints description, status, package, files, dependencies and the keyboard table from the
item's *.doc.ts file.

${GLOBAL}`,
  upgrade: `Usage: gntik-ui upgrade [paths...] [--from <v>] [--to <v>] [--codemod <id>...] [--skip-codemod <id>...]
                         [--list] [--apply]

Migrates the project's code across @gntik-ai/* breaking changes with the transforms in
@gntik-ai/codemods, loaded from the project (install it with: pnpm add -D @gntik-ai/codemods).

  --from <v>           Version upgrading from (default: the @gntik-ai/* versions in package.json;
                       every codemod when none are declared)
  --to <v>             Version upgrading to (default: latest)
  --codemod <id>       Run only these codemods, whatever the versions (repeatable or comma-separated)
  --skip-codemod <id>  Leave these out (repeatable or comma-separated)
  --list               List the codemods and which ones this upgrade selects; changes nothing
  --apply              Write the changes. Without it the run is dry: it reports the files it would
                       change and the warnings (report-only codemods never write)
  paths...             Files or directories to process (default: the project, without node_modules,
                       dist, build, .next, …)

Exit code 1 when @gntik-ai/codemods is missing (the install command is printed) or a file fails
to parse.

${GLOBAL}`,
};
