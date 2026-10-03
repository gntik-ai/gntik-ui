/* ============================================================================
   Gntik UI · description-lists.jsx — key-value pairs for resource details.
   The <dl> describing a service, a job or a namespace: label + value in
   divided rows. Values as status pills, copyable mono IDs, owner avatar,
   policy chips and an API key with reveal. Tokens only.
   Variants: simple · in card · summary · striped · two columns.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

/* ── status pill (mono · tone per status) ────────────────────────────────── */
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

/* ── mono value with copy (interactive) ──────────────────────────────────── */
function CopyVal({ value, display }) {
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); });
  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <span className="font-mono text-[12.5px] text-foreground truncate">{display || value}</span>
      <button onClick={copy} aria-label="Copy"
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
        <Icon name={copied ? 'check' : 'copy'} size={13} className={copied ? 'text-primary' : ''} />
      </button>
    </span>
  );
}

/* ── initials avatar + name ──────────────────────────────────────────────── */
const Owner = ({ initials, name }) => (
  <span className="inline-flex items-center gap-2">
    <span className="w-6 h-6 rounded-full bg-primary/14 text-primary font-mono text-[10px] font-semibold inline-flex items-center justify-center">{initials}</span>
    <span className="text-[13px] text-foreground">{name}</span>
  </span>
);

/* ── policy chip (mono · secondary) ──────────────────────────────────────── */
const Chip = ({ children }) => (
  <span className="inline-flex items-center h-[22px] px-2 rounded-md bg-secondary text-secondary-foreground font-mono text-[11px]">{children}</span>
);

/* ── masked API key with reveal + copy (interactive) ─────────────────────── */
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
        <button onClick={copy} aria-label="Copy" className="text-muted-foreground hover:text-foreground transition-colors">
          <Icon name={copied ? 'check' : 'copy'} size={13} className={copied ? 'text-primary' : ''} />
        </button>
      </div>
    </div>
  );
}

/* ── key-value row (two columns, top-aligned) ────────────────────────────── */
const Row = ({ label, children, labelW = '160px' }) => (
  <div className="grid gap-4 py-3.5 items-start" style={{ gridTemplateColumns: labelW + ' minmax(0,1fr)' }}>
    <dt className="text-[13px] text-muted-foreground">{label}</dt>
    <dd className="min-w-0 text-[13px] text-foreground">{children}</dd>
  </div>
);

/* ── card header button ──────────────────────────────────────────────────── */
const EditBtn = ({ children }) => (
  <button className="shrink-0 h-8 px-3 rounded-md border border-border bg-card text-[12.5px] font-semibold text-foreground hover:bg-secondary/60 transition-colors">{children}</button>
);

/* ── meta row with leading icon (summary card) ───────────────────────────── */
const MetaRow = ({ icon, srLabel, first, children }) => (
  <div className={"flex w-full items-center gap-x-3 px-6 " + (first ? 'mt-6 border-t border-border pt-6' : 'mt-4')}>
    <dt className="flex-none">
      <span className="sr-only">{srLabel}</span>
      <Icon name={icon} size={18} className="text-muted-foreground" />
    </dt>
    <dd className="text-[13px] text-foreground">{children}</dd>
  </div>
);

/* ── footer link "Download receipt" (interactive) ────────────────────────── */
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

/* ── wrapper: name + description + preview + code ───────────────────────── */
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

/* ── striped variant data (job detail) ───────────────────────────────────── */
const RUN_ROWS = [
  { label: 'Job ID', value: <CopyVal value="job_5h2k8d3f9a" /> },
  { label: 'Trigger', value: 'webhook · POST /ingest' },
  { label: 'Started', value: 'Apr 18, 2026 · 14:32:08' },
  { label: 'Duration', value: '4.2s' },
  { label: 'Data', value: '18.2 MB in · 2.1 MB out' },
  { label: 'Cost', value: '$0.0461' },
  { label: 'Result', value: <Pill>Succeeded</Pill> },
];

/* ── snippets to paste ───────────────────────────────────────────────────── */
const CODE_SIMPLE = `// Simple — two-column dl with divided rows
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
    <dt className="text-[13px] text-muted-foreground">Service ID</dt>
    <dd className="font-mono text-[12.5px] text-foreground">svc_7f3c9a21</dd>
  </div>
  {/* …more rows: Region · Runtime · Owner · Created */}
</dl>`;

const CODE_CARD = `// In card — card chrome with header + action, divided dl
<div className="rounded-lg border border-border bg-card overflow-hidden">
  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
    <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Configuration</h3>
    <button className="h-8 px-3 rounded-md border border-border bg-card text-[12.5px] font-semibold">Edit</button>
  </div>
  <dl className="px-5 divide-y divide-border">
    <div className="grid grid-cols-[150px_1fr] gap-4 py-3.5">
      <dt className="text-[13px] text-muted-foreground">Runtime</dt>
      <dd className="font-mono text-[12.5px] text-foreground">node-24</dd>
    </div>
    {/* …Endpoint (copy) · Budget cap · Concurrency · Policies (chips) · API key (reveal) */}
  </dl>
</div>`;

