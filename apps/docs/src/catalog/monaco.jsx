/* ============================================================================
   Gntik UI · monaco.jsx — editor de código (grupo "Editores").
   Monaco Editor (el motor de VS Code) tematizado con los tokens de marca: la
   superficie es una card de musematic, las palabras clave van en el verde de
   marca y el resto del syntax usa los accents categóricos. El tema NO admite
   variables CSS, así que leemos los tokens en vivo, los pasamos a hex y
   redefinimos el tema 'gntik' — un MutationObserver sobre <html> lo vuelve a
   aplicar en cada switch, así el editor reskinea con el resto del catálogo.
   Dominio musematic (agentes del Fleet, policies, manifests). Cero hardcode.
   Variantes: editor interactivo · diff · embebido (solo lectura) · tematizado.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useEffect, useRef } = window;

const MONACO_VERSION = '0.57.0';
const CDN = '/monaco'; // monaco-editor@${MONACO_VERSION} min build, copied by scripts/copy-monaco.mjs
const MONO = 'Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace';

/* ── carga perezosa de Monaco (AMD) — una sola vez, cacheada en window ────── */
function loadMonaco() {
  if (window.__monacoPromise) return window.__monacoPromise;
  window.__monacoPromise = new Promise((resolve, reject) => {
    // Workers: el bundle AMD de Monaco instala su propio MonacoEnvironment.getWorker
    // (blob + assets con hash), así que no hace falta ningún shim aquí.
    const s = document.createElement('script');
    s.src = `${CDN}/vs/loader.js`;
    s.onload = () => {
      window.require.config({ paths: { vs: `${CDN}/vs` } });
      window.require(['vs/editor/editor.main'], () => {
        const m = window.monaco;
        // El sample importa de "@musematic/fleet" (no resoluble) → silenciamos
        // la validación semántica de TS para no ensuciar con squiggles rojos.
        try {
          m.languages.typescript.typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: false });
        } catch (e) {}
        // Geist Mono carga async: re-medir las métricas cuando la fuente esté lista.
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { try { m.editor.remeasureFonts(); } catch (e) {} });
        resolve(m);
      }, reject);
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return window.__monacoPromise;
}

/* ── tokens de marca → hex (Monaco no admite var(--…)) ────────────────────── */
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  const g = n => Math.round(255 * f(n)).toString(16).padStart(2, '0');
  return `#${g(0)}${g(8)}${g(4)}`;
}
function tokHex(name) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return '#000000';
  const [h, s, l] = raw.split(/\s+/).map(parseFloat);
  return hslToHex(h, s, l);
}

