/* ============================================================================
   gntik-ui-mcp · indexer.ts — parsea el catálogo gntik-ui a un índice servible
   ----------------------------------------------------------------------------
   Fuentes (rutas relativas a la raíz del monorepo, ver PATHS):
     apps/docs/src/catalog/registry.jsx → inventario (grupos · items · estado)
     apps/docs/src/catalog/<id>.jsx     → cabecera, intro y snippets canónicos
                         (const X = `…` referenciadas vía code={X}, o inline)
     packages/tokens/src/brand.css      → capa de marca por tema
     packages/tokens/src/tailwind.css   → puente Tailwind v4 (token → clase)
     *.md              → README / CLAUDE.md (reglas) / INVENTORY
     blocks/*.html     → referencias HTML sueltas (Shell · Login · …)
   buildIndex() parsea esas fuentes; registry.json (generado con
   `pnpm registry`) es su volcado y es lo que loadIndex() sirve si existe.
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import type {
  ComponentDoc, DesignSystemIndex, PortableIndex, RegistryItem, Snippet, TokenTheme, BlockRef,
} from './types.js';

/** Ubicación de cada fuente dentro del monorepo. */
export const PATHS = {
  catalog: path.join('apps', 'docs', 'src', 'catalog'),
  tokens: path.join('packages', 'tokens', 'src', 'brand.css'),
  tailwind: path.join('packages', 'tokens', 'src', 'tailwind.css'),
  registryJson: 'registry.json',
} as const;


/* ── utilidades de parseo ────────────────────────────────────────────────── */

