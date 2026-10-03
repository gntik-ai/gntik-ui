/**
 * Builds apps/docs/public/llms.txt and llms-full.txt (https://llmstxt.org) from kit-registry.json:
 *   llms.txt       title, summary, one section per kind linking every component, layout, block
 *                  and template doc with a one-line description.
 *   llms-full.txt  the same inventory with each item's full description, import, keyboard table,
 *                  tokens, composition notes and a usage snippet (from *.doc.ts / *.meta.ts).
 * `--check` fails when either file is stale.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  KIT_KINDS, REPO_BLOB, docInfoOf, exportNameOf, firstSentence, loadKit, usageOf, usesConsoleShell,
  type KitItem, type KitKind,
} from '../src/kit.js';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const OUT_DIR = path.join(ROOT, 'apps/docs/public');
const kit = loadKit(ROOT);
if (!kit.items.length) {
  console.error('kit-registry.json not found or empty — run `pnpm registry` first.');
  process.exit(1);
}

const TITLES: Record<KitKind, string> = { component: 'Components', layout: 'Layouts', block: 'Blocks', template: 'Templates' };
const link = (rel: string) => `${REPO_BLOB}${rel}`;
const docLink = (i: KitItem) => link(i.docs ?? i.files[0]?.path ?? 'kit-registry.json');
const ofKind = (kind: KitKind) =>
  kit.items.filter((i) => i.kind === kind).sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
const count = (kind: KitKind) => ofKind(kind).length;

const HEADER = [
  '# gntik-ui',
  '',
  `> The product-agnostic design system of gntik-ai: React 19 + Tailwind CSS 4 components on Base UI, layouts, page blocks and page templates over one frozen token layer (green hue 145, Geist + Geist Mono, dark default + light + high-contrast themes). Products differ only by a brand preset (name + logo). ${count('component')} components, ${count('layout')} layouts, ${count('block')} blocks, ${count('template')} templates.`,
  '',
  'Packages are published as `@gntik-ai/*` on GitHub Packages: `@gntik-ai/tokens` (the brand), `@gntik-ai/ui` (components, layouts, ThemeProvider, presets), `@gntik-ai/blocks`, `@gntik-ai/templates` (pages, `ConsoleShell`), `@gntik-ai/chat`, `@gntik-ai/icons`, `@gntik-ai/charts`, `@gntik-ai/flow`, `@gntik-ai/editor`, and the `gntik-ui` CLI. Build pages from a template first, then layouts + blocks, then components. Styling uses token classes only: no hex or Tailwind palette colours, no gradients or glow, no `dark:` variants.',
].join('\n');

const DOCS = [
  '## Docs',
  '',
  `- [AGENTS.md](${link('AGENTS.md')}): how to find, compose and add kit items, the brand rules and the gate commands`,
  `- [kit-registry.json](${link('kit-registry.json')}): machine-readable list of every installable item with files and dependencies`,
  `- [INVENTORY.md](${link('INVENTORY.md')}): inventory of the catalog and the packages`,
  `- [Component contract](${link('packages/ui/CONTRIBUTING.md')}): folder layout, docs, tests and style rules for a component`,
  `- [Brand tokens](${link('packages/tokens/src/brand.css')}): colour, typography, radii and shadows for the three themes`,
  `- [MCP server](${link('packages/mcp/README.md')}): list_kit, get_component, get_block, get_template, scaffold_page, scaffold_preset and validate_page`,
].join('\n');

const oneLine = (i: KitItem) => `- [${i.name}](${docLink(i)}): ${firstSentence(i.description)} (${[i.group, i.package].filter(Boolean).join(', ')}; id \`${i.id}\`)`;

function llms(): string {
  const sections = KIT_KINDS.map((k) => [`## ${TITLES[k]}`, '', ...ofKind(k).map(oneLine)].join('\n'));
  return [
    HEADER,
    DOCS,
    ...sections,
    ['## Optional', '', '- [llms-full.txt](/llms-full.txt): every item with its full description, keyboard contract, tokens and a usage snippet'].join('\n'),
  ].join('\n\n') + '\n';
}

function full(item: KitItem): string {
  const info = docInfoOf(ROOT, item);
  const name = exportNameOf(ROOT, item);
  const facts = [
    `- Package: \`${item.package}\` · export \`${name}\` · group ${item.group || '—'} · status ${item.status}`,
    `- Docs: ${docLink(item)}`,
  ];
  if (info.primitive) facts.push(`- Primitive: \`${info.primitive}\``);
  if (info.pattern) facts.push(`- ARIA pattern: ${info.pattern}`);
  if (info.uses.length) facts.push(`- Composes: ${info.uses.join(', ')}`);
  if (item.kind === 'template') {
    if (info.layout) facts.push(`- Layout: ${info.layout}`);
    if (info.blocks.length) facts.push(`- Blocks: ${info.blocks.join(', ')}`);
    facts.push(`- Console shell: ${usesConsoleShell(ROOT, item) ? 'yes (pass the product frame through the `shell` prop)' : 'no'}`);
  }
  if (item.registryDependencies.length) facts.push(`- Registry dependencies: ${item.registryDependencies.join(', ')}`);
  if (item.kind === 'block' || item.kind === 'template') facts.push(`- Preview: /preview.html?kind=${item.kind}&id=${item.id}`);
  facts.push(
    item.kind === 'block' || item.kind === 'template'
      ? `- Install: import from \`${item.package}\`, or copy the source with \`gntik-ui add ${item.id}\``
      : `- Install: \`gntik-ui add ${item.id}\`; own the source with \`gntik-ui eject ${item.id}\``,
  );
  const out = [`### ${item.name} (\`${item.id}\`)`, '', item.description, '', ...facts];
  if (info.keyboard.length) {
    out.push('', 'Keyboard:', '', '| Key | Behaviour |', '| --- | --- |', ...info.keyboard.map(([k, b]) => `| ${k} | ${b} |`));
  }
  if (info.tokens.length) out.push('', `Tokens: ${info.tokens.join(', ')}`);
  const usage = usageOf(ROOT, item);
  out.push('', 'Usage:', '', '```tsx', usage.code.trimEnd(), '```');
  return out.join('\n');
}

function llmsFull(): string {
  const sections = KIT_KINDS.map((k) => [`## ${TITLES[k]}`, ...ofKind(k).map(full)].join('\n\n'));
  return [HEADER, DOCS, ...sections].join('\n\n') + '\n';
}

const outputs: Array<[string, string]> = [
  ['llms.txt', llms()],
  ['llms-full.txt', llmsFull()],
];

if (process.argv.includes('--check')) {
  const stale = outputs.filter(([file, text]) => {
    const p = path.join(OUT_DIR, file);
    return (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '') !== text;
  });
  if (stale.length) {
    console.error(`${stale.map(([f]) => `apps/docs/public/${f}`).join(', ')} stale — run \`pnpm registry\`.`);
    process.exit(1);
  }
  console.log('llms.txt and llms-full.txt are up to date.');
} else {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [file, text] of outputs) fs.writeFileSync(path.join(OUT_DIR, file), text);
  console.log(`llms.txt (${Buffer.byteLength(outputs[0]![1])} B) and llms-full.txt (${Buffer.byteLength(outputs[1]![1])} B) written: ${kit.items.length} items.`);
}
