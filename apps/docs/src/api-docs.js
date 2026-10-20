// API reference for the kit, generated at build time from the package sources: every
// component, layout, chat and forms-entry *.doc.ts (name, group, keyboard contract, pattern…),
// its exported `*Props` interfaces (members + JSDoc), defaults read from the component's
// destructuring and tv() defaultVariants, and variant options from *.variants.ts.
// Pure parsing over `?raw` imports — a new folder shows up with no registration.

const chartDocs = import.meta.glob('../../../packages/charts/src/*.doc.ts', { eager: true, import: 'doc' });
const utilsDocs = import.meta.glob('../../../packages/ui/src/utils/*.doc.ts', { eager: true, import: 'doc' });
const componentDocs = import.meta.glob('../../../packages/ui/src/components/*/*.doc.ts', {
  eager: true,
  import: 'doc',
});
const layoutDocs = import.meta.glob('../../../packages/ui/src/layouts/*/*.doc.ts', { eager: true, import: 'doc' });
// @gntik-ai/chat: one folder per component, like ui.
const chatDocs = import.meta.glob('../../../packages/chat/src/*/*.doc.ts', { eager: true, import: 'doc' });
// @gntik-ai/ui/forms: the optional react-hook-form entry keeps its files flat, one *.doc.ts per piece.
const formsDocs = import.meta.glob('../../../packages/ui/src/forms/*.doc.ts', { eager: true, import: 'doc' });
const sources = {
  ...import.meta.glob('../../../packages/charts/src/*.{ts,tsx}', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob('../../../packages/ui/src/utils/*.ts', { eager: true, query: '?raw', import: 'default' }),
  ...import.meta.glob('../../../packages/ui/src/components/*/*.{ts,tsx}', {
    eager: true,
    query: '?raw',
    import: 'default',
  }),
  ...import.meta.glob('../../../packages/ui/src/layouts/*/*.{ts,tsx}', {
    eager: true,
    query: '?raw',
    import: 'default',
  }),
  ...import.meta.glob('../../../packages/chat/src/*/*.{ts,tsx}', {
    eager: true,
    query: '?raw',
    import: 'default',
  }),
  ...import.meta.glob('../../../packages/ui/src/forms/*.{ts,tsx}', {
    eager: true,
    query: '?raw',
    import: 'default',
  }),
};

const OPEN = { '{': '}', '(': ')', '[': ']', '<': '>' };
const CLOSE = new Set(['}', ')', ']', '>']);

/** Index just past the bracket that closes the one at `start`. Skips strings and comments. */
function matchClose(src, start) {
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (ch === '/' && src[i + 1] === '*') {
      i = src.indexOf('*/', i + 2) + 1;
      if (i === 0) return src.length;
      continue;
    }
    if (ch === '/' && src[i + 1] === '/') {
      i = src.indexOf('\n', i);
      if (i < 0) return src.length;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      i = skipString(src, i);
      continue;
    }
    if (ch === '=' && src[i + 1] === '>') {
      i++;
      continue;
    } // arrow, not a closing angle
    if (ch in OPEN) depth++;
    else if (CLOSE.has(ch)) {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return src.length;
}

function skipString(src, i) {
  const q = src[i];
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === '\\') {
      j++;
      continue;
    }
    if (src[j] === q) return j;
  }
  return src.length;
}

/** Splits `body` at top-level `sep` characters (outside brackets, strings and comments). */
function splitTop(body, seps) {
  const parts = [];
  let depth = 0;
  let last = 0;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '/' && body[i + 1] === '*') {
      const e = body.indexOf('*/', i + 2);
      i = e < 0 ? body.length : e + 1;
      continue;
    }
    if (ch === '/' && body[i + 1] === '/') {
      const e = body.indexOf('\n', i);
      i = e < 0 ? body.length : e - 1;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      i = skipString(body, i);
      continue;
    }
    if (ch === '=' && body[i + 1] === '>') {
      i++;
      continue;
    }
    if (ch in OPEN) depth++;
    else if (CLOSE.has(ch)) depth--;
    else if (depth === 0 && seps.includes(ch)) {
      parts.push(body.slice(last, i));
      last = i + 1;
    }
  }
  parts.push(body.slice(last));
  return parts;
}

const squash = (s) => s.replace(/\s+/g, ' ').trim();