/** Extrae un bloque balanceado (p.ej. `[...]` o `{...}`) saltando strings y comentarios. */
function extractBalanced(text: string, start: number, open: string, close: string): string | undefined {
  let depth = 0;
  let inStr: string | null = null;
  let inLine = false;
  let inBlock = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    const prev = text[i - 1];
    if (inLine) { if (ch === '\n') inLine = false; continue; }
    if (inBlock) { if (prev === '*' && ch === '/') inBlock = false; continue; }
    if (inStr) {
      if (ch === '\\') { i++; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '/' && text[i + 1] === '/') { inLine = true; continue; }
    if (ch === '/' && text[i + 1] === '*') { inBlock = true; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return undefined;
}

/** Lee un template literal desde el backtick de apertura. Devuelve el literal con backticks. */
function readTemplateLiteral(text: string, backtickIdx: number): { raw: string; end: number } | undefined {
  if (text[backtickIdx] !== '`') return undefined;
  for (let i = backtickIdx + 1; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\\') { i++; continue; }
    if (ch === '`') return { raw: text.slice(backtickIdx, i + 1), end: i };
  }
  return undefined;
}

/** Evalúa un template literal aislado (resuelve \` \$ \\). Fallback manual si interpola. */
function evalTemplate(raw: string): string {
  try {
    const v = vm.runInNewContext('(' + raw + ')', Object.create(null), { timeout: 1000 });
    if (typeof v === 'string') return v;
  } catch { /* contiene ${…} sin escapar → fallback */ }
  return raw
    .slice(1, -1)
    .replace(/\\`/g, '`')
    .replace(/\\\$\{/g, '${')
    .replace(/\\\\/g, '\\');
}

function lastMatch(re: RegExp, s: string): string | undefined {
  const r = new RegExp(re.source, 'g');
  let m: RegExpExecArray | null;
  let last: string | undefined;
  while ((m = r.exec(s))) last = m[1];
  return last;
}

/* ── registry ────────────────────────────────────────────────────────────── */

export function parseRegistry(root: string): RegistryItem[] {
  const file = path.join(root, PATHS.catalog, 'registry.jsx');
  const text = fs.readFileSync(file, 'utf8');
  const decl = /const\s+REGISTRY\s*=/.exec(text);
  if (!decl) throw new Error('registry.jsx: no encuentro `const REGISTRY`');
  const openIdx = text.indexOf('[', decl.index + decl[0].length);
  if (openIdx < 0) throw new Error('registry.jsx: REGISTRY sin array');
  const arrText = extractBalanced(text, openIdx, '[', ']');
  if (!arrText) throw new Error('registry.jsx: no puedo extraer el array REGISTRY');
  const groups = vm.runInNewContext('(' + arrText + ')', Object.create(null), { timeout: 2000 }) as
    Array<{ group: string; icon?: string; items?: Array<Record<string, string>> }>;
  const items: RegistryItem[] = [];
  for (const g of groups) {
    for (const it of g.items ?? []) {
      if (!it.id || !it.label) continue;
      items.push({
        id: it.id,
        label: it.label,
        icon: it.icon,
        status: it.status ?? 'todo',
        blurb: it.blurb,
        group: g.group,
      });
    }
  }
  return items;
}

/* ── componente (.jsx del grupo) ─────────────────────────────────────────── */

export function parseComponentFile(root: string, item: RegistryItem): ComponentDoc {
  const doc: ComponentDoc = {
    id: item.id, label: item.label, group: item.group,
    status: item.status, blurb: item.blurb, snippets: [],
  };
  const file = path.join(PATHS.catalog, `${item.id}.jsx`);
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return doc;
  doc.file = file;
  const text = fs.readFileSync(full, 'utf8');

  // cabecera: primer comentario /* … */ sin la decoración de ======
  const header = /^\/\*([\s\S]*?)\*\//.exec(text);
  if (header) {
    doc.header = header[1]
      .split('\n')
      .map((l) => l.replace(/^[\s=*-]+|[\s=*-]+$/g, ''))
      .filter((l) => l.length > 0)
      .join('\n');
  }

  const intro = /intro="([^"]*)"/.exec(text);
  if (intro) doc.intro = intro[1];

  // 1 · template literals con nombre:  const NOMBRE = `…`;
  const literals = new Map<string, string>();
  const constRe = /const\s+([A-Za-z_$][\w$]*)\s*=\s*`/g;
  let cm: RegExpExecArray | null;
  while ((cm = constRe.exec(text))) {
    const btIdx = cm.index + cm[0].length - 1;
    const lit = readTemplateLiteral(text, btIdx);
    if (!lit) continue;
    literals.set(cm[1], evalTemplate(lit.raw));
    constRe.lastIndex = lit.end + 1;
  }

  // 2 · referencias code={NOMBRE} y code={`…`} inline, con título/desc del bloque
  const seen = new Set<string>();
  let inlineN = 0;
  const refRe = /code=\{\s*(?:([A-Za-z_$][\w$]*)\s*\}|`)/g;
  let rm: RegExpExecArray | null;
  while ((rm = refRe.exec(text))) {
    let name: string;
    let code: string | undefined;
    if (rm[1]) {
      name = rm[1];
      if (seen.has(name)) continue;
      code = literals.get(name);
    } else {
      const btIdx = text.indexOf('`', rm.index);
      const lit = readTemplateLiteral(text, btIdx);
      if (!lit) continue;
      name = `inline_${++inlineN}`;
      code = evalTemplate(lit.raw);
      refRe.lastIndex = lit.end + 1;
    }
    if (code === undefined) continue;
    seen.add(name);

    // ventana: desde el inicio del tag JSX que contiene el code={…}
    let win = text.slice(Math.max(0, rm.index - 900), rm.index);
    let tagStart = -1;
    const tagRe = /<[A-Z][A-Za-z]*/g;
    let tm: RegExpExecArray | null;
    while ((tm = tagRe.exec(win))) tagStart = tm.index;
    if (tagStart >= 0) win = win.slice(tagStart);

    const snippet: Snippet = {
      name,
      title: lastMatch(/title="([^"]*)"/, win),
      desc: lastMatch(/desc="([^"]*)"/, win),
      lang: lastMatch(/lang="([^"]*)"/, win) ?? 'tsx',
      code,
    };
    doc.snippets.push(snippet);
  }
  return doc;
}

/* ── tokens ──────────────────────────────────────────────────────────────── */

const THEME_LABEL: Record<string, string> = {
  ':root': 'light',
  '.dark': 'dark',
  '.high_contrast': 'high_contrast',
};