/* ── definición del tema de marca (recalculada en cada switch) ────────────── */
function brandThemeData() {
  const c = tokHex;                 // con '#': para el mapa colors
  const r = n => tokHex(n).slice(1);// sin '#': para foreground de las reglas
  const root = document.documentElement.classList;
  const base = root.contains('high_contrast') ? 'hc-black'
    : (root.contains('dark') ? 'vs-dark' : 'vs');
  const primary = c('--primary'), muted = c('--muted-foreground'), border = c('--border'),
        fg = c('--foreground'), card = c('--card'), destructive = c('--destructive'),
        popover = c('--popover');
  return {
    base, inherit: true,
    rules: [
      { token: '', foreground: r('--foreground') },
      { token: 'comment', foreground: r('--muted-foreground'), fontStyle: 'italic' },
      { token: 'keyword', foreground: r('--primary') },
      { token: 'keyword.json', foreground: r('--primary') },
      { token: 'operator', foreground: r('--primary') },
      { token: 'operators', foreground: r('--primary') },
      { token: 'tag', foreground: r('--primary') },
      { token: 'string', foreground: r('--category-cyan') },
      { token: 'string.escape', foreground: r('--category-amber') },
      { token: 'string.key.json', foreground: r('--primary') },
      { token: 'string.value.json', foreground: r('--category-cyan') },
      { token: 'attribute.value', foreground: r('--category-cyan') },
      { token: 'attribute.name', foreground: r('--category-violet') },
      { token: 'number', foreground: r('--category-amber') },
      { token: 'constant', foreground: r('--category-amber') },
      { token: 'regexp', foreground: r('--category-rose') },
      { token: 'type', foreground: r('--category-violet') },
      { token: 'type.identifier', foreground: r('--category-violet') },
      { token: 'identifier', foreground: r('--foreground') },
      { token: 'delimiter', foreground: r('--muted-foreground') },
      { token: 'delimiter.bracket', foreground: r('--muted-foreground') },
      { token: 'annotation', foreground: r('--category-rose') },
      { token: 'metatag', foreground: r('--category-rose') },
    ],
    colors: {
      'editor.background': card,
      'editor.foreground': fg,
      'editorLineNumber.foreground': muted + '59',
      'editorLineNumber.activeForeground': primary,
      'editorCursor.foreground': primary,
      'editor.selectionBackground': primary + '33',
      'editor.inactiveSelectionBackground': primary + '1f',
      'editor.selectionHighlightBackground': primary + '1f',
      'editor.lineHighlightBackground': fg + '0d',
      'editor.lineHighlightBorder': '#00000000',
      'editorIndentGuide.background': border + '99',
      'editorIndentGuide.activeBackground': primary + '80',
      'editorGutter.background': card,
      'editorWhitespace.foreground': border,
      'editorBracketMatch.background': primary + '26',
      'editorBracketMatch.border': primary + '99',
      'editorBracketHighlight.foreground1': primary,
      'editorBracketHighlight.foreground2': c('--category-violet'),
      'editorBracketHighlight.foreground3': c('--category-cyan'),
      'editorOverviewRuler.border': '#00000000',
      'scrollbarSlider.background': muted + '2e',
      'scrollbarSlider.hoverBackground': muted + '4d',
      'scrollbarSlider.activeBackground': muted + '70',
      'editorWidget.background': popover,
      'editorWidget.border': border,
      'editorSuggestWidget.background': popover,
      'editorSuggestWidget.border': border,
      'editorSuggestWidget.selectedBackground': primary + '26',
      'editorSuggestWidget.highlightForeground': primary,
      'editorHoverWidget.background': popover,
      'editorHoverWidget.border': border,
      'editorGutter.modifiedBackground': c('--info'),
      'editorGutter.addedBackground': primary,
      'editorGutter.deletedBackground': destructive,
      'minimap.background': card,
      'minimapSlider.background': muted + '24',
      'diffEditor.insertedTextBackground': primary + '26',
      'diffEditor.removedTextBackground': destructive + '2e',
      'diffEditor.insertedLineBackground': primary + '14',
      'diffEditor.removedLineBackground': destructive + '14',
      'diffEditorGutter.insertedLineBackground': primary + '24',
      'diffEditorGutter.removedLineBackground': destructive + '24',
      'diffEditor.diagonalFill': border + '80',
    },
  };
}

/* ── aplica + sincroniza el tema con el switch del catálogo (una vez) ──────── */
let _themeSynced = false;
function applyBrandTheme(m) { m.editor.defineTheme('gntik', brandThemeData()); m.editor.setTheme('gntik'); }
function ensureThemeSync(m) {
  applyBrandTheme(m);
  if (_themeSynced) return;
  _themeSynced = true;
  new MutationObserver(() => applyBrandTheme(m))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}

/* automaticLayout no mide de forma fiable dentro del iframe de preview (y la
   webfont carga tarde): forzamos varias pasadas de layout tras crear el editor.
   Sin esto, el editor se pinta en blanco o el diff colapsa un lado. */
function kickLayout(editor) {
  const run = () => { try { editor.layout(); } catch (e) {} };
  requestAnimationFrame(run);
  setTimeout(run, 70);
  setTimeout(run, 240);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
}

