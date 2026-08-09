import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePage } from '../dist/validate.js';

const BAD = `
<div style="background:#ff0000" class="bg-red-500 text-white">
  <span class="bg-gradient-to-r from-pink-500 to-purple-600">glow</span>
  <p class="shadow-[0_0_30px_rgba(255,0,0,.6)] dark:bg-black">hola</p>
  <i style="color: rgb(12, 34, 56)"></i>
</div>`;

const GOOD = `
export function Fila() {
  return (
    <button className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 rounded-lg h-9 px-3.5">
      Deploy agent
    </button>
  );
}
const chip = <span className="bg-primary/14 text-primary border border-border rounded-md">ok</span>;
`;

test('detecta violaciones duras', () => {
  const r = validatePage(BAD);
  const rules = new Set(r.findings.map((f) => f.rule));
  assert.equal(r.ok, false);
  assert.ok(rules.has('hex-color'), 'hex');
  assert.ok(rules.has('palette-class'), 'paleta tailwind');
  assert.ok(rules.has('gradient'), 'degradado');
  assert.ok(rules.has('raw-color-fn'), 'rgb() crudo');
  assert.ok(rules.has('dark-variant'), 'dark:');
  assert.ok(rules.has('glow-shadow'), 'glow');
  assert.ok(r.errors >= 4, `esperaba ≥4 errores, hay ${r.errors}`);
});

test('acepta código tokenizado del catálogo', () => {
  const r = validatePage(GOOD);
  assert.equal(r.errors, 0, JSON.stringify(r.findings, null, 2));
  assert.ok(r.tokensUsed >= 4, `tokens usados: ${r.tokensUsed}`);
});

test('permite la trama repeating-gradient con tokens', () => {
  const r = validatePage(
    `<div style={{ backgroundImage: 'repeating-linear-gradient(135deg, hsl(var(--border) / 0.5) 0 1px, transparent 1px 11px)' }} />`,
  );
  assert.equal(r.findings.filter((f) => f.rule === 'gradient').length, 0, 'trama del catálogo permitida');
});

test('hsl(var(--token)) no es color crudo', () => {
  const r = validatePage(`<i className="text-primary" style={{ color: 'hsl(var(--primary) / 0.5)' }} />`);
  assert.equal(r.findings.filter((f) => f.rule === 'raw-color-fn').length, 0);
});

test('no confunde anclas ni entidades con hex', () => {
  const r = validatePage(`<a href="#cafe">ir</a> &#39; <use href="#def" /> url(#abc)`);
  assert.equal(r.findings.filter((f) => f.rule === 'hex-color').length, 0);
});

test('allow silencia reglas', () => {
  const r = validatePage(`<p class="dark:bg-black">x</p>`, { allow: ['dark-variant', 'no-tokens'] });
  assert.equal(r.findings.length, 0);
});

test('el propio catálogo pasa la validación (buttons)', async () => {
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { loadIndex } = await import('../dist/indexer.js');
  const ROOT = process.env.GNTIK_UI_DIR ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const index = loadIndex(ROOT, { source: 'dir' });
  for (const id of ['buttons', 'tables', 'modal-dialogs', 'alerts']) {
    const code = index.components[id].snippets.map((s) => s.code).join('\n');
    const r = validatePage(code);
    assert.equal(r.errors, 0, `${id}: ${JSON.stringify(r.findings.filter((f) => f.severity === 'error'), null, 2)}`);
  }
});