export function parseTokens(css: string): TokenTheme[] {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const themes: TokenTheme[] = [];
  const blockRe = /(:root|\.dark|\.high_contrast)\s*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(clean))) {
    const theme = THEME_LABEL[m[1]] ?? m[1];
    let entry = themes.find((t) => t.theme === theme);
    if (!entry) {
      entry = { theme, selector: m[1], tokens: {} };
      themes.push(entry);
    }
    const declRe = /--([\w-]+)\s*:\s*([^;]+);/g;
    let d: RegExpExecArray | null;
    while ((d = declRe.exec(m[2]))) entry.tokens[d[1]] = d[2].trim();
  }
  return themes;
}

/* ── puente Tailwind v4 (packages/tokens/src/tailwind.css) ─────────────── */

export function extractTailwindConfig(root: string): string | undefined {
  const p = path.join(root, PATHS.tailwind);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : undefined;
}

/* ── docs y secciones ────────────────────────────────────────────────────── */

function readIf(root: string, file: string): string | undefined {
  const p = path.join(root, file);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : undefined;
}

export function extractSection(md: string | undefined, heading: RegExp): string | undefined {
  if (!md) return undefined;
  const lines = md.split('\n');
  const start = lines.findIndex((l) => heading.test(l));
  if (start < 0) return undefined;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) { end = i; break; }
  }
  return lines.slice(start, end).join('\n').trim();
}

/* ── blocks ──────────────────────────────────────────────────────────────── */

function listBlocks(root: string): BlockRef[] {
  const dir = path.join(root, 'blocks');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => ({ name: f.replace(/\.html$/, ''), file: path.join('blocks', f) }));
}

/** Lee un block HTML de forma segura (solo basenames dentro de blocks/). */
export function readBlock(root: string, name: string): string | undefined {
  const base = path.basename(name).replace(/\.html$/, '');
  const p = path.join(root, 'blocks', `${base}.html`);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : undefined;
}

/* ── índice completo ─────────────────────────────────────────────────────── */

/** Parsea las fuentes del catálogo (sin metadatos de carga). */
export function buildIndex(root: string): PortableIndex {
  const registry = parseRegistry(root);
  const components: Record<string, ComponentDoc> = {};
  for (const item of registry) components[item.id] = parseComponentFile(root, item);

  const tokensCss = readIf(root, PATHS.tokens) ?? '';
  const themes = parseTokens(tokensCss);
  const claudeMd = readIf(root, 'CLAUDE.md');

  const docs = Object.values(components);
  const snippets = docs.reduce((n, d) => n + d.snippets.length, 0);

  return {
    registry,
    components,
    tokensCss,
    themes,
    tailwindConfig: extractTailwindConfig(root),
    readme: readIf(root, 'README.md'),
    claudeMd,
    inventoryMd: readIf(root, 'INVENTORY.md'),
    rulesMd: extractSection(claudeMd, /^##\s*Reglas/),
    blocks: listBlocks(root),
    stats: {
      groups: new Set(registry.map((r) => r.group)).size,
      components: registry.length,
      withSnippets: docs.filter((d) => d.snippets.length > 0).length,
      snippets,
      tokens: themes.reduce((n, t) => n + Object.keys(t.tokens).length, 0),
    },
  };
}

/** Serializa el índice tal como se guarda en registry.json (estable, sin fechas). */
export function serializeIndex(index: PortableIndex): string {
  return JSON.stringify(index, null, 2) + '\n';
}

/**
 * Índice servible: registry.json si existe (el contrato generado), si no se
 * parsea el catálogo en caliente.
 */
export function loadIndex(
  root: string,
  meta: { source: 'dir' | 'git'; gitHead?: string },
): DesignSystemIndex {
  const json = path.join(root, PATHS.registryJson);
  const portable: PortableIndex = fs.existsSync(json)
    ? (JSON.parse(fs.readFileSync(json, 'utf8')) as PortableIndex)
    : buildIndex(root);
  return {
    root,
    source: meta.source,
    loadedAt: new Date().toISOString(),
    gitHead: meta.gitHead,
    ...portable,
  };
}