/* ── hook de carga ───────────────────────────────────────────────────────── */
function useMonaco() {
  const [monaco, setMonaco] = useState(window.monaco || null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    loadMonaco().then(m => { if (alive) setMonaco(m); }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);
  return { monaco, failed };
}

const baseOptions = {
  theme: 'gntik', automaticLayout: true, fontFamily: MONO, fontSize: 13, lineHeight: 21,
  fontLigatures: false, letterSpacing: 0.2, padding: { top: 14, bottom: 14 },
  scrollBeyondLastLine: false, smoothScrolling: true, cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on', renderLineHighlight: 'all', roundedSelection: true,
  tabSize: 2, insertSpaces: true, guides: { indentation: true, bracketPairs: true },
  scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10, useShadows: false },
  overviewRulerLanes: 0, overviewRulerBorder: false, fixedOverflowWidgets: true,
};

/* ── editor estándar ─────────────────────────────────────────────────────── */
function CodeEditor({ value, language, readOnly, minimap = false, wordWrap = false,
                      lineNumbers = true, height, onCursor, onReady }) {
  const { monaco, failed } = useMonaco();
  const host = useRef(null), ed = useRef(null);
  const cursorCb = useRef(onCursor); cursorCb.current = onCursor;

  useEffect(() => {
    if (!monaco || !host.current) return;
    ensureThemeSync(monaco);
    const editor = monaco.editor.create(host.current, {
      ...baseOptions, value, language, readOnly: !!readOnly,
      minimap: { enabled: !!minimap }, wordWrap: wordWrap ? 'on' : 'off',
      lineNumbers: lineNumbers ? 'on' : 'off', lineDecorationsWidth: lineNumbers ? 8 : 0,
    });
    ed.current = editor;
    editor.onDidChangeCursorPosition(e => cursorCb.current && cursorCb.current(e.position));
    if (cursorCb.current) cursorCb.current(editor.getPosition());
    if (onReady) onReady(editor);
    kickLayout(editor);
    return () => editor.dispose();
  }, [monaco]);

  useEffect(() => { const e = ed.current; if (e && monaco) monaco.editor.setModelLanguage(e.getModel(), language); }, [language]);
  useEffect(() => { const e = ed.current; if (e && e.getValue() !== value) e.setValue(value); }, [value]);
  useEffect(() => { ed.current && ed.current.updateOptions({ minimap: { enabled: minimap } }); }, [minimap]);
  useEffect(() => { ed.current && ed.current.updateOptions({ wordWrap: wordWrap ? 'on' : 'off' }); }, [wordWrap]);
  useEffect(() => { ed.current && ed.current.updateOptions({ lineNumbers: lineNumbers ? 'on' : 'off', lineDecorationsWidth: lineNumbers ? 8 : 0 }); }, [lineNumbers]);

  if (failed) return <MonacoFailed height={height} />;
  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={host} className="absolute inset-0" />
      {!monaco && <MonacoLoading />}
    </div>
  );
}

/* ── diff editor ─────────────────────────────────────────────────────────── */
function DiffEditor({ original, modified, language, height }) {
  const { monaco, failed } = useMonaco();
  const host = useRef(null);
  useEffect(() => {
    if (!monaco || !host.current) return;
    ensureThemeSync(monaco);
    // Side-by-side. layout() sin args mide mal dentro del iframe y colapsa un
    // lado del sash → forzamos dimensiones explícitas para que recompute 50/50.
    const editor = monaco.editor.createDiffEditor(host.current, {
      ...baseOptions, readOnly: true, renderSideBySide: true, ignoreTrimWhitespace: false,
      renderOverviewRuler: false, fontSize: 12.5, lineHeight: 20, minimap: { enabled: false },
      diffWordWrap: 'off', renderIndicators: true, renderMarginRevertIcon: false, lineNumbers: 'on',
      useInlineViewWhenSpaceIsLimited: false,
    });
    const o = monaco.editor.createModel(original, language);
    const m = monaco.editor.createModel(modified, language);
    editor.setModel({ original: o, modified: m });
    const fit = () => { const el = host.current; if (el) try { editor.layout({ width: el.clientWidth, height: el.clientHeight }); } catch (e) {} };
    requestAnimationFrame(fit); setTimeout(fit, 70); setTimeout(fit, 240); setTimeout(fit, 600);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    return () => { editor.dispose(); o.dispose(); m.dispose(); };
  }, [monaco]);

  if (failed) return <MonacoFailed height={height} />;
  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={host} className="absolute inset-0" />
      {!monaco && <MonacoLoading />}
    </div>
  );
}

