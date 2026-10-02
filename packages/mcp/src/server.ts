/* ============================================================================
   gntik-ui-mcp · server.ts — tools, prompts y resources MCP
   ----------------------------------------------------------------------------
   Tools de lectura del catálogo (overview, list/search/get, tokens, shell,
   adopción, reglas), tools de remaquetación (analyze_page, validate_page) y
   sync. Prompts: /remaquetar y /preparar_producto (slash commands en Claude
   Code). Resources: tokens, reglas, inventario y componente/{id}.
   ============================================================================ */
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ComponentDoc, DesignSystemIndex, IndexStats } from './types.js';
import { analyzePage, type Analysis } from './analyze.js';
import { validatePage, RULES, type ValidationReport } from './validate.js';
import { readBlock } from './indexer.js';

export const SERVER_NAME = 'gntik-ui';
export const SERVER_VERSION = '0.1.0';

export interface SyncResult {
  root: string;
  source: 'dir' | 'git';
  gitHead?: string;
  updated?: boolean;
  stats: IndexStats;
}

export interface ServerContext {
  getIndex(): DesignSystemIndex;
  sync(): Promise<SyncResult>;
}

/* ── markdown builders ───────────────────────────────────────────────────── */

const F = '```';

function mdComponent(doc: ComponentDoc): string {
  const out: string[] = [];
  out.push(`# ${doc.label} · \`${doc.id}\` — grupo ${doc.group}`);
  if (doc.blurb) out.push(doc.blurb);
  if (doc.intro) out.push(`> ${doc.intro}`);
  if (doc.header) out.push(`_${doc.header.replace(/\n/g, ' ')}_`);
  if (doc.snippets.length === 0) {
    out.push('(Este item no tiene snippets de código propios en el catálogo.)');
  } else {
    out.push(`## Código canónico (${doc.snippets.length} snippets) — cópialo y adapta textos/datos`);
    doc.snippets.forEach((s, i) => {
      out.push(`### ${i + 1} · ${s.title ?? s.name}`);
      if (s.desc) out.push(s.desc);
      out.push(`${F}${s.lang}\n${s.code}\n${F}`);
    });
  }
  out.push('---');
  out.push('Reglas: solo clases de token (`bg-primary`, `text-foreground`, `border-border`…) — cero colores hardcodeados, sin degradados, sombras planas, sin `dark:`. Valida el resultado con `validate_page`.');
  return out.join('\n\n');
}

function mdList(index: DesignSystemIndex, group?: string, status?: string): string {
  const groups = new Map<string, typeof index.registry>();
  for (const item of index.registry) {
    if (group && item.group.toLowerCase() !== group.toLowerCase()) continue;
    if (status && item.status !== status) continue;
    const arr = groups.get(item.group) ?? [];
    arr.push(item);
    groups.set(item.group, arr);
  }
  const out: string[] = [`# Inventario gntik-ui — ${index.stats.components} componentes en ${index.stats.groups} grupos`];
  for (const [g, items] of groups) {
    out.push(`## ${g}`);
    for (const it of items) {
      const snips = index.components[it.id]?.snippets.length ?? 0;
      out.push(`- \`${it.id}\` — **${it.label}** (${it.status}${snips ? ` · ${snips} snippets` : ''})${it.blurb ? `: ${it.blurb}` : ''}`);
    }
  }
  out.push('\nUsa `get_component` con el `id` para obtener el código canónico.');
  return out.join('\n');
}

