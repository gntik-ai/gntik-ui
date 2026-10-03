#!/usr/bin/env node
// Gate proof for "Falcone built only from the kit": every file under src/ must be glue
// over @gntik-ai/* — no styling of its own, no colours, no other libraries.
//
// Fails when a source file:
//   - sets `className=` or `style=` (own styling),
//   - contains a hex / rgb() / hsl() (or other CSS colour function) literal,
//   - imports anything but react, react-dom, @gntik-ai/* or a relative path,
//   - imports a .css file other than src/index.css,
// when src/ holds any .css file other than src/index.css, or when src/index.css holds anything
// but @import lines for tailwindcss, @gntik-ai/* and the Geist fonts.
//
// Usage: node scripts/check-kit-only.mjs   (exit 0 = pass, 1 = violations listed)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(appDir, 'src');
const indexCss = join(srcDir, 'index.css');
const CODE = /\.(?:[cm]?[jt]sx?)$/;

const ALLOWED_IMPORT = /^(?:react(?:\/.*)?|react-dom(?:\/.*)?|@gntik-ai\/[^/]+(?:\/.*)?|\.{1,2}\/.*)$/;
const ALLOWED_CSS_IMPORT = /^(?:tailwindcss|@gntik-ai\/[^/]+\/[\w./-]+\.css|@fontsource\/geist(?:-mono)?\/\d{3}\.css)$/;

const RULES = [
  [/\bclassName\s*=/, 'sets className= (own styling)'],
  [/\bstyle\s*=/, 'sets style= (own styling)'],
  [/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/, 'hex colour literal'],
  [/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\s*\(/i, 'CSS colour function literal'],
];

/** Removes block comments and whole-line // comments (keeps URLs inside strings intact). */
const stripComments = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/^\s*\/\/.*$/gm, '');

const IMPORT_RES = [
  /^\s*import\s+(?:type\s+)?[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]/gm,
  /^\s*import\s*['"]([^'"]+)['"]/gm,
  /^\s*export\s+(?:type\s+)?[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]/gm,
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const violations = [];
const report = (file, line, message) => violations.push(`${relative(appDir, file)}${line ? `:${line}` : ''}  ${message}`);
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

const files = walk(srcDir);
let codeFiles = 0;

for (const file of files) {
  if (file.endsWith('.css')) {
    if (file !== indexCss) report(file, 0, 'CSS file other than src/index.css');
    continue;
  }
  if (!CODE.test(file)) {
    report(file, 0, 'unexpected file type in src/');
    continue;
  }
  codeFiles++;
  const text = stripComments(readFileSync(file, 'utf8'));
  for (const [re, message] of RULES) {
    const global = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
    for (const m of text.matchAll(global)) report(file, lineOf(text, m.index), `${message}: ${m[0]}`);
  }
  for (const re of IMPORT_RES) {
    for (const m of text.matchAll(re)) {
      const spec = m[1];
      const line = lineOf(text, m.index);
      if (!ALLOWED_IMPORT.test(spec)) report(file, line, `import of "${spec}" (only react, react-dom, @gntik-ai/* and relative paths)`);
      else if (spec.endsWith('.css') && resolve(dirname(file), spec) !== indexCss) report(file, line, `CSS import "${spec}" (only src/index.css)`);
    }
  }
}

// src/index.css: only the documented @import lines, no rules of its own.
try {
  const css = readFileSync(indexCss, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  css.split('\n').forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const m = /^@import\s+["']([^"']+)["']\s*;$/.exec(line);
    if (!m) report(indexCss, i + 1, `not an @import line: ${line}`);
    else if (!ALLOWED_CSS_IMPORT.test(m[1])) report(indexCss, i + 1, `@import of "${m[1]}" (only tailwindcss, @gntik-ai/*/…css and Geist fonts)`);
  });
} catch {
  report(indexCss, 0, 'missing');
}

if (violations.length) {
  console.error(`check-kit-only: ${violations.length} violation(s)\n  ${violations.join('\n  ')}`);
  process.exit(1);
}
console.log(`check-kit-only: OK — ${codeFiles} source files, kit-only (no className/style, no colour literals, imports limited to react, react-dom, @gntik-ai/* and relative paths).`);