/* ── estados ─────────────────────────────────────────────────────────────── */
function MonacoLoading() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-card">
      <div className="flex items-center gap-2.5 text-muted-foreground">
        <span className="w-4 h-4 rounded-full border-2 border-border border-t-primary animate-spin" />
        <span className="font-mono text-[11px] tracking-wide">cargando monaco…</span>
      </div>
    </div>
  );
}
function MonacoFailed({ height }) {
  return (
    <div className="grid place-items-center bg-card/40 border border-dashed border-border" style={{ height }}>
      <div className="text-center px-8">
        <span className="w-12 h-12 rounded-xl bg-accent text-accent-foreground inline-flex items-center justify-center mb-3"><Icon name="code" size={22} /></span>
        <div className="font-sans font-semibold text-[15px] text-foreground">Monaco no se cargó</div>
        <p className="text-[13px] text-muted-foreground mt-1.5">Revisa la conexión al CDN de <span className="font-mono">monaco-editor</span>.</p>
      </div>
    </div>
  );
}

/* ── envoltura de variante (igual que el resto del catálogo) ──────────────── */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card overflow-hidden">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* pieza de chrome: tab de archivo */
function FileTab({ name, dot = true, active = true }) {
  return (
    <div className={"flex items-center gap-2 h-full px-3.5 border-r border-border/70 " + (active ? 'bg-card text-foreground' : 'text-muted-foreground')}>
      <Icon name="code" size={13} className="text-primary/80" />
      <span className="font-mono text-[11.5px]">{name}</span>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-primary/70" title="cambios sin guardar" />}
    </div>
  );
}
/* botón segmentado pequeño (toolbar / status bar) */
function Seg({ on, onClick, icon, children, title }) {
  return (
    <button onClick={onClick} title={title}
      className={"inline-flex items-center gap-1.5 h-6 px-2 rounded-[5px] font-mono text-[10.5px] transition-colors " +
        (on ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground')}>
      {icon && <Icon name={icon} size={12} />}{children}
    </button>
  );
}

/* ── samples del dominio musematic ───────────────────────────────────────── */
const YAML_CODE = `# support-triage — clasifica y enruta los tickets entrantes.
# Corre en eu-west-1 sobre claude-sonnet-4.
agent: support-triage
model: claude-sonnet-4
region: eu-west-1
maxConcurrency: 24

budget:
  daily: 180
  currency: USD

retry:
  attempts: 3
  backoff: exponential   # exponential | linear
  base: 800

routes:
  - intent: refund
    to: billing-bot
    confidence: 0.72
  - intent: faq
    to: kb-summarizer
    confidence: 0.55
  - intent: incident
    to: escalate
    confidence: 0.40

guardrails:
  - pii:
      redact: [email, card]
      block: false
  - budget:
      hardCap: 200
      notify: ops@musematic.ai`;

const JSON_CODE = `{
  "agent": "support-triage",
  "model": "claude-sonnet-4",
  "region": "eu-west-1",
  "maxConcurrency": 24,
  "budget": { "daily": 180, "currency": "USD" },
  "retry": { "attempts": 3, "backoff": "exponential", "base": 800 },
  "routes": [
    { "intent": "refund", "to": "billing-bot", "confidence": 0.72 },
    { "intent": "faq", "to": "kb-summarizer", "confidence": 0.55 }
  ],
  "guardrails": ["pii.redact", "budget.hardCap"]
}`;

const SAMPLES = {
  yaml: { file: 'support-triage.yaml', label: 'YAML', code: YAML_CODE },
  json: { file: 'agent.json',          label: 'JSON', code: JSON_CODE },
};
const LANG_ORDER = ['yaml', 'json'];

const SHELL_CODE = `# Despliega el agente al Fleet y sigue sus logs en vivo.
musematic deploy support-triage --region eu-west-1 --yes

musematic logs support-triage --since 5m --follow \\
  | grep --line-buffered "handoff"`;

/* ── 1 · editor interactivo (chrome IDE + status bar) ─────────────────────── */
function HeroEditor() {
  const [lang, setLang] = useState('yaml');
  const [pos, setPos] = useState({ lineNumber: 1, column: 1 });
  const [wrap, setWrap] = useState(false);
  const [minimap, setMinimap] = useState(true);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef(null);
  const sample = SAMPLES[lang];

  const copy = () => {
    const v = editorRef.current ? editorRef.current.getValue() : sample.code;
    navigator.clipboard.writeText(v).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1300); });
  };
  const format = () => { const a = editorRef.current && editorRef.current.getAction('editor.action.formatDocument'); if (a) a.run(); };

  return (
    <div className="flex flex-col">
      {/* toolbar superior: tab de archivo + selector de lenguaje */}
      <div className="flex items-stretch justify-between h-10 bg-secondary/35 border-b border-border">
        <div className="flex items-stretch">
          <FileTab name={sample.file} />
        </div>
        <div className="flex items-center gap-2 pr-2.5">
          <div className="flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-card">
            {LANG_ORDER.map(id => (
              <button key={id} onClick={() => setLang(id)}
                className={"h-6 px-2.5 rounded-[5px] font-mono text-[10.5px] font-medium transition-colors " +
                  (lang === id ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                {SAMPLES[id].label}
              </button>))}
          </div>
          <div className="w-px h-5 bg-border" />
          <button onClick={format} title="Formatear documento" className="w-7 h-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Icon name="spark" size={14} /></button>
          <button onClick={copy} title="Copiar" className="w-7 h-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Icon name={copied ? 'check' : 'copy'} size={14} className={copied ? 'text-primary' : ''} /></button>
        </div>
      </div>

      {/* editor */}
      <CodeEditor value={sample.code} language={lang} minimap={minimap} wordWrap={wrap}
        height={460} onCursor={setPos} onReady={ed => { editorRef.current = ed; }} />

      {/* status bar inferior */}
      <div className="flex items-center justify-between h-8 px-2.5 bg-secondary/35 border-t border-border text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center gap-1.5 h-6 px-2 font-mono text-[10.5px]"><Icon name="flow" size={12} className="text-primary" />main</span>
          <Seg on={wrap} onClick={() => setWrap(w => !w)} icon="list" title="Ajuste de línea">wrap</Seg>
          <Seg on={minimap} onClick={() => setMinimap(m => !m)} icon="layout" title="Minimapa">map</Seg>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10.5px]">
          <span>Ln {pos.lineNumber}, Col {pos.column}</span>
          <span className="hidden sm:inline">Spaces: 2</span>
          <span className="text-foreground/80">{sample.file.split('.').pop().toUpperCase()}</span>
          <span className="hidden sm:inline">UTF-8</span>
        </div>
      </div>
    </div>
  );
}

