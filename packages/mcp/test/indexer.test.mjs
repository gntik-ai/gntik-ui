/* Tests del indexer contra el catálogo REAL (la raíz del repo gntik-ui). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadIndex, parseTokens } from '../dist/indexer.js';

const ROOT = process.env.GNTIK_UI_DIR ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const index = loadIndex(ROOT, { source: 'dir' });

test('registry: inventario completo', () => {
  assert.ok(index.stats.components >= 50, `esperaba ≥50 componentes, hay ${index.stats.components}`);
  assert.ok(index.stats.groups >= 10, `esperaba ≥10 grupos, hay ${index.stats.groups}`);
  const buttons = index.registry.find((r) => r.id === 'buttons');
  assert.ok(buttons, 'buttons en el registry');
  assert.equal(buttons.group, 'Elementos');
});

test('componentes: snippets canónicos extraídos', () => {
  const buttons = index.components['buttons'];
  assert.ok(buttons.snippets.length >= 2, `buttons: esperaba ≥2 snippets, hay ${buttons.snippets.length}`);
  const code = buttons.snippets.map((s) => s.code).join('\n');
  assert.match(code, /bg-primary/, 'el código de buttons usa tokens');
  assert.ok(buttons.intro && buttons.intro.length > 20, 'buttons tiene intro');
  assert.ok(buttons.snippets[0].title, 'el snippet tiene título del bloque Variant');
});

test('componentes: escapes de template literal resueltos (charts)', () => {
  const area = index.components['area-charts'];
  assert.ok(area.snippets.length >= 2, `area-charts: esperaba ≥2 snippets, hay ${area.snippets.length}`);
  const stacked = area.snippets.map((s) => s.code).join('\n');
  assert.match(stacked, /toLocaleString/, 'código de charts extraído');
  assert.ok(!stacked.includes('\\`'), 'backticks des-escapados');
  assert.match(stacked, /\$\{v\.toLocaleString\(\)\}/, 'interpolaciones \\${…} restauradas como ${…}');
});

test('cobertura: la gran mayoría de componentes tienen snippets', () => {
  const noCode = index.registry
    .filter((r) => r.status === 'done' && (index.components[r.id]?.snippets.length ?? 0) === 0)
    .map((r) => r.id)
    // overview y foundations son secciones informativas, sin código propio
    .filter((id) => !['overview', 'foundations'].includes(id));
  assert.ok(noCode.length <= 5, `componentes done sin snippets: ${noCode.join(', ')}`);
});

test('tokens: 3 temas con marca verde', () => {
  assert.equal(index.themes.length, 3, 'light · dark · high_contrast');
  const light = index.themes.find((t) => t.theme === 'light');
  assert.ok(light.tokens['primary']?.includes('145'), 'primary hue 145');
  assert.ok(index.stats.tokens > 60, `esperaba >60 tokens, hay ${index.stats.tokens}`);
});

test('tailwind config extraída de index.html', () => {
  assert.ok(index.tailwindConfig, 'tailwind.config presente');
  assert.match(index.tailwindConfig, /primary/, 'mapea el token primary');
});

test('docs y blocks', () => {
  assert.ok(index.rulesMd?.includes('Reglas'), 'sección de reglas del CLAUDE.md');
  assert.ok(index.blocks.some((b) => b.name === 'Shell'), 'blocks/Shell.html listado');
  assert.ok(index.components['app-shell'].snippets.length >= 1, 'app-shell con código');
});

test('parseTokens: merge de bloques repetidos', () => {
  const themes = parseTokens(':root{--a:1;}\n:root{--b:2;}\n.dark{--a:3;}');
  assert.equal(themes.length, 2);
  assert.deepEqual(themes[0].tokens, { a: '1', b: '2' });
});
