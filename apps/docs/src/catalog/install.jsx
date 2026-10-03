/* ============================================================================
   Gntik UI · install.jsx — "Install": three ways to bring a kit item into an app.
   1 · gntik-ui CLI (copies blocks/templates, installs packages, wires the CSS)
   2 · shadcn CLI against the registry this site serves at /r/<id>.json
   3 · plain package import
   Every command is built from kit-registry.json, so it always names real ids.
   ============================================================================ */
import { useMemo, useState } from 'react';
import kitRegistry from '../../../../kit-registry.json';

const { SectionHead, CodeBlock } = window;

const KINDS = [
  { id: 'all', label: 'All' },
  { id: 'component', label: 'Components' },
  { id: 'layout', label: 'Layouts' },
  { id: 'block', label: 'Blocks' },
  { id: 'template', label: 'Templates' },
];
const ITEMS = [...kitRegistry.items].sort((a, b) => a.id.localeCompare(b.id));
const NPMRC = '@gntik-ai:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}';

const pascal = (s) => s.split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('');
const SPECIAL_EXPORTS = { 'ui-utils': ['cn', 'tv'], theme: ['ThemeProvider', 'useTheme'] };

/** Public export of an item, following the package index conventions. */
function exportNames(item) {
  if (SPECIAL_EXPORTS[item.id]) return SPECIAL_EXPORTS[item.id];
  if (item.kind === 'template') return [`${pascal(item.id)}Page`];
  const folder = item.docs ? item.docs.split('/').at(-2) : null;
  return [folder || pascal(item.name)];
}

/** Kit packages an item needs at runtime: its own (package mode) plus the ones its copied code imports. */
function kitPackages(item) {
  const pkgs = new Set([item.package, ...item.dependencies.filter((d) => d.startsWith('@gntik-ai/'))]);
  return [...pkgs].sort((a, b) => (a === '@gntik-ai/ui' ? -1 : b === '@gntik-ai/ui' ? 1 : a.localeCompare(b)));
}

function registryBase() {
  return typeof window !== 'undefined' && window.location?.origin?.startsWith('http') ? window.location.origin : 'https://<docs-host>';
}

function commandsFor(item) {
  const base = registryBase();
  const pkgs = kitPackages(item);
  const copied = item.kind === 'block' || item.kind === 'template';
  return {
    cli: `# once per app: .npmrc, CSS imports, theme wiring, gntik-ui.json
npx @gntik-ai/cli init

npx @gntik-ai/cli add ${item.id}`,
    shadcn: `npx shadcn@latest add ${base}/r/${item.id}.json`,
    pkgInstall: `pnpm add ${pkgs.join(' ')}`,
    pkgCss: `@import "tailwindcss";
${pkgs.map((p) => `@import "${p}/styles.css";`).join('\n')}`,
    pkgImport: `import { ${exportNames(item).join(', ')} } from '${item.package}';`,
    copied,
  };
}