/* ── 2 · diff editor ─────────────────────────────────────────────────────── */
const DIFF_OLD = `export const supportTriage = defineAgent({
  id: "support-triage",
  model: "claude-haiku-4",
  region: "eu-west-1",
  maxConcurrency: 12,
  budget: { daily: 120, currency: "USD" },
  retry: { attempts: 2, backoff: "linear", base: 500 },
  guardrails: [
    policy.pii({ redact: ["email"] }),
  ],
});`;
const DIFF_NEW = `export const supportTriage = defineAgent({
  id: "support-triage",
  model: "claude-sonnet-4",
  region: "eu-west-1",
  maxConcurrency: 24,
  budget: { daily: 180, currency: "USD" },
  retry: { attempts: 3, backoff: "exponential", base: 800 },
  guardrails: [
    policy.pii({ redact: ["email", "card"], block: false }),
    policy.budget({ hardCap: 200, notify: "ops@musematic.ai" }),
  ],
});`;

function DiffPane() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between h-10 px-3 bg-secondary/35 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="code" size={13} className="text-primary/80" />
          <span className="font-mono text-[11.5px] text-foreground">policy/support-triage.ts</span>
          <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded font-mono text-[9.5px] font-semibold bg-warning/16 text-warning">PR #418</span>
        </div>
        <div className="flex items-center gap-2.5 font-mono text-[10.5px]">
          <span className="inline-flex items-center gap-1 text-primary"><span className="w-1.5 h-1.5 rounded-full bg-primary" />+6</span>
          <span className="inline-flex items-center gap-1 text-destructive"><span className="w-1.5 h-1.5 rounded-full bg-destructive" />−3</span>
        </div>
      </div>
      <DiffEditor original={DIFF_OLD} modified={DIFF_NEW} language="typescript" height={300} />
    </div>
  );
}

