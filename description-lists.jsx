/* ============================================================================
   Gntik UI · description-lists.jsx — pares clave-valor para detalle de recurso.
   La <dl> que describe un agente, un run o un namespace: etiqueta + valor en
   filas divididas. Valores como pills de estado, IDs mono copiables, avatar de
   owner, chips de policy y una API key con reveal. Dominio musematic · tokens.
   Variantes: simple · en card · rayada · dos columnas.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

/* ── pill de estado (mono · tono por estado) ─────────────────────────────── */
const Pill = ({ tone = 'primary', children }) => {
  const map = {
    primary: 'bg-primary/14 text-primary',
    muted: 'bg-muted-foreground/16 text-muted-foreground',
    warning: 'bg-warning/16 text-warning',
  };
  return (
    <span className={"inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold " + (map[tone] || map.primary)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />{children}
    </span>
  );
};

/* ── valor mono con copiar (interactivo) ─────────────────────────────────── */
function CopyVal({ value, display }) {
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); });
  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <span className="font-mono text-[12.5px] text-foreground truncate">{display || value}</span>
      <button onClick={copy} aria-label="Copiar"
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
        <Icon name={copied ? 'check' : 'copy'} size={13} className={copied ? 'text-primary' : ''} />
      </button>
    </span>
  );
}

/* ── avatar de iniciales + nombre ────────────────────────────────────────── */
const Owner = ({ initials, name }) => (
  <span className="inline-flex items-center gap-2">
    <span className="w-6 h-6 rounded-full bg-primary/14 text-primary font-mono text-[10px] font-semibold inline-flex items-center justify-center">{initials}</span>
    <span className="text-[13px] text-foreground">{name}</span>
  </span>
);

/* ── chip de policy (mono · secundario) ──────────────────────────────────── */
const Chip = ({ children }) => (
  <span className="inline-flex items-center h-[22px] px-2 rounded-md bg-secondary text-secondary-foreground font-mono text-[11px]">{children}</span>
);

/* ── API key enmascarada con reveal + copiar (interactivo) ───────────────── */
function SecretVal({ value }) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); });
  const masked = 'sk_live_' + '•'.repeat(16);
  return (
    <div className="flex items-center justify-between gap-3 min-w-0">
      <span className="font-mono text-[12.5px] text-foreground truncate">{shown ? value : masked}</span>
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={() => setShown(s => !s)} className="text-[12.5px] font-semibold text-primary hover:text-primary/80 transition-colors">{shown ? 'Hide' : 'Reveal'}</button>
        <button onClick={copy} aria-label="Copiar" className="text-muted-foreground hover:text-foreground transition-colors">
          <Icon name={copied ? 'check' : 'copy'} size={13} className={copied ? 'text-primary' : ''} />
        </button>
      </div>
    </div>
  );
}

/* ── fila clave-valor (dos columnas, alineada arriba) ────────────────────── */
const Row = ({ label, children, labelW = '160px' }) => (
  <div className="grid gap-4 py-3.5 items-start" style={{ gridTemplateColumns: labelW + ' minmax(0,1fr)' }}>
    <dt className="text-[13px] text-muted-foreground">{label}</dt>
    <dd className="min-w-0 text-[13px] text-foreground">{children}</dd>
  </div>
);

/* ── botón de cabecera de card ───────────────────────────────────────────── */
const EditBtn = ({ children }) => (
  <button className="shrink-0 h-8 px-3 rounded-md border border-border bg-card text-[12.5px] font-semibold text-foreground hover:bg-secondary/60 transition-colors">{children}</button>
);

/* ── fila de meta con icono al frente (card de resumen) ──────────────────── */
const MetaRow = ({ icon, srLabel, first, children }) => (
  <div className={"flex w-full items-center gap-x-3 px-6 " + (first ? 'mt-6 border-t border-border pt-6' : 'mt-4')}>
    <dt className="flex-none">
      <span className="sr-only">{srLabel}</span>
      <Icon name={icon} size={18} className="text-muted-foreground" />
    </dt>
    <dd className="text-[13px] text-foreground">{children}</dd>
  </div>
);