/** JSDoc text (without @tags) and an optional @default from a member's leading comments. */
function readComment(lead) {
  const blocks = [...lead.matchAll(/\/\*\*([\s\S]*?)\*\//g)].map((m) => m[1]);
  const text = blocks.at(-1) ?? '';
  const lines = text.split('\n').map((l) => l.replace(/^\s*\*\s?/, '').trim());
  const def = lines.find((l) => l.startsWith('@default'));
  const description = squash(lines.filter((l) => !l.startsWith('@')).join(' '));
  return { description, jsdocDefault: def ? def.replace('@default', '').trim() : undefined };
}

/** Members of an object type body: `{ name?: type; … }`. Index signatures are skipped. */
function parseMembers(body) {
  const members = [];
  for (const raw of splitTop(body, [';', ','])) {
    const commentEnd = raw.lastIndexOf('*/');
    const lead = commentEnd >= 0 ? raw.slice(0, commentEnd + 2) : '';
    const decl = squash((commentEnd >= 0 ? raw.slice(commentEnd + 2) : raw).replace(/\/\/[^\n]*/g, ''));
    const m = /^(?:readonly\s+)?(['"]?[\w$-]+['"]?)(\?)?\s*(\(|:)\s*([\s\S]*)$/.exec(decl);
    if (!m) continue;
    const [, rawName, optional, kind, rest] = m;
    const type = kind === '(' ? `(${rest}`.replace(/\)\s*:\s*/, ') => ') : rest;
    members.push({ name: rawName.replace(/['"]/g, ''), required: !optional, type: squash(type), ...readComment(lead) });
  }
  return members;
}

/** tv() variant options and defaults per exported `*VariantProps` type, from a *.variants.ts file. */
function parseVariants(src) {
  const calls = {};
  for (const m of src.matchAll(/export const (\w+)\s*=\s*tv\(/g)) {
    const open = src.indexOf('{', m.index + m[0].length - 1);
    const obj = src.slice(open, matchClose(src, open));
    const variants = {};
    const vAt = obj.search(/\n\s*variants:\s*\{/);
    if (vAt >= 0) {
      const vOpen = obj.indexOf('{', vAt + 1);
      const vBody = obj.slice(vOpen + 1, matchClose(obj, vOpen) - 1);
      for (const entry of splitTop(vBody, [','])) {
        const e = /([\w$]+)\s*:\s*\{([\s\S]*)\}\s*$/.exec(entry.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, ''));
        if (!e) continue;
        variants[e[1]] = splitTop(e[2], [','])
          .map((o) => /^\s*['"]?([\w$-]+)['"]?\s*:/.exec(o.replace(/\/\*[\s\S]*?\*\//g, ''))?.[1])
          .filter(Boolean);
      }
    }
    const defaults = {};
    const dAt = obj.search(/defaultVariants:\s*\{/);
    if (dAt >= 0) {
      const dOpen = obj.indexOf('{', dAt);
      for (const pair of splitTop(obj.slice(dOpen + 1, matchClose(obj, dOpen) - 1), [','])) {
        const p = /^\s*([\w$]+)\s*:\s*([\s\S]+?)\s*$/.exec(pair);
        if (p) defaults[p[1]] = p[2];
      }
    }
    calls[m[1]] = { variants, defaults };
  }
  const byType = {};
  for (const m of src.matchAll(/export type (\w+)\s*=\s*VariantProps<typeof (\w+)>/g))
    if (calls[m[2]]) byType[m[1]] = calls[m[2]];
  return byType;
}

/** Defaults written in the component's parameter destructuring: `({ size = 'auto', … })`. */
function parseDefaults(src, componentName) {
  const re = new RegExp(
    `export (?:function ${componentName}\\s*(?:<[^(]*>)?\\(|const ${componentName}\\s*=\\s*(?:forwardRef[^(]*\\(\\s*)?(?:function\\s*\\w*)?\\s*\\()`,
  );
  const m = re.exec(src);
  if (!m) return {};
  const open = src.indexOf('{', m.index + m[0].length - 1);
  if (open < 0 || /\S/.test(src.slice(m.index + m[0].length, open))) return {};
  const out = {};
  for (const part of splitTop(src.slice(open + 1, matchClose(src, open) - 1), [','])) {
    const d = /^\s*([\w$]+)(?:\s*:\s*[\w$]+)?\s*=\s*([\s\S]+?)\s*$/.exec(part);
    if (d) out[d[1]] = squash(d[2]);
  }
  return out;
}

/** Names of the types an interface extends / a type alias intersects, with Omit<…> keys. */
function parseBases(clause, variantTypes) {
  const bases = [];
  const variantProps = [];
  for (const raw of splitTop(clause, [',', '&'])) {
    const part = squash(raw);
    if (!part || part.startsWith('{')) continue;
    const omit = /^Omit<\s*([\s\S]+?)\s*,\s*([\s\S]+)>$/.exec(part);
    const base = omit ? omit[1] : part;
    const omitted = omit ? [...omit[2].matchAll(/['"]([\w$-]+)['"]/g)].map((x) => x[1]) : [];
    if (variantTypes[base]) {
      const { variants, defaults } = variantTypes[base];
      for (const [name, options] of Object.entries(variants)) {
        if (omitted.includes(name)) continue;
        const isBool = options.every((o) => o === 'true' || o === 'false');
        variantProps.push({
          name,
          required: false,
          type: isBool ? 'boolean' : options.map((o) => `'${o}'`).join(' | '),
          default: defaults[name],
          description: '',
          variant: true,
        });
      }
    } else bases.push(omitted.length ? `${base} (without ${omitted.join(', ')})` : base);
  }
  return { bases, variantProps };
}

/** Every exported `*Props` interface / type alias in a source file. */
function parsePropsTypes(src, variantTypes) {
  const out = [];
  const re = /export (interface|type) (\w+Props)\b/g;
  for (let m = re.exec(src); m; m = re.exec(src)) {
    const [, kind, name] = m;
    let i = m.index + m[0].length;
    while (/\s/.test(src[i])) i++;
    if (src[i] === '<') i = matchClose(src, i); // generics: <Value = string>
    let members = [];
    let clause;
    if (kind === 'interface') {
      // The body is the first top-level `{` (the extends clause may hold Omit<…, …>).
      let open = i;
      for (let depth = 0; open < src.length; open++) {
        const ch = src[open];
        if (ch === '{' && depth === 0) break;
        if (ch === '<' || ch === '(' || ch === '[') depth++;
        else if (ch === '>' || ch === ')' || ch === ']') depth--;
      }
      clause = src.slice(i, open).replace(/^\s*extends\s+/, '');
      const close = matchClose(src, open);
      members = parseMembers(src.slice(open + 1, close - 1));
      re.lastIndex = close;
    } else {
      const eq = src.indexOf('=', i);
      const semi = splitTop(src.slice(eq + 1), [';'])[0];
      clause = semi;
      for (const piece of splitTop(clause, ['&'])) {
        const p = piece.trim();
        if (p.startsWith('{')) members.push(...parseMembers(p.slice(1, matchClose(p, 0) - 1)));
      }
      re.lastIndex = eq + 1 + semi.length;
    }
    const { bases, variantProps } = parseBases(clause, variantTypes);
    const own = new Set(members.map((p) => p.name));
    out.push({
      name,
      component: name.replace(/Props$/, ''),
      props: [...members, ...variantProps.filter((v) => !own.has(v.name))],
      bases,
    });
  }
  return out;
}

const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Where a source file lives: `components/Button`, `layouts/Page`, `chat/ChatMessage` or, for the flat
 * forms entry, `forms/FieldArray` (named after the *.doc.ts, whose own files are FieldArray.tsx and
 * field-array.variants.ts). Files of the forms entry that no doc claims return `null`.
 */
function folderKey(path, docBase) {
  if (path.includes('/charts/src/') && docBase && path.split('/').at(-1).startsWith(`${docBase}.`))
    return `charts/${docBase}`;
  let m = /\/ui\/src\/(components|layouts)\/([^/]+)\//.exec(path);
  if (m) return `${m[1]}/${m[2]}`;
  m = /\/chat\/src\/([^/]+)\//.exec(path);
  if (m) return `chat/${m[1]}`;
  m = /\/ui\/src\/forms\/([^/]+)$/.exec(path);
  if (m && docBase && (m[1].startsWith(`${docBase}.`) || m[1].startsWith(`${kebab(docBase)}.`)))
    return `forms/${docBase}`;
  m = /\/ui\/src\/utils\/([^/]+)$/.exec(path);
  if (m && docBase && m[1].startsWith(`${docBase}.`)) return `utils/${docBase}`;
  return null;
}

const docBaseOf = (docPath) => docPath.slice(docPath.lastIndexOf('/') + 1).replace(/\.doc\.ts$/, '');

function buildApi(docPath, doc) {
  const docBase = docBaseOf(docPath);
  const key = folderKey(docPath, docBase);
  const files = Object.keys(sources).filter((p) => folderKey(p, docBase) === key);
  const isCode = (p) => !/\.(test|doc|stories)\.tsx?$|\/index\.ts$|\.variants\.ts$/.test(p);
  const variantTypes = Object.assign(
    {},
    ...files.filter((p) => p.endsWith('.variants.ts')).map((p) => parseVariants(sources[p])),
  );
  const types = files.filter(isCode).flatMap((p) => {
    const src = sources[p];
    return parsePropsTypes(src, variantTypes).map((t) => {
      const defaults = parseDefaults(src, t.component);
      const variantDefaults = Object.assign({}, ...Object.values(variantTypes).map((v) => v.defaults));
      return {
        ...t,
        props: t.props.map((p) => ({
          ...p,
          default: p.jsdocDefault ?? defaults[p.name] ?? p.default ?? (p.variant ? variantDefaults[p.name] : undefined),
        })),
      };
    });
  });
  // The folder's main props first (ButtonProps for Button/), then the parts in source order.
  const mainName = `${doc.name}Props`;
  types.sort((a, b) => (b.name === mainName) - (a.name === mainName));
  return { ...doc, folder: key.split('/')[1], kind: key.split('/')[0], propTypes: types };
}

const apiOf = (docs) =>
  Object.fromEntries(Object.entries(docs).map(([p, d]) => [folderKey(p, docBaseOf(p)).split('/')[1], buildApi(p, d)]));

export const CHART_API = apiOf(chartDocs);
export const UTILS_API = apiOf(utilsDocs);
export const COMPONENT_API = apiOf(componentDocs);
export const LAYOUT_API = apiOf(layoutDocs);
export const CHAT_API = apiOf(chatDocs);
export const FORMS_API = apiOf(formsDocs);

// Exposed for tests and quick inspection from the console.
export const __parse = { parsePropsTypes, parseVariants, parseDefaults, parseMembers };