/* ── 3 · embebido (solo lectura, sin números de línea) ────────────────────── */
function EmbeddedPane() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 h-9 px-3 bg-secondary/35 border-b border-border">
        <span className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-primary/70" />
        </span>
        <span className="font-mono text-[11px] text-muted-foreground ml-1.5">deploy.sh</span>
      </div>
      <CodeEditor value={SHELL_CODE} language="shell" readOnly lineNumbers={false} height={150} />
    </div>
  );
}

/* ── 4 · tematizado de marca (referencia clave → token) ───────────────────── */
const THEME_MAP = [
  ['editor.background', 'bg-card', 'La superficie del editor es una card de musematic'],
  ['editor.foreground · identifier', 'bg-foreground', 'Texto base y variables'],
  ['comment', 'bg-muted-foreground', 'Comentarios en muted, en itálica'],
  ['keyword · operator · tag', 'bg-primary', 'Palabras clave en el verde de marca'],
  ['string · attribute.value', 'bg-category-cyan', 'Cadenas y valores'],
  ['number · constant', 'bg-category-amber', 'Números y constantes'],
  ['type · class', 'bg-category-violet', 'Tipos, clases y atributos'],
  ['regexp · annotation', 'bg-category-rose', 'Regex y decoradores'],
  ['cursor · selection', 'bg-primary', 'Cursor y selección sobre primary'],
  ['diff · insertado', 'bg-primary', 'Líneas añadidas en verde'],
  ['diff · eliminado', 'bg-destructive', 'Líneas borradas en rojo'],
];
function ThemeMap() {
  return (
    <div className="divide-y divide-border">
      {THEME_MAP.map(([sel, swatch, desc]) => (
        <div key={sel} className="flex items-center gap-3 px-4 sm:px-5 py-3">
          <span className={"w-3 h-3 rounded-full shrink-0 ring-1 ring-border " + swatch} />
          <code className="font-mono text-[11.5px] text-foreground shrink-0 w-[200px] truncate">{sel}</code>
          <span className="text-[12.5px] text-muted-foreground" style={{ textWrap: 'pretty' }}>{desc}</span>
        </div>))}
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_EDITOR = `import { useEffect, useRef, useState } from "react";

// Monaco (ESM) con Vite: cada servicio de lenguaje corre en su propio worker.
import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") return new JsonWorker();
    if (label === "typescript" || label === "javascript") return new TsWorker();
    return new EditorWorker();
  },
};

function CodeEditor({ value, language, height, onCursor }) {
  const host = useRef(null);
  useEffect(() => {
    const editor = monaco.editor.create(host.current, {
      value, language,
      theme: "gntik",                 // tema de marca (ver "Tematizado")
      automaticLayout: true,
      fontFamily: "Geist Mono, ui-monospace, monospace",
      fontSize: 13, lineHeight: 21, tabSize: 2,
      minimap: { enabled: true },
      renderLineHighlight: "all",
      scrollBeyondLastLine: false,
      guides: { indentation: true, bracketPairs: true },
    });
    editor.onDidChangeCursorPosition((e) => onCursor?.(e.position));
    return () => editor.dispose();
  }, []);

  return <div ref={host} style={{ height }} />;
}`;

const CODE_DIFF = `// Diff side-by-side — Monaco calcula el diff en un worker.
const editor = monaco.editor.createDiffEditor(host.current, {
  theme: "gntik",
  readOnly: true,
  renderSideBySide: true,       // dos columnas · false = inline/unificado
  ignoreTrimWhitespace: false,
  renderOverviewRuler: false,
  automaticLayout: true,
});

editor.setModel({
  original: monaco.editor.createModel(prev, "typescript"),
  modified: monaco.editor.createModel(next, "typescript"),
});

// El verde/rojo del diff salen de los tokens de marca:
//   diffEditor.insertedLineBackground  →  hsl(var(--primary) / .08)
//   diffEditor.removedLineBackground   →  hsl(var(--destructive) / .08)`;

const CODE_THEME = `/* Monaco NO admite var(--…) en su tema: hay que pasar hex.
   Leemos los tokens de marca en vivo, los convertimos, y redefinimos el tema.
   Un MutationObserver sobre <html> lo vuelve a aplicar en cada switch de tema,
   así el editor reskinea con el resto del catálogo. Cero color hardcodeado. */

const hex = (name) => hslToHex(
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()
);

function brandTheme() {
  const base = document.documentElement.classList.contains("dark") ? "vs-dark" : "vs";
  return {
    base, inherit: true,
    rules: [
      { token: "comment",  foreground: hex("--muted-foreground"), fontStyle: "italic" },
      { token: "keyword",  foreground: hex("--primary") },         // verde de marca
      { token: "string",   foreground: hex("--category-cyan") },
      { token: "number",   foreground: hex("--category-amber") },
      { token: "type",     foreground: hex("--category-violet") },
      { token: "regexp",   foreground: hex("--category-rose") },
    ],
    colors: {
      "editor.background":            hex("--card"),
      "editor.foreground":            hex("--foreground"),
      "editorCursor.foreground":     hex("--primary"),
      "editor.selectionBackground":  hex("--primary") + "33",
      "editorLineNumber.foreground": hex("--muted-foreground") + "59",
      "editorIndentGuide.background":hex("--border") + "99",
    },
  };
}

function applyBrandTheme() {
  monaco.editor.defineTheme("gntik", brandTheme());
  monaco.editor.setTheme("gntik");
}
applyBrandTheme();
new MutationObserver(applyBrandTheme)
  .observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });`;

/* ── sección ─────────────────────────────────────────────────────────────── */
function MonacoSection() {
  return (
    <div>
      <SectionHead kicker="Editores" title="Monaco Editor" status="done"
        intro="El editor de VS Code embebido y tematizado con los tokens de marca: la superficie es una card, las palabras clave van en el verde de musematic y el resto del syntax usa los accents categóricos. Como el tema de Monaco no admite variables CSS, leemos los tokens en vivo y redefinimos el tema 'gntik' en cada switch — así el editor reskinea con el resto del catálogo. Escribe, cambia de lenguaje, compara un diff: todo en la marca." />

      <Variant title="Editor de código"
        desc="Editor completo y editable, con su chrome de IDE: tab de archivo, selector de lenguaje (YAML · JSON), barra de estado con la posición del cursor en vivo y toggles de ajuste de línea y minimapa. El sample es la definición real de un agente del Fleet. Escribe dentro — el resaltado y la selección van en la marca."
        code={CODE_EDITOR}>
        <HeroEditor />
      </Variant>

      <Variant title="Diff editor"
        desc="Comparación side-by-side de un cambio de policy: el modelo sube a claude-sonnet-4, se dobla la concurrencia, se eleva el presupuesto y se añade un guardrail de budget. Monaco calcula el diff en un worker; el verde de lo añadido y el rojo de lo borrado salen de los tokens de marca."
        code={CODE_DIFF}>
        <DiffPane />
      </Variant>

      <Variant title="Embebido · solo lectura"
        desc="El mismo motor en su forma mínima: solo lectura, sin números de línea ni minimapa, para incrustar un snippet dentro de un doc o un panel. Aquí, el comando de despliegue del CLI con resaltado de shell."
        code={CODE_EDITOR}>
        <EmbeddedPane />
      </Variant>

      <Variant title="Tematizado de marca"
        desc="Monaco trae sus propios colores; aquí cada clave del tema se reescribe contra los tokens. No hay color hardcodeado, así que el editor cambia de tema con el catálogo. La tabla mapea cada parte del editor a su token de marca."
        code={CODE_THEME}>
        <ThemeMap />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['monaco'] = MonacoSection;
})();