/* ── item picker ─────────────────────────────────────────────────────────── */
function ItemPicker({ selected, onSelect }) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ITEMS.filter((i) => (kind === 'all' || i.kind === kind) && (!q || i.id.includes(q) || i.name.toLowerCase().includes(q)));
  }, [query, kind]);
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-background px-2.5 h-8">
          <span className="sr-only">Filter items</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Filter ${ITEMS.length} items…`}
            className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none" />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by kind">
          {KINDS.map((k) => (
            <button key={k.id} type="button" aria-pressed={kind === k.id} onClick={() => setKind(k.id)}
              className={'h-7 rounded-md px-2.5 text-[12px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ' +
                (kind === k.id ? 'bg-primary/14 text-primary-chip-text' : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground')}>
              {k.label}
            </button>
          ))}
        </div>
      </div>
      <ul className="mt-3 flex max-h-44 flex-wrap gap-1.5 overflow-y-auto" aria-label="Items">
        {shown.map((i) => (
          <li key={i.id}>
            <button type="button" aria-pressed={selected.id === i.id} onClick={() => onSelect(i)}
              className={'h-7 rounded-md border px-2 font-mono text-[11.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ' +
                (selected.id === i.id ? 'border-primary/40 bg-primary/14 text-primary-chip-text' : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60')}>
              {i.id}
            </button>
          </li>
        ))}
        {shown.length === 0 && <li className="text-[12.5px] text-muted-foreground">No item matches.</li>}
      </ul>
    </div>
  );
}

/* ── one install method ──────────────────────────────────────────────────── */
function Method({ n, title, desc, children }) {
  return (
    <section className="mb-10">
      <div className="mb-2 flex items-baseline gap-3">
        <span className="font-mono text-[11px] text-primary-text">{n}</span>
        <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      </div>
      <p className="mb-1 max-w-3xl font-sans text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>{desc}</p>
      {children}
    </section>
  );
}

function ItemSummary({ item }) {
  return (
    <div className="mt-6 mb-10 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">{item.name}</h2>
        <span className="font-mono text-[11px] text-muted-foreground">{item.kind} · {item.package}</span>
        <span className="rounded-full bg-primary/14 px-2 py-0.5 text-[11px] font-medium text-primary-chip-text">{item.status}</span>
      </div>
      <p className="mt-1 max-w-3xl text-[13px] leading-6 text-muted-foreground">{item.description}</p>
      <dl className="mt-3 grid gap-x-6 gap-y-2 text-[12px] sm:grid-cols-[max-content_1fr]">
        <dt className="text-muted-foreground">Files</dt>
        <dd className="min-w-0 font-mono text-foreground/85">{item.files.map((f) => <div key={f.target} className="truncate">{f.target}</div>)}</dd>
        <dt className="text-muted-foreground">Registry deps</dt>
        <dd className="font-mono text-foreground/85">{item.registryDependencies.length ? item.registryDependencies.join(', ') : '—'}</dd>
        <dt className="text-muted-foreground">npm deps</dt>
        <dd className="font-mono text-foreground/85">{item.dependencies.length ? item.dependencies.join(', ') : '—'}</dd>
      </dl>
    </div>
  );
}

/* ── section ─────────────────────────────────────────────────────────────── */
function InstallSection() {
  const [item, setItem] = useState(() => ITEMS.find((i) => i.id === 'button') ?? ITEMS[0]);
  const cmd = commandsFor(item);
  const base = registryBase();
  return (
    <div>
      <SectionHead kicker="Get started" title="Install" status="done"
        intro={`Three ways to bring any of the ${ITEMS.length} kit items into a React 19 + Tailwind 4 app. Pick an item and the commands below update. All three need read access to the @gntik-ai packages on GitHub Packages.`} />

      <ItemPicker selected={item} onSelect={setItem} />
      <ItemSummary item={item} />

      <Method n="00" title="Registry access"
        desc="The @gntik-ai packages are published to GitHub Packages. Add this .npmrc next to package.json, with a token that can read packages.">
        <CodeBlock code={NPMRC} lang="ini" open />
      </Method>

      <Method n="01" title="gntik-ui CLI"
        desc={cmd.copied
          ? 'Blocks and templates are copied into your source tree (kebab folders that mirror the kit), with their imports rewritten; the components they use come from @gntik-ai/ui. The CLI installs the packages and keeps a gntik-ui.json.'
          : 'Components and layouts install as packages and the CLI prints the import line. Use `gntik-ui eject <id>` to copy the source instead.'}>
        <CodeBlock code={cmd.cli} lang="sh" open />
      </Method>

      <Method n="02" title="shadcn CLI"
        desc={`Works in any project with a components.json. Every item pulls in gntik-tokens (the brand tokens, Geist and the Tailwind bridge, merged into your CSS file) and its sibling items by URL. Files land under the same kebab targets as the gntik-ui CLI. The index is at ${base}/r/registry.json.`}>
        <CodeBlock code={cmd.shadcn} lang="sh" open />
        <p className="mt-2 max-w-3xl text-[12.5px] leading-6 text-muted-foreground">
          If the app was set up with <code className="font-mono text-foreground">shadcn init</code>, remove its <code className="font-mono text-foreground">:root</code>/<code className="font-mono text-foreground">.dark</code> variables and <code className="font-mono text-foreground">@theme</code> block: the gntik tokens define them.
        </p>
      </Method>

      <Method n="03" title="Package import"
        desc="No copied files: install the packages, import their styles once after Tailwind, and import the item.">
        <CodeBlock code={cmd.pkgInstall} lang="sh" open />
        <CodeBlock code={cmd.pkgCss} lang="css" open />
        <CodeBlock code={cmd.pkgImport} lang="tsx" open />
      </Method>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['install'] = InstallSection;