function mdOverview(index: DesignSystemIndex): string {
  const light = index.themes.find((t) => t.theme === 'light');
  const primary = light?.tokens['primary'] ?? '145 61% 50%';
  const groups = [...new Set(index.registry.map((r) => r.group))];
  return [
    '# gntik-ui — design system de marca (extraído de musematic)',
    `**Marca:** primario verde \`hsl(${primary})\` · Geist + Geist Mono · radius 0.625rem · 3 temas (light · dark · high_contrast) — dark es la superficie principal.`,
    `**Inventario:** ${index.stats.components} componentes en ${index.stats.groups} grupos · ${index.stats.snippets} snippets de código canónico · ${index.stats.tokens} tokens.`,
    `**Grupos:** ${groups.join(' · ')}`,
    '**Cómo funciona:** todo el estilo sale de `packages/tokens/src/brand.css` (HSL por canales; paquete `@gntik-ai/tokens`). Los componentes usan SOLO clases de token (`bg-primary`, `text-foreground`, `border-border`, `bg-card`…). Re-skinear = editar tokens; el markup no cambia.',
    '## Reglas duras',
    index.rulesMd ?? '- Sobrio: sin degradados, sin glow; sombras planas.\n- Mono-brand verde; el primario nunca se usa como severidad.\n- Cero colores hardcodeados: siempre clases que resuelven a tokens.',
    '## Flujo de remaquetación recomendado',
    [
      '1. `analyze_page` con el código de la página → patrones detectados y componentes sugeridos.',
      '2. `get_component` por cada sugerencia (y `get_app_shell` si la página vive dentro del chrome).',
      '3. Reescribe conservando la lógica (handlers, estado, data, i18n, test-ids) y sustituyendo el markup por el canónico.',
      '4. `validate_page` con el resultado → corrige hasta 0 errores.',
      '5. Si el producto aún no tiene la capa de tokens: `get_adoption_guide`.',
    ].join('\n'),
    'Tools: `list_components` · `search_components` · `get_component` · `get_tokens` · `get_app_shell` · `get_adoption_guide` · `get_rules` · `analyze_page` · `validate_page` · `sync_design_system`. Prompt: `/remaquetar`.',
  ].join('\n\n');
}

function mdValidation(report: ValidationReport, filename?: string): string {
  const head = report.ok
    ? `✅ **Sin errores** — ${report.summary}`
    : `❌ **${report.errors} errores** — ${report.summary}`;
  const out = [`# Validación${filename ? ` · ${filename}` : ''}`, head];
  const shown = report.findings.slice(0, 60);
  if (shown.length) {
    out.push(
      shown
        .map((f) => `- L${f.line} · **${f.rule}** (${f.severity}) — ${f.message}\n  \`${f.excerpt.replace(/`/g, "'")}\``)
        .join('\n'),
    );
    if (report.findings.length > shown.length) out.push(`…y ${report.findings.length - shown.length} más.`);
  }
  if (!report.ok) out.push('Corrige los errores y vuelve a validar. Los avisos: corrígelos o justifícalos.');
  return out.join('\n\n');
}

