/* ============================================================================
   gntik-ui-mcp · scaffold.ts — ready-to-paste page files and brand presets
   ----------------------------------------------------------------------------
   scaffoldPage:   a template id, or block ids + a layout → one TSX page file
                   with package imports (@gntik-ai/templates · blocks · ui).
   scaffoldPreset: a product name (+ optional SVG mark) → a BrandPreset module
                   shaped like packages/ui/src/theme/presets.tsx. Presets only
                   carry name + logo: colours never change.
   ============================================================================ */
import { exportNameOf, exportNamesOf, firstSentence, nearIds, usesConsoleShell, type KitItem, type KitRegistry } from './kit.js';

export interface Scaffold {
  ok: boolean;
  /** File name suggestion. */
  filename?: string;
  code?: string;
  notes: string[];
  error?: string;
}

const pascal = (s: string) =>
  s.replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('') || 'New';
const camel = (s: string) => { const p = pascal(s); return p.charAt(0).toLowerCase() + p.slice(1); };
const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
const q = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
/** JSX string attribute: "…" when possible, {'…'} otherwise. */
const jsxStr = (s: string) => (/["{}]/.test(s) ? `{${q(s)}}` : `"${s}"`);
const indent = (code: string, n: number) => code.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

/* ── pages ────────────────────────────────────────────────────────────────── */

export const PAGE_LAYOUTS = ['console', 'page', 'auth-layout', 'stacked-layout', 'docs-layout', 'canvas-layout', 'print-layout'] as const;
export type PageLayout = (typeof PAGE_LAYOUTS)[number];
const LAYOUT_ALIASES: Record<string, PageLayout> = { 'sidebar-layout': 'console', shell: 'console', none: 'page', embedded: 'page' };

export interface ScaffoldPageInput {
  template?: string;
  blocks?: string[];
  layout?: string;
  /** Exported component name (PascalCase); derived when omitted. */
  name?: string;
  /** Route of the page: marks the active sidebar item in the console shell. */
  route?: string;
}

export function scaffoldPage(kit: KitRegistry, input: ScaffoldPageInput): Scaffold {
  if (input.template) return templatePage(kit, input.template, input);
  if (input.blocks?.length) return blocksPage(kit, input.blocks, input);
  return { ok: false, notes: [], error: 'Pass `template` (a template id) or `blocks` (block ids) — see list_kit kind=template|block.' };
}

function templatePage(kit: KitRegistry, id: string, input: ScaffoldPageInput): Scaffold {
  const item = kit.byId.get(id);
  if (!item || item.kind !== 'template') {
    const near = nearIds(kit, id, 'template');
    return { ok: false, notes: [], error: `Unknown template "${id}".${near.length ? ` Did you mean ${near.join(', ')}?` : ''}` };
  }
  const exp = exportNameOf(kit.root, item);
  const comp = input.name ? pascal(input.name) : exp.replace(/Page$/, '') + 'Route';
  const route = input.route ?? `/${id}`;
  const shell = usesConsoleShell(kit.root, item);
  const lines = [
    shell
      ? `import { ${exp}, type ConsoleShellProps } from '@gntik-ai/templates';`
      : `import { ${exp} } from '@gntik-ai/templates';`,
    '',
  ];
  if (shell) {
    lines.push(
      '/** Your product frame: nav, workspaces, user and topbar (shared by every console page). */',
      "const shell: Omit<ConsoleShellProps, 'children'> = {",
      `  currentHref: ${q(route)},`,
      '  // nav: navGroups, workspaces, user: currentUser, topbar: { … }',
      '};',
      '',
    );
  }
  lines.push(
    `/** ${item.name} — ${firstSentence(item.description)} */`,
    `export default function ${comp}() {`,
    `  return <${exp}${shell ? ' shell={shell}' : ''} />;`,
    '}',
    '',
  );
  return {
    ok: true,
    filename: `${comp}.tsx`,
    code: lines.join('\n'),
    notes: [
      'Every template prop is optional; unset props fall back to the template fixtures — pass your data and handlers.',
      shell ? 'Console template: it renders inside ConsoleShell (SidebarLayout + AppSidebar + AppTopbar); share one `shell` object across pages.' : 'Standalone template (no console frame).',
      'Wrap the app once in <ThemeProvider brand={yourPreset}> and import "@gntik-ai/templates/styles.css" in the global CSS.',
      `Source and props: get_template id=${id}.`,
    ],
  };
}

function pickLayout(blocks: KitItem[], requested?: string): PageLayout | undefined {
  if (requested) {
    const key = requested.toLowerCase().trim();
    const l = LAYOUT_ALIASES[key] ?? (PAGE_LAYOUTS as readonly string[]).find((x) => x === key);
    return l as PageLayout | undefined;
  }
  if (blocks.every((b) => b.group === 'auth')) return 'auth-layout';
  if (blocks.every((b) => b.group === 'marketing')) return 'stacked-layout';
  return 'console';
}

function blocksPage(kit: KitRegistry, ids: string[], input: ScaffoldPageInput): Scaffold {
  const notes: string[] = [];
  const items: KitItem[] = [];
  const unknown: string[] = [];
  for (const id of ids) {
    const item = kit.byId.get(id);
    if (item?.kind === 'block') items.push(item);
    else unknown.push(id);
  }
  if (unknown.length) {
    const hints = unknown.map((u) => { const n = nearIds(kit, u, 'block', 3); return n.length ? `${u} → ${n.join(', ')}` : u; });
    return { ok: false, notes: [], error: `Unknown block id(s): ${hints.join('; ')}. See list_kit kind=block.` };
  }
  const layout = pickLayout(items, input.layout);
  if (!layout) {
    return {
      ok: false,
      notes: [],
      error: `Unsupported layout "${input.layout}". Use one of: ${PAGE_LAYOUTS.join(', ')} (sidebar-layout = console). Layouts with required slots (settings, split, inspector, wizard, status) are best started from a template.`,
    };
  }
  let body = items;
  if (layout === 'console') {
    const shellBlocks = body.filter((b) => b.group === 'shell' && ['app-sidebar', 'app-topbar'].includes(b.id));
    if (shellBlocks.length) notes.push(`Skipped ${shellBlocks.map((b) => b.id).join(', ')}: ConsoleShell already renders the sidebar and topbar.`);
    body = body.filter((b) => !shellBlocks.includes(b));
  }
  const header = layout !== 'auth-layout' ? body.find((b) => b.id === 'page-header') : undefined;
  body = body.filter((b) => b !== header);

  const blockNames = new Set<string>();
  const jsx = (b: KitItem) => {
    const names = exportNamesOf(kit.root, b);
    const name = names[0] ?? exportNameOf(kit.root, b);
    blockNames.add(name);
    if (names.length > 1 && !names.includes(pascal(b.id))) notes.push(`${b.id} exports ${names.join(', ')}; the page uses ${name}.`);
    return `<${name} />`;
  };
  const headerJsx = header ? jsx(header) : undefined;
  const children = body.map(jsx);
  const content = children.length > 1 ? ['<Stack gap={6}>', ...children.map((c) => `  ${c}`), '</Stack>'] : children;

  const ui = new Set<string>();
  if (children.length > 1) ui.add('Stack');
  let tree: string[];
  const pageOpen = `<Page width="wide"${headerJsx ? ` header={${headerJsx}}` : ''}>`;
  switch (layout) {
    case 'console':
      ui.add('Page');
      tree = [`<ConsoleShell currentHref=${jsxStr(input.route ?? '/')}>`, `  ${pageOpen}`, ...content.map((c) => `    ${c}`), '  </Page>', '</ConsoleShell>'];
      break;
    case 'page':
      ui.add('Page');
      tree = [pageOpen, ...content.map((c) => `  ${c}`), '</Page>'];
      break;
    case 'stacked-layout':
      ui.add('StackedLayout');
      tree = [`<StackedLayout${headerJsx ? ` pageHeader={${headerJsx}}` : ''}>`, ...content.map((c) => `  ${c}`), '</StackedLayout>'];
      break;
    default: {
      const tag = pascal(layout);
      ui.add(tag);
      const full = layout === 'auth-layout' || layout === 'print-layout' ? ' fullScreen' : '';
      const head = headerJsx && layout !== 'auth-layout' ? ` header={${headerJsx}}` : '';
      tree = [`<${tag}${full}${head}>`, ...content.map((c) => `  ${c}`), `</${tag}>`];
    }
  }
  const comp = input.name ? pascal(input.name) : input.route ? `${pascal(input.route)}Page` : 'NewPage';
  const imports = [
    `import { ${[...blockNames].sort().join(', ')} } from '@gntik-ai/blocks';`,
    ...(layout === 'console' ? ["import { ConsoleShell } from '@gntik-ai/templates';"] : []),
    ...(ui.size ? [`import { ${[...ui].sort().join(', ')} } from '@gntik-ai/ui';`] : []),
  ];
  const code = [
    ...imports,
    '',
    `/** ${layout === 'console' ? 'Console page' : 'Page'}: ${items.map((b) => b.name).join(' · ')}. Blocks render their fixtures until you pass data. */`,
    `export default function ${comp}() {`,
    '  return (',
    indent(tree.join('\n'), 4),
    '  );',
    '}',
    '',
  ].join('\n');
  notes.push(
    `Layout: ${layout}${input.layout ? '' : ' (inferred)'}.`,
    layout === 'console'
      ? 'ConsoleShell takes nav, workspaces, user, usage and topbar props — pass your product frame (see apps/example-vite/src/shell.tsx).'
      : 'Inside an existing shell that already has <main>, use layout "page" (or the layout\'s `embedded` prop where it has one).',
    'Each block\'s props (data, handlers, copy): get_block id=<id>.',
  );
  return { ok: true, filename: `${comp}.tsx`, code, notes };
}

/* ── brand presets ────────────────────────────────────────────────────────── */

export interface ScaffoldPresetInput {
  name: string;
  id?: string;
  /** Square SVG mark (markup). Omitted → a token-coloured monogram. */
  svg?: string;
  /** "tokens" (default) maps hard-coded fills/strokes to token classes; "keep" preserves the artwork. */
  colors?: 'tokens' | 'keep';
  /** Put the mark on the 64×64 chrome tile like the built-in presets (default true). */
  tile?: boolean;
}

const COLOR_ATTR = /\s(fill|stroke)=(["'])([^"']*)\2/g;
const KEEP_VALUES = /^(none|currentColor|transparent|inherit|url\(.*\))$/i;

/** Rough luminance of a #hex / rgb() colour (0..1); undefined when unknown. */
function luminance(value: string): number | undefined {
  let r: number, g: number, b: number;
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  const rgb = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i.exec(value.trim());
  if (hex?.[1]) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1];
    [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
  } else if (rgb) {
    [r, g, b] = [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  } else if (/^(black)$/i.test(value)) return 0;
  else if (/^(white)$/i.test(value)) return 1;
  else return undefined;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

const JSX_ATTR: Record<string, string> = { class: 'className', 'xlink:href': 'href', 'xml:space': 'xmlSpace' };

/** SVG markup → JSX: attribute names camelCased, comments/titles/style dropped. */
export function svgToJsx(inner: string): string {
  return inner
    .replace(/<\?xml[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE[^>]*>/g, '')
    .replace(/<(title|desc|metadata)[\s\S]*?<\/\1>/g, '')
    .replace(/\s(?:xmlns(?::\w+)?|style|data-name|class)=(["'])[^"']*\1/g, '')
    .replace(/\s([a-z]+(?:[-:][a-z]+)+|class)=/g, (_, a: string) => ` ${JSX_ATTR[a] ?? a.replace(/[-:]([a-z])/g, (_m, c: string) => c.toUpperCase())}=`)
    .replace(/>\s+</g, '><')
    .replace(/<(\w+)([^>]*?)\s*><\/\1>/g, '<$1$2 />')
    .replace(/></g, '>\n<')
    .trim();
}

function tokenizeColors(jsx: string, notes: string[]): string {
  const seen = new Map<string, string>();
  const out = jsx.replace(/<(\w+)([^>]*?)(\s*\/?)>/g, (tag, el: string, attrs: string, close: string) => {
    const classes: string[] = [];
    const rest = attrs.replace(COLOR_ATTR, (m, prop: string, _q: string, value: string) => {
      if (KEEP_VALUES.test(value.trim())) return m;
      const l = luminance(value);
      const token = l !== undefined && l < 0.25 ? 'chrome' : 'primary';
      seen.set(value, token);
      classes.push(`${prop}-${token}`);
      return '';
    });
    if (!classes.length) return tag;
    const merged = /\sclassName=(["'])([^"']*)\1/.test(rest)
      ? rest.replace(/\sclassName=(["'])([^"']*)\1/, (_m, qq: string, c: string) => ` className=${qq}${c} ${classes.join(' ')}${qq}`)
      : `${rest} className="${classes.join(' ')}"`;
    return `<${el}${merged}${close}>`;
  });
  if (seen.size) notes.push(`Mapped artwork colours to tokens: ${[...seen].map(([v, t]) => `${v} → ${t}`).join(', ')}. Dark fills become \`chrome\`, the rest \`primary\`; adjust per path if needed.`);
  return out;
}

export function scaffoldPreset(input: ScaffoldPresetInput): Scaffold {
  const name = input.name.trim();
  if (!name) return { ok: false, notes: [], error: '`name` is required.' };
  const id = kebab(input.id ?? name) || 'brand';
  const constName = `${camel(id)}Preset`;
  const notes: string[] = [];
  const tile = input.tile ?? true;
  const open = '<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="block shrink-0">';
  let markBody: string[];
  if (!input.svg?.trim()) {
    const letter = (name.match(/[A-Za-z0-9]/)?.[0] ?? 'G').toUpperCase();
    markBody = [
      open,
      '  <rect width="64" height="64" rx="14" className="fill-chrome" />',
      `  <text x="32" y="43" textAnchor="middle" fontSize="30" fontWeight="600" className="fill-primary">${letter}</text>`,
      '</svg>',
    ];
    notes.push('No SVG given: the mark is a token-coloured monogram placeholder (like falconePreset). Swap it for the real artwork later.');
  } else {
    const root = /<svg\b([^>]*)>([\s\S]*)<\/svg>/i.exec(input.svg);
    if (!root) return { ok: false, notes: [], error: '`svg` must be <svg …>…</svg> markup.' };
    const attrs = root[1] ?? '';
    const vb = /viewBox=(["'])([^"']+)\1/i.exec(attrs)?.[2]
      ?? (() => {
        const w = /\swidth=(["'])(\d+(?:\.\d+)?)/.exec(attrs)?.[2];
        const h = /\sheight=(["'])(\d+(?:\.\d+)?)/.exec(attrs)?.[2];
        return w && h ? `0 0 ${w} ${h}` : '0 0 64 64';
      })();
    let inner = svgToJsx(root[2] ?? '');
    if ((input.colors ?? 'tokens') === 'tokens') inner = tokenizeColors(inner, notes);
    else if (/(fill|stroke)=(["'])(#|rgb)/i.test(inner)) notes.push('Artwork colours kept: hex fills are only acceptable for official logo artwork (as musematicPreset does); ESLint brand rules flag them elsewhere.');
    markBody = tile
      ? [open, '  <rect width="64" height="64" rx="14" className="fill-chrome" />', `  <svg x="9" y="9" width="46" height="46" viewBox="${vb}">`, indent(inner, 4), '  </svg>', '</svg>']
      : [`<svg width={size} height={size} viewBox="${vb}" aria-hidden="true" className="block shrink-0">`, indent(inner, 2), '</svg>'];
  }
  const code = [
    "import type { BrandPreset } from '@gntik-ai/ui';",
    '',
    '/**',
    ` * ${name} brand preset: name and logo only. Colours never change between presets — every`,
    ' * product renders the frozen tokens of @gntik-ai/tokens.',
    ' */',
    `export const ${constName}: BrandPreset = {`,
    `  id: ${q(id)},`,
    `  name: ${q(name)},`,
    '  mark: (size) => (',
    indent(markBody.join('\n'), 4),
    '  ),',
    '};',
    '',
  ].join('\n');
  notes.push(
    `Use it once at the root: <ThemeProvider brand={${constName}}> (ThemeProvider from @gntik-ai/ui); <Logo /> and the auth layouts pick it up.`,
    'The file contains JSX: save it as .tsx.',
  );
  return { ok: true, filename: `${id}-preset.tsx`, code, notes };
}