const CODE_SUMMARY = `// Summary — invoice card: amount + status, icon rows, footer
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

const CODE_STRIPED = `// Striped — alternating rows for dense metadata
<dl className="rounded-lg overflow-hidden border border-border">
  {rows.map((r, i) => (
    <div key={r.label} className={"grid grid-cols-[170px_1fr] gap-4 px-4 py-2.5 " +
      (i % 2 === 0 ? "bg-secondary/40" : "")}>
      <dt className="text-[13px] text-muted-foreground">{r.label}</dt>
      <dd className="font-mono text-[12.5px] text-foreground">{r.value}</dd>
    </div>
  ))}
</dl>`;

const CODE_TWOCOL = `// Two columns — stacked fields (label on top) in a responsive grid
<dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
  <div>
    <dt className="text-[12px] text-muted-foreground">Namespace</dt>
    <dd className="mt-1 text-[13px] text-foreground">production</dd>
  </div>
  {/* …Owner · Plan · Region · Created · Services */}
  <div className="sm:col-span-2">
    <dt className="text-[12px] text-muted-foreground">Description</dt>
    <dd className="mt-1 text-[13px] text-foreground">Customer-facing services serving the EU region.</dd>
  </div>
</dl>`;

function DescriptionListsSection() {
  return (
    <div>
      <SectionHead kicker="Data" title="Description lists" status="done"
        intro="The definition list describing a resource: label-value pairs in divided rows. The label in grey on the left, the value on the right — and the value can be text, a status pill, a copyable mono ID, the owner avatar, policy chips or an API key with reveal. Five layouts — simple, in card, summary, striped and two columns — for service, job, invoice or namespace details." />

      {/* 1 · Simple */}
      <Variant title="Simple" desc="Two-column dl with divided rows. The default resource detail: label on the left, value on the right. The ID can be copied." code={CODE_SIMPLE}>
        <dl className="divide-y divide-border">
          <Row label="Status"><Pill>Running</Pill></Row>
          <Row label="Service ID"><CopyVal value="svc_7f3c9a21" /></Row>
          <Row label="Region"><span className="font-mono text-[12.5px]">eu-west-1</span></Row>
          <Row label="Runtime"><span className="font-mono text-[12.5px]">node-24</span></Row>
          <Row label="Owner"><Owner initials="DR" name="Dana Ruiz" /></Row>
          <Row label="Created">Apr 12, 2026</Row>
        </dl>
      </Variant>

      {/* 2 · In card */}
      <Variant title="In card" desc="The same dl inside a card chrome, with a header and an edit action. A service configuration panel; the endpoint can be copied and the API key revealed." surface code={CODE_CARD}>
        <div className="w-full max-w-[560px] rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Configuration</h3>
            <EditBtn>Edit</EditBtn>
          </div>
          <dl className="px-5 divide-y divide-border">
            <Row label="Endpoint" labelW="130px"><CopyVal value="https://eu.example.com/v1/services/support-triage" display="…/v1/services/support-triage" /></Row>
            <Row label="Runtime" labelW="130px"><span className="font-mono text-[12.5px]">node-24</span></Row>
            <Row label="Budget cap" labelW="130px"><span className="font-mono text-[12.5px]">$200.00</span> <span className="text-muted-foreground">/ day</span></Row>
            <Row label="Concurrency" labelW="130px"><span className="font-mono text-[12.5px]">8 jobs</span></Row>
            <Row label="Policies" labelW="130px">
              <div className="flex flex-wrap gap-1.5">
                <Chip>pii-redaction</Chip><Chip>eu-only</Chip><Chip>rate-limit</Chip>
              </div>
            </Row>
            <Row label="API key" labelW="130px"><SecretVal value="sk_live_9Hk2Lm4Qz8Xv1Rp7" /></Row>
          </dl>
        </div>
      </Variant>

      {/* 3 · Summary */}
      <Variant title="Summary" desc="Summary card: a highlighted figure with its status on top, and below it rows with a leading icon — account, due date, payment method. It closes with an action in the footer. For an invoice or charge detail. The footer responds to clicks." surface code={CODE_SUMMARY}>
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

      {/* 4 · Striped */}
      <Variant title="Striped" desc="Alternating, more compact rows for dense metadata such as a job detail. The alternating background guides reading without dividers." code={CODE_STRIPED}>
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

      {/* 5 · Two columns */}
      <Variant title="Two columns" desc="Stacked fields (label on top, value below) in a grid that becomes two columns. For summaries with many short fields — a namespace, an account — where the last field can span the full width." code={CODE_TWOCOL}>
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
            <dt className="text-[12px] text-muted-foreground">Services</dt>
            <dd className="mt-1 text-[13px] text-foreground">12 active · 2 paused</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[12px] text-muted-foreground">Description</dt>
            <dd className="mt-1 text-[13px] text-foreground leading-relaxed" style={{ textWrap: 'pretty' }}>Customer-facing services serving the EU region. Subject to PII redaction and EU-only data residency policies.</dd>
          </div>
        </dl>
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['description-lists'] = DescriptionListsSection;
})();