function mdAnalysis(a: Analysis, filename?: string): string {
  const out = [`# Análisis${filename ? ` · ${filename}` : ''} — ${a.stats.lines} líneas`];
  if (a.frameworks.length) {
    out.push('## Frameworks/librerías legacy detectados');
    out.push(a.frameworks.map((f) => `- **${f.name}** — ${f.hint}`).join('\n'));
  }
  if (a.suggestions.length) {
    out.push('## Componentes gntik-ui sugeridos (por señales encontradas)');
    out.push(
      a.suggestions
        .map((s) => {
          const where = s.lines.length ? ` · líneas ${s.lines.join(', ')}` : '';
          return `- \`${s.id}\`${s.label ? ` — **${s.label}**` : ''} (${s.group ?? '?'}) · ${s.reasons.join('; ')}${where}`;
        })
        .join('\n'),
    );
  } else {
    out.push('No he detectado patrones claros — revisa la página a mano con `list_components` como mapa.');
  }
  out.push(`## Estilos a sustituir — ${a.stats.totalStyleErrors} violaciones de marca detectadas`);
  if (a.styleErrors.length) {
    out.push(a.styleErrors.map((f) => `- L${f.line} · ${f.rule}: \`${f.excerpt.replace(/`/g, "'")}\``).join('\n'));
  } else {
    out.push('(ninguna violación dura detectada)');
  }
  out.push(`**Siguiente paso:** \`get_component\` con: ${a.suggestions.slice(0, 8).map((s) => `\`${s.id}\``).join(', ') || '`list_components`'}.`);
  out.push(`Tokens de marca ya en uso: ${a.stats.tokensUsed}.`);
  return out.join('\n\n');
}

/* ── búsqueda ────────────────────────────────────────────────────────────── */

function searchComponents(index: DesignSystemIndex, query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results: Array<{ doc: ComponentDoc; score: number; matched: string[] }> = [];
  for (const doc of Object.values(index.components)) {
    let score = 0;
    const matched = new Set<string>();
    const fields: Array<[string, string | undefined, number]> = [
      ['id', doc.id, 5],
      ['label', doc.label, 5],
      ['group', doc.group, 2],
      ['blurb', doc.blurb, 3],
      ['intro', doc.intro, 2],
      ['snippets', doc.snippets.map((s) => `${s.name} ${s.title ?? ''} ${s.desc ?? ''}`).join(' '), 2],
      ['code', doc.snippets.map((s) => s.code).join(' '), 1],
    ];
    for (const term of terms) {
      for (const [fname, value, weight] of fields) {
        if (value && value.toLowerCase().includes(term)) {
          score += weight;
          matched.add(fname);
        }
      }
    }
    if (score > 0) results.push({ doc, score, matched: [...matched] });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

/* ── prompts ─────────────────────────────────────────────────────────────── */

function remaquetarPrompt(pagina: string, notas?: string): string {
  return [
    `Remaqueta la página \`${pagina}\` al design system **gntik-ui** usando las tools del server MCP \`${SERVER_NAME}\`.${notas ? `\n\nNotas del usuario: ${notas}` : ''}`,
    'Flujo obligatorio:',
    [
      '1. Lee el archivo de la página y sus estilos/parciales/subcomponentes asociados.',
      '2. Llama a `analyze_page` con el código fuente → componentes sugeridos y violaciones de estilo.',
      '3. Si es tu primera página en esta sesión: `overview` y `get_rules`. Si la página vive dentro del chrome de la app: `get_app_shell`.',
      '4. Para cada patrón detectado llama a `get_component` y usa su código canónico como referencia exacta de markup y clases.',
      '5. Reescribe la página:',
      '   - Conserva TODA la lógica: handlers, estado, data-fetching, rutas, i18n, accesibilidad y test-ids.',
      '   - Sustituye el markup por el canónico del catálogo, adaptando textos y datos reales de la página.',
      '   - Solo clases de token (`bg-primary`, `text-foreground`, `border-border`…): cero colores hardcodeados, sin degradados, sombras planas, sin variantes `dark:` (los tokens gestionan el tema).',
      '   - Si el proyecto no es React, traslada el mismo markup y clases al template del framework (Angular/Vue/HTML).',
      '   - Si encuentras CSS/SCSS propio de la página que queda muerto, elimínalo o márcalo para borrar.',
      '6. Llama a `validate_page` con el resultado. Itera hasta **0 errores**; justifica cada aviso que dejes.',
      '7. Resume: componentes usados, decisiones tomadas, CSS eliminado y TODOs pendientes.',
    ].join('\n'),
    'No inventes clases nuevas si existe un componente equivalente en el catálogo. Ante la duda, `search_components`.',
  ].join('\n\n');
}

function prepararProductoPrompt(framework?: string): string {
  return [
    `Prepara este producto${framework ? ` (${framework})` : ''} para adoptar el design system gntik-ui.`,
    [
      '1. Llama a `get_adoption_guide` y `get_tokens` (format css).',
      '2. Instala `@gntik-ai/tokens` (o copia `brand.css` y `tailwind.css`) e impórtalo tras `@import "tailwindcss";` en el CSS global (`:root` light · `.dark` · `.high_contrast`).',
      '3. Tailwind v4: el puente `tailwind.css` ya mapea cada token a `--color-*` (guíate por el bloque de la guía); en Tailwind v3 usa `hsl(var(--token) / <alpha-value>)`.',
      '4. Activa el tema por clase en `<html>` (`""` light · `dark` · `high_contrast`) y carga Geist + Geist Mono.',
      '5. Verifica con una página piloto: `validate_page` debe dar 0 errores.',
    ].join('\n'),
  ].join('\n\n');
}

/* ── server ──────────────────────────────────────────────────────────────── */

