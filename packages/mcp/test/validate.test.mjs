import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePage } from '../dist/validate.js';
import { readFileSync } from 'node:fs';

const PALETTE_CLASSES = [
  'bg-white',
  'bg-black',
  'text-white',
  'text-black',
  'hover:bg-white',
  'dark:text-black',
  'md:hover:text-white',
  'bg-black/50',
];
const COLOR_CLASSES = [
  'bg-[#fff]',
  'bg-[#ffffff80]',
  'text-[rgb(0,0,0)]',
  'text-[rgba(0,0,0,0.5)]',
  'bg-[hsl(0,0%,100%)]',
  'text-[oklch(0.7_0.1_200)]',
  'bg-[color-mix(in_srgb,red,blue)]',
  'text-[white]',
  'hover:bg-[#000]/40',
  'border-[#fff]',
  'ring-[rgb(0,0,0)]',
  'divide-[hwb(0_0%_0%)]',
  'ring-offset-[#000]',
  'from-[white]',
  'border-x-[color:red]',
];
const SAFE_CLASSES = [
  'bg-background',
  'text-foreground',
  'bg-card',
  'text-muted-foreground',
  'bg-[var(--card)]',
  'outline-[var(--ring)]',
  'text-[14px]',
  'border-[2px]',
  'ring-[3px]',
  'stroke-[1.5]',
  'bg-transparent',
  'text-current',
  'border-white',
  'ring-black',
  'fill-white',
  'bg-white-ish',
  'text-whitesmoke',
  'text-whitesmoke-like',
  'var(--bg-white)',
  'bg-[transparent]',
  'text-[currentcolor]',
  'text-[redder]',
  'text-[red_14px]',
  'bg-[color:var(--card)]',
  'shadow-[0_0_30px_rgba(255,0,0,.6)]',
];
const COLOR_UTILS = [
  'bg',
  'text',
  'border',
  'border-x',
  'border-y',
  'border-s',
  'border-e',
  'border-t',
  'border-r',
  'border-b',
  'border-l',
  'divide',
  'outline',
  'ring',
  'ring-offset',
  'inset-ring',
  'shadow',
  'inset-shadow',
  'text-shadow',
  'drop-shadow',
  'decoration',
  'placeholder',
  'caret',
  'accent',
  'fill',
  'stroke',
  'from',
  'via',
  'to',
];
const COLOR_VALUES = [
  '#abc',
  '#abcd',
  '#abcdef',
  '#abcdef80',
  'rgb(0,0,0)',
  'rgba(0,0,0,.5)',
  'hsl(0,0%,0%)',
  'hsla(0,0%,0%,.5)',
  'hwb(0_0%_0%)',
  'lab(50_0_0)',
  'lch(50_0_0)',
  'oklab(0.5_0_0)',
  'oklch(0.5_0_0)',
  'color(srgb_0_0_0)',
  'color-mix(in_srgb,red,blue)',
  'rebeccapurple',
  'AliceBlue',
  'DARKSLATEGREY',
  'color:red',
];

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
  const r = validatePage(`<p class="dark:bg-black">x</p>`, {
    allow: ['dark-variant', 'no-tokens'],
    extendedColorChecks: false,
  });
  assert.equal(r.findings.length, 0);
});

test('bg/text white y black se rechazan por defecto', () => {
  for (const cls of PALETTE_CLASSES) {
    const r = validatePage(`\n<div className="${cls}" />`, { filename: 'Page.tsx' });
    const findings = r.findings.filter((f) => f.rule === 'palette-class');
    assert.equal(findings.length, 1, cls);
    assert.equal(findings[0].severity, 'error');
    assert.equal(findings[0].line, 2);
    assert.ok(findings[0].excerpt.includes(cls), cls);
    assert.deepEqual(Object.keys(findings[0]).sort(), ['excerpt', 'line', 'message', 'rule', 'severity']);
  }
  const r = validatePage(`<p class="dark:bg-black">x</p>`, { allow: ['dark-variant', 'no-tokens'] });
  assert.deepEqual(
    r.findings.map((f) => f.rule),
    ['palette-class'],
  );
});

test('extendedColorChecks false conserva los informes del commit base', () => {
  const baseline = JSON.parse(readFileSync(new URL('./fixtures/validate-legacy.json', import.meta.url), 'utf8'));
  assert.equal(baseline.sourceCommit, '6051024d8b87e2e0896b42cabd6b554f0e73bd25');
  for (const fixture of baseline.cases) {
    assert.deepEqual(
      validatePage(fixture.source, { ...fixture.options, extendedColorChecks: false }),
      fixture.report,
      fixture.source,
    );
  }
});

test('colores arbitrarios producen un solo error por clase', () => {
  const classes = [
    ...COLOR_CLASSES,
    ...COLOR_UTILS.flatMap((util) =>
      ['white', 'rgb(0,0,0)', 'color:red'].map((value) => `md:hover:${util}-[${value}]/40`),
    ),
    ...COLOR_VALUES.map((value) => `bg-[${value}]`),
  ];
  for (const cls of classes) {
    const r = validatePage(`\n<div className="${cls}" />`);
    const findings = r.findings.filter((f) => f.rule === 'arbitrary-color');
    assert.equal(findings.length, 1, cls);
    assert.equal(findings[0].severity, 'error', cls);
    assert.equal(findings[0].line, 2, cls);
    assert.ok(findings[0].excerpt.includes(cls), cls);
  }
  const r = validatePage('<div className="bg-[#fff] text-[rgb(0,0,0)] border-x-[color:red]" />');
  assert.equal(r.findings.filter((f) => f.rule === 'arbitrary-color').length, 3);
});

test('límites y valores que no son colores no añaden hallazgos', () => {
  for (const cls of SAFE_CLASSES) {
    const source = `<div className="${cls}" />`;
    const r = validatePage(source);
    assert.deepEqual(
      r.findings.filter((f) => ['palette-class', 'arbitrary-color'].includes(f.rule)),
      [],
      cls,
    );
    assert.deepEqual(r, validatePage(source, { extendedColorChecks: false }), cls);
  }
});

test('el propio catálogo pasa la validación (buttons)', async () => {
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { loadIndex } = await import('../dist/indexer.js');
  const ROOT = process.env.GNTIK_UI_DIR ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
  const index = loadIndex(ROOT, { source: 'dir' });
  for (const id of ['buttons', 'tables', 'modal-dialogs', 'alerts']) {
    const code = index.components[id].snippets.map((s) => s.code).join('\n');
    const r = validatePage(code);
    assert.equal(
      r.errors,
      0,
      `${id}: ${JSON.stringify(
        r.findings.filter((f) => f.severity === 'error'),
        null,
        2,
      )}`,
    );
  }
});
