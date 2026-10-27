// Source-only state-hook parsing. No evaluation of component code is needed.
function split(source, separator = ',') {
  const parts = [];
  let start = 0;
  let depth = 0;
  let quote = null;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'" || ch === '`') quote = ch;
    else if ('{[('.includes(ch)) depth++;
    else if ('}])'.includes(ch)) depth--;
    else if (ch === separator && depth === 0) {
      parts.push(source.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(source.slice(start));
  return parts;
}
function objectBody(source, start) {
  let depth = 0;
  let quote = null;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'" || ch === '`') quote = ch;
    else if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return source.slice(start + 1, i);
  }
  return '';
}
function attributes(text) {
  return [...text.matchAll(/(?:group-)?data-(?:\[([\w-]+)(?:[^\]]*)\]|([\w-]+))(?:\/[\w-]+)?:/g)].map(
    (m) => `data-${m[1] ?? m[2]}`,
  );
}
export function parseDataAttributes(source, shared = '') {
  const declarations = new Map();
  for (const text of [shared, source]) {
    for (const statement of split(text, ';')) {
      const match = /(?:export\s+)?const\s+(\w+)\s*=([\s\S]*)/.exec(statement);
      if (match) declarations.set(match[1], match[2]);
    }
  }
  const expand = (text, seen = new Set()) => {
    // Only expand identifiers outside strings, so class names are never mistaken for references.
    const outside = text.replace(/(['"`])(?:\\.|(?!\1)[\s\S])*?\1/g, '');
    let result = text;
    for (const name of outside.match(/\b\w+\b/g) ?? []) {
      if (!seen.has(name) && declarations.has(name))
        result += ' ' + expand(declarations.get(name), new Set([...seen, name]));
    }
    return result;
  };
  const rows = [];
  const slots = new Set();
  for (const match of source.matchAll(/\bslots\s*:\s*\{/g)) {
    const body = objectBody(source, match.index + match[0].length - 1);
    for (const entry of split(body)) {
      const slot = /^\s*(\w+)\s*:\s*([\s\S]*)/.exec(entry);
      if (!slot) continue;
      slots.add(slot[1]);
      for (const attribute of new Set(attributes(expand(slot[2])))) rows.push({ attribute, part: slot[1] });
    }
  }
  // Include the same slots when a variant overrides their classes.
  const masked = source.replace(/(['"`])(?:\\.|(?!\1)[\s\S])*?\1|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, (text) =>
    ' '.repeat(text.length),
  );
  for (const match of masked.matchAll(/\b(\w+)\s*:/g)) {
    if (!slots.has(match[1])) continue;
    const start = match.index + match[0].length;
    let depth = 0;
    let end = start;
    for (; end < masked.length; end++) {
      const ch = masked[end];
      if (depth === 0 && (ch === ',' || ch === '}')) break;
      if ('{[('.includes(ch)) depth++;
      else if ('}])'.includes(ch)) depth--;
    }
    for (const attribute of new Set(attributes(expand(source.slice(start, end)))))
      rows.push({ attribute, part: match[1] });
  }
  // Single-root tv({ base: ... }) components have no slots.
  if (!/\bslots\s*:/.test(source)) {
    for (const attribute of new Set(attributes(expand(source)))) rows.push({ attribute, part: 'root' });
  }
  return rows.filter(
    (row, index) => rows.findIndex((r) => r.part === row.part && r.attribute === row.attribute) === index,
  );
}
export function validateDataAttributes(doc, source) {
  for (const [attribute] of doc.dataAttributes ?? []) {
    const present =
      [...source.matchAll(/\bdata-[\w-]+/g)].some((m) => m[0] === attribute) ||
      source.includes(`data-[${attribute.slice(5)}=`) ||
      source.includes(`data-[${attribute.slice(5)}]`);
    if (!present) throw new Error(`${doc.name}: ${attribute} is absent from variants and source`);
  }
}