export function buildServer(ctx: ServerContext): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  const text = (t: string) => ({ content: [{ type: 'text' as const, text: t }] });

  /* — tools de catálogo — */

  server.registerTool('overview', {
    title: 'Overview del design system',
    description:
      'Resumen del design system gntik-ui: marca, tokens, reglas duras, inventario y flujo de remaquetación recomendado. Llama a esto primero.',
    inputSchema: {},
  }, async () => text(mdOverview(ctx.getIndex())));

  server.registerTool('list_components', {
    title: 'Listar componentes',
    description: 'Inventario completo del catálogo (id, grupo, estado, snippets). Filtra por grupo o estado.',
    inputSchema: {
      group: z.string().optional().describe('Filtrar por grupo (p.ej. "Formularios", "Overlays")'),
      status: z.string().optional().describe('Filtrar por estado: done | wip | todo'),
    },
  }, async ({ group, status }) => text(mdList(ctx.getIndex(), group, status)));

  server.registerTool('search_components', {
    title: 'Buscar componentes',
    description:
      'Busca componentes del catálogo por palabras clave (id, nombre, descripción y código). Útil cuando ves un patrón legacy y no sabes qué componente de marca lo cubre.',
    inputSchema: {
      query: z.string().describe('Palabras clave, p.ej. "tabla seleccionable", "toast", "dropdown avatar"'),
    },
  }, async ({ query }) => {
    const index = ctx.getIndex();
    const results = searchComponents(index, query);
    if (!results.length) return text(`Sin resultados para «${query}». Prueba \`list_components\`.`);
    const md = [
      `# Resultados para «${query}»`,
      ...results.map((r) =>
        `- \`${r.doc.id}\` — **${r.doc.label}** (${r.doc.group}) · score ${r.score} · match en ${r.matched.join(', ')}${r.doc.blurb ? `\n  ${r.doc.blurb}` : ''}`),
      '\nUsa `get_component` con el id elegido.',
    ].join('\n');
    return text(md);
  });

  server.registerTool('get_component', {
    title: 'Obtener componente',
    description:
      'Devuelve un componente del catálogo con su documentación y TODO su código canónico React+Tailwind listo para pegar/adaptar.',
    inputSchema: {
      id: z.string().describe('id del componente (de list_components/search_components), p.ej. "buttons", "tables", "modal-dialogs"'),
    },
  }, async ({ id }) => {
    const index = ctx.getIndex();
    const doc = index.components[id.toLowerCase().trim()];
    if (!doc) {
      const near = searchComponents(index, id).slice(0, 5).map((r) => `\`${r.doc.id}\``).join(', ');
      return text(`No existe el componente \`${id}\`.${near ? ` ¿Buscabas ${near}?` : ''} Usa \`list_components\`.`);
    }
    return text(mdComponent(doc));
  });

  server.registerTool('get_tokens', {
    title: 'Tokens de marca',
    description:
      'Capa de tokens (packages/tokens/src/brand.css): colores, tipografía, radios y sombras por tema. format=css devuelve el archivo tal cual (para copiar al producto); format=json el parseado.',
    inputSchema: {
      theme: z.enum(['light', 'dark', 'high_contrast', 'all']).optional().describe('Tema concreto o all (defecto)'),
      format: z.enum(['css', 'json']).optional().describe('css (defecto) | json'),
    },
  }, async ({ theme, format }) => {
    const index = ctx.getIndex();
    const t = theme ?? 'all';
    if ((format ?? 'css') === 'json') {
      const themes = t === 'all' ? index.themes : index.themes.filter((x) => x.theme === t);
      return text(`${F}json\n${JSON.stringify(themes, null, 2)}\n${F}`);
    }
    if (t === 'all') return text(`${F}css\n${index.tokensCss}\n${F}`);
    const th = index.themes.find((x) => x.theme === t);
    if (!th) return text(`Tema desconocido: ${t}`);
    const body = Object.entries(th.tokens).map(([k, v]) => `  --${k}:${v};`).join('\n');
    return text(`${F}css\n${th.selector}{\n${body}\n}\n${F}`);
  });

  server.registerTool('get_app_shell', {
    title: 'App shell',
    description:
      'El chrome compartido (sidebar + topbar + cabecera de página): documentación y código canónico. Úsalo cuando la página remaquetada vive dentro del shell de la app.',
    inputSchema: {
      include_html_block: z.boolean().optional().describe('Incluir también blocks/Shell.html (referencia HTML aprobada)'),
    },
  }, async ({ include_html_block }) => {
    const index = ctx.getIndex();
    const doc = index.components['app-shell'];
    if (!doc) return text('El catálogo no tiene app-shell registrado.');
    let md = mdComponent(doc);
    if (include_html_block) {
      const html = readBlock(index.root, 'Shell');
      if (html) md += `\n\n## blocks/Shell.html (referencia HTML aprobada)\n\n${F}html\n${html}\n${F}`;
    }
    return text(md);
  });

  server.registerTool('get_adoption_guide', {
    title: 'Guía de adopción',
    description:
      'Cómo enganchar un producto al design system: importar los tokens (brand.css) y el puente Tailwind v4 (tailwind.css), activar temas por clase y cargar Geist. Incluye el tailwind.css real del catálogo.',
    inputSchema: {},
  }, async () => {
    const index = ctx.getIndex();
    const { extractSection } = await import('./indexer.js');
    const adopt = extractSection(index.readme, /^##\s*(Adoptar|Adopt)/) ?? index.readme ?? '';
    const out = [
      '# Adoptar gntik-ui en un producto',
      adopt,
      '## Puente Tailwind v4 del catálogo (packages/tokens/src/tailwind.css · mapeo token → clase)',
      index.tailwindConfig ? `${F}css\n${index.tailwindConfig}\n${F}` : '(no encontrado: packages/tokens/src/tailwind.css)',
      '## Activación de tema',
      `Clase en \`<html>\`: \`""\` = light · \`dark\` · \`high_contrast\`. Tipografías: Geist + Geist Mono (self-hosted con @fontsource/geist y @fontsource/geist-mono).`,
      'Los tokens completos: tool `get_tokens` (format css) → pega el resultado como `brand.css` e impórtalo en el CSS global (o instala `@gntik-ai/tokens`).',
    ].join('\n\n');
    return text(out);
  });

  server.registerTool('get_rules', {
    title: 'Reglas del design system',
    description:
      'Las reglas duras de la marca + qué comprueba exactamente validate_page (ids de regla y severidad). Léelas antes de reescribir una página.',
    inputSchema: {},
  }, async () => {
    const index = ctx.getIndex();
    const out = [
      '# Reglas duras (CLAUDE.md del catálogo)',
      index.rulesMd ?? '(sección de reglas no encontrada — aplican las comprobaciones de validate_page)',
      '## Qué comprueba `validate_page`',
      RULES.map((r) => `- \`${r.id}\` (**${r.severity}**): ${r.message}`).join('\n'),
      '- `no-tokens` (**warning**): la página no usa ninguna clase de token.',
      'Criterio de aceptación: **0 errores**; cada aviso restante, justificado. Puedes silenciar reglas puntuales con el parámetro `allow`.',
    ].join('\n\n');
    return text(out);
  });

  /* — tools de remaquetación — */

  server.registerTool('analyze_page', {
    title: 'Analizar página legacy',
    description:
      'Analiza el código de una página (React, Angular, Vue, HTML…): detecta patrones de UI y librerías legacy, sugiere los componentes gntik-ui equivalentes y lista las violaciones de marca a sustituir. Primer paso de toda remaquetación.',
    inputSchema: {
      source: z.string().describe('Código fuente completo de la página'),
      filename: z.string().optional().describe('Nombre/ruta del archivo (solo informativo)'),
    },
  }, async ({ source, filename }) => text(mdAnalysis(analyzePage(source, ctx.getIndex()), filename)));

  server.registerTool('validate_page', {
    title: 'Validar página remaquetada',
    description:
      'Valida una página contra las reglas duras del design system (colores hardcodeados, paleta Tailwind fuera de tokens, degradados, glow, dark:, tipografía). Devuelve errores/avisos con línea y extracto. Itera hasta 0 errores.',
    inputSchema: {
      source: z.string().describe('Código fuente de la página remaquetada'),
      filename: z.string().optional().describe('Nombre/ruta del archivo (solo informativo)'),
      allow: z.array(z.string()).optional().describe('ids de regla a ignorar (p.ej. ["dark-variant"])'),
    },
  }, async ({ source, filename, allow }) => text(mdValidation(validatePage(source, { filename, allow }), filename)));

  server.registerTool('sync_design_system', {
    title: 'Sincronizar catálogo',
    description:
      'Re-lee el catálogo gntik-ui (git pull si el server lo clonó él mismo) y reconstruye el índice. Úsalo si el design system ha cambiado durante la sesión.',
    inputSchema: {},
  }, async () => {
    const r = await ctx.sync();
    return text(
      `Catálogo sincronizado desde ${r.source === 'git' ? 'git' : 'directorio local'} (${r.root})` +
      `${r.gitHead ? ` · HEAD \`${r.gitHead}\`` : ''}${r.updated === false ? ' · sin cambios' : ''}\n` +
      `Índice: ${r.stats.components} componentes · ${r.stats.snippets} snippets · ${r.stats.tokens} tokens.`,
    );
  });

  /* — prompts (slash commands en Claude Code) — */

  server.registerPrompt('remaquetar', {
    title: 'Remaquetar una página al design system',
    description: 'Flujo completo de remaquetación de una página: analizar → componentes → reescribir → validar.',
    argsSchema: {
      pagina: z.string().describe('Ruta del archivo de la página a remaquetar'),
      notas: z.string().optional().describe('Notas o restricciones extra (opcional)'),
    },
  }, ({ pagina, notas }) => ({
    messages: [{ role: 'user', content: { type: 'text', text: remaquetarPrompt(pagina, notas) } }],
  }));

  server.registerPrompt('preparar_producto', {
    title: 'Preparar un producto para adoptar gntik-ui',
    description: 'Wiring inicial: tokens, config de Tailwind, temas y tipografía.',
    argsSchema: {
      framework: z.string().optional().describe('Framework del producto (React, Angular, …) — opcional'),
    },
  }, ({ framework }) => ({
    messages: [{ role: 'user', content: { type: 'text', text: prepararProductoPrompt(framework) } }],
  }));

  /* — resources — */

  server.registerResource('tokens', 'gntik-ui://tokens', {
    title: 'brand.css (@gntik-ai/tokens)',
    description: 'Capa de tokens de marca (3 temas)',
    mimeType: 'text/css',
  }, async (uri) => ({
    contents: [{ uri: uri.href, mimeType: 'text/css', text: ctx.getIndex().tokensCss }],
  }));

  server.registerResource('reglas', 'gntik-ui://reglas', {
    title: 'Reglas duras del design system',
    mimeType: 'text/markdown',
  }, async (uri) => ({
    contents: [{ uri: uri.href, mimeType: 'text/markdown', text: ctx.getIndex().rulesMd ?? '' }],
  }));

  server.registerResource('inventario', 'gntik-ui://inventario', {
    title: 'INVENTORY.md del catálogo',
    mimeType: 'text/markdown',
  }, async (uri) => ({
    contents: [{ uri: uri.href, mimeType: 'text/markdown', text: ctx.getIndex().inventoryMd ?? '' }],
  }));

  server.registerResource(
    'componente',
    new ResourceTemplate('gntik-ui://componente/{id}', {
      list: async () => ({
        resources: ctx.getIndex().registry.map((r) => ({
          uri: `gntik-ui://componente/${r.id}`,
          name: r.label,
          description: r.blurb,
          mimeType: 'text/markdown',
        })),
      }),
    }),
    { title: 'Componente del catálogo', mimeType: 'text/markdown' },
    async (uri, { id }) => {
      const doc = ctx.getIndex().components[String(id)];
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'text/markdown',
          text: doc ? mdComponent(doc) : `Componente desconocido: ${id}`,
        }],
      };
    },
  );

  return server;
}