/* ── footer link "Download receipt" (interactivo) ────────────────────────── */
function DownloadReceipt() {
  const [done, setDone] = useState(false);
  const go = (e) => { e.preventDefault(); setDone(true); setTimeout(() => setDone(false), 1600); };
  return (
    <a href="#" onClick={go} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors">
      <Icon name={done ? 'check' : 'download'} size={15} />
      {done ? 'Receipt downloaded' : 'Download receipt'}
      {!done && <span aria-hidden="true">→</span>}
    </a>
  );
}

/* ── envoltura: nombre + descripción + preview + código ──────────────────── */
const Variant = ({ title, desc, code, surface = false, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    {surface
      ? <div className="preview-surface rounded-lg border border-border p-8 flex justify-center">{children}</div>
      : <div className="rounded-lg border border-border bg-card p-7">{children}</div>}
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── datos de la variante rayada (run detail) ────────────────────────────── */
const RUN_ROWS = [
  { label: 'Run ID', value: <CopyVal value="run_5h2k8d3f9a" /> },
  { label: 'Trigger', value: 'webhook · POST /ingest' },
  { label: 'Started', value: 'Apr 18, 2026 · 14:32:08' },
  { label: 'Duration', value: '4.2s' },
  { label: 'Tokens', value: '18,204 in · 2,118 out' },
  { label: 'Cost', value: '$0.0461' },
  { label: 'Result', value: <Pill>Succeeded</Pill> },
];

/* ── snippets para pegar ─────────────────────────────────────────────────── */
const CODE_SIMPLE = `// Simple — dl de dos columnas con filas divididas
<dl className="divide-y divide-border">
  <div className="grid grid-cols-[160px_1fr] gap-4 py-3.5">
    <dt className="text-[13px] text-muted-foreground">Status</dt>
    <dd className="text-[13px] text-foreground">
      <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-md font-mono text-[10.5px] font-semibold bg-primary/14 text-primary">
        <span className="w-1.5 h-1.5 rounded-full bg-current" />Running
      </span>
    </dd>
  </div>
  <div className="grid grid-cols-[160px_1fr] gap-4 py-3.5">
    <dt className="text-[13px] text-muted-foreground">Agent ID</dt>
    <dd className="font-mono text-[12.5px] text-foreground">agt_7f3c9a21</dd>
  </div>
  {/* …más filas: Region · Model · Owner · Created */}
</dl>`;

const CODE_CARD = `// En card — chrome de card con cabecera + acción, dl dividida
<div className="rounded-lg border border-border bg-card overflow-hidden">
  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
    <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Configuration</h3>
    <button className="h-8 px-3 rounded-md border border-border bg-card text-[12.5px] font-semibold">Edit</button>
  </div>
  <dl className="px-5 divide-y divide-border">
    <div className="grid grid-cols-[150px_1fr] gap-4 py-3.5">
      <dt className="text-[13px] text-muted-foreground">Model</dt>
      <dd className="font-mono text-[12.5px] text-foreground">claude-sonnet-4</dd>
    </div>
    {/* …Endpoint (copiar) · Budget cap · Concurrency · Policies (chips) · API key (reveal) */}
  </dl>
</div>`;

const CODE_SUMMARY = `// Resumen — card de factura: importe + estado, filas con icono, footer
<div className="rounded-lg border border-border bg-card overflow-hidden">
  <dl className="flex flex-wrap">
    <div className="flex-auto pt-6 pl-6">
      <dt className="text-[13px] font-semibold text-foreground">Amount</dt>
      <dd className="mt-1 text-[18px] font-semibold tracking-tight text-foreground">$4,212.80</dd>
    </div>
    <div className="flex-none self-end px-6 pt-4">
      <dt className="sr-only">Status</dt>
      <dd className="inline-flex items-center rounded-md bg-primary/14 px-2 py-1 font-mono text-[11px] font-semibold text-primary">Paid</dd>
    </div>
    <div className="mt-6 flex w-full gap-x-3 border-t border-border px-6 pt-6">
      <dt className="flex-none"><span className="sr-only">Account</span><UserIcon className="h-5 w-5 text-muted-foreground" /></dt>
      <dd className="text-[13px] text-foreground">Northwind EU</dd>
    </div>
    {/* …Due date (calendar) · Payment method (credit card) */}
  </dl>
  <div className="mt-6 border-t border-border px-6 py-5">
    <a href="#" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary/80">
      Download receipt <span aria-hidden="true">→</span>
    </a>
  </div>
</div>`;

const CODE_STRIPED = `// Rayada — filas alternas para metadata densa
<dl className="rounded-lg overflow-hidden border border-border">
  {rows.map((r, i) => (
    <div key={r.label} className={"grid grid-cols-[170px_1fr] gap-4 px-4 py-2.5 " +
      (i % 2 === 0 ? "bg-secondary/40" : "")}>
      <dt className="text-[13px] text-muted-foreground">{r.label}</dt>
      <dd className="font-mono text-[12.5px] text-foreground">{r.value}</dd>
    </div>
  ))}
</dl>`;

const CODE_TWOCOL = `// Dos columnas — campos apilados (label arriba) en rejilla responsiva
<dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
  <div>
    <dt className="text-[12px] text-muted-foreground">Namespace</dt>
    <dd className="mt-1 text-[13px] text-foreground">production</dd>
  </div>
  {/* …Owner · Plan · Region · Created · Agents */}
  <div className="sm:col-span-2">
    <dt className="text-[12px] text-muted-foreground">Description</dt>
    <dd className="mt-1 text-[13px] text-foreground">Customer-facing agents serving the EU region.</dd>
  </div>
</dl>`;

function DescriptionListsSection() {
  return (
    <div>
      <SectionHead kicker="Datos" title="Description lists" status="done"
        intro="La lista de definición que describe un recurso: pares etiqueta-valor en filas divididas. La etiqueta en gris a la izquierda, el valor a la derecha — y el valor puede ser texto, un pill de estado, un ID mono copiable, el avatar del owner, chips de policy o una API key con reveal. Cinco layouts — simple, en card, resumen, rayada y dos columnas — para detalle de agente, run, factura o namespace." />

      {/* 1 · Simple */}
      <Variant title="Simple" desc="dl de dos columnas con filas divididas. El detalle de recurso por defecto: etiqueta a la izquierda, valor a la derecha. El ID se copia." code={CODE_SIMPLE}>
        <dl className="divide-y divide-border">
          <Row label="Status"><Pill>Running</Pill></Row>
          <Row label="Agent ID"><CopyVal value="agt_7f3c9a21" /></Row>
          <Row label="Region"><span className="font-mono text-[12.5px]">eu-west-1</span></Row>
          <Row label="Model"><span className="font-mono text-[12.5px]">claude-sonnet-4</span></Row>
          <Row label="Owner"><Owner initials="DR" name="Dana Ruiz" /></Row>
          <Row label="Created">Apr 12, 2026</Row>
        </dl>
      </Variant>

      {/* 2 · En card */}
      <Variant title="En card" desc="La misma dl dentro del chrome de una card, con cabecera y una acción de edición. El panel de configuración de un agente; el endpoint se copia y la API key se revela." surface code={CODE_CARD}>
        <div className="w-full max-w-[560px] rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Configuration</h3>
            <EditBtn>Edit</EditBtn>
          </div>
          <dl className="px-5 divide-y divide-border">
            <Row label="Endpoint" labelW="130px"><CopyVal value="https://eu.musematic.app/v1/agents/support-triage" display="…/v1/agents/support-triage" /></Row>
            <Row label="Model" labelW="130px"><span className="font-mono text-[12.5px]">claude-sonnet-4</span></Row>
            <Row label="Budget cap" labelW="130px"><span className="font-mono text-[12.5px]">$200.00</span> <span className="text-muted-foreground">/ day</span></Row>
            <Row label="Concurrency" labelW="130px"><span className="font-mono text-[12.5px]">8 runs</span></Row>
            <Row label="Policies" labelW="130px">
              <div className="flex flex-wrap gap-1.5">
                <Chip>pii-redaction</Chip><Chip>eu-only</Chip><Chip>rate-limit</Chip>
              </div>
            </Row>
            <Row label="API key" labelW="130px"><SecretVal value="sk_live_9Hk2Lm4Qz8Xv1Rp7" /></Row>
          </dl>
        </div>
      </Variant>

      {/* 3 · Resumen */}
      <Variant title="Resumen" desc="Card de resumen: una cifra destacada con su estado arriba, y debajo filas con icono al frente — cuenta, vencimiento, método de pago. Cierra con una acción en el footer. Para el detalle de una factura o un cargo. El footer responde al clic." surface code={CODE_SUMMARY}>
        <div className="w-full max-w-[380px] rounded-lg border border-border bg-card overflow-hidden">
          <dl className="flex flex-wrap">
            <div className="flex-auto pt-6 pl-6">
              <dt className="text-[13px] font-semibold text-foreground">Amount</dt>
              <dd className="mt-1 text-[18px] font-semibold tracking-tight text-foreground">$4,212.80</dd>
            </div>
            <div className="flex-none self-end px-6 pt-4">
              <dt className="sr-only">Status</dt>
              <dd className="inline-flex items-center rounded-md bg-primary/14 px-2 py-1 font-mono text-[11px] font-semibold text-primary">Paid</dd>
            </div>
            <MetaRow icon="user" srLabel="Account" first>Northwind EU</MetaRow>
            <MetaRow icon="calendar" srLabel="Due date"><time dateTime="2026-04-30">Apr 30, 2026</time></MetaRow>
            <MetaRow icon="creditcard" srLabel="Payment method">Visa •••• 4242</MetaRow>
          </dl>
          <div className="mt-6 border-t border-border px-6 py-5">
            <DownloadReceipt />
          </div>
        </div>
      </Variant>

      {/* 4 · Rayada */}
      <Variant title="Rayada" desc="Filas alternas, más compactas, para metadata densa como el detalle de un run. El fondo alternado guía la lectura sin necesidad de divisores." code={CODE_STRIPED}>
        <dl className="rounded-lg overflow-hidden border border-border">
          {RUN_ROWS.map((r, i) => (
            <div key={r.label} className={"grid gap-4 px-4 py-2.5 items-center " + (i % 2 === 0 ? 'bg-secondary/40' : '')} style={{ gridTemplateColumns: '170px minmax(0,1fr)' }}>
              <dt className="text-[13px] text-muted-foreground">{r.label}</dt>
              <dd className="min-w-0 text-[13px] text-foreground">
                {typeof r.value === 'string' ? <span className="font-mono text-[12.5px]">{r.value}</span> : r.value}
              </dd>
            </div>
          ))}
        </dl>
      </Variant>

      {/* 5 · Dos columnas */}
      <Variant title="Dos columnas" desc="Campos apilados (etiqueta arriba, valor debajo) en una rejilla que pasa a dos columnas. Para resúmenes con muchos campos cortos — un namespace, una cuenta — donde el último campo puede ocupar todo el ancho." code={CODE_TWOCOL}>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <dt className="text-[12px] text-muted-foreground">Namespace</dt>
            <dd className="mt-1 text-[13px] text-foreground font-mono">production</dd>
          </div>
          <div>
            <dt className="text-[12px] text-muted-foreground">Owner</dt>
            <dd className="mt-1"><Owner initials="MV" name="Marco Vidal" /></dd>
          </div>
          <div>
            <dt className="text-[12px] text-muted-foreground">Plan</dt>
            <dd className="mt-1 text-[13px] text-foreground">Scale</dd>
          </div>
          <div>
            <dt className="text-[12px] text-muted-foreground">Region</dt>
            <dd className="mt-1 text-[13px] text-foreground font-mono">eu-west-1</dd>
          </div>
          <div>
            <dt className="text-[12px] text-muted-foreground">Created</dt>
            <dd className="mt-1 text-[13px] text-foreground">Mar 2, 2026</dd>
          </div>
          <div>
            <dt className="text-[12px] text-muted-foreground">Agents</dt>
            <dd className="mt-1 text-[13px] text-foreground">12 active · 2 paused</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[12px] text-muted-foreground">Description</dt>
            <dd className="mt-1 text-[13px] text-foreground leading-relaxed" style={{ textWrap: 'pretty' }}>Customer-facing agents serving the EU region. Subject to PII redaction and EU-only data residency policies.</dd>
          </div>
        </dl>
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['description-lists'] = DescriptionListsSection;
})();
