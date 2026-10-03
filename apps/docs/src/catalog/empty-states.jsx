/* ============================================================================
   Gntik UI · empty-states.jsx — empty states ("Feedback" group).
   The "nothing here yet": icon, message and a clear next action.
   Patterns — simple with CTA, with selectable starter templates, dotted
   upload dropzone, no-results with live search, and no-data in a chart.
   Tokens only, zero hardcoded colour.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

const Variant = ({ title, desc, code, surface = 'dots', children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className={(surface === 'dots' ? 'preview-surface ' : 'bg-card ') + "rounded-lg border border-border p-5 sm:p-7"}>{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

const Primary = ({ children, ...p }) => (
  <button type="button" {...p} className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">{children}</button>
);
const Secondary = ({ children, ...p }) => (
  <button type="button" {...p} className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-card px-3.5 text-[13px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/70">{children}</button>
);

/* icon halo — neutral and sober (no brand accent) */
const IconHalo = ({ name }) => (
  <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground ring-1 ring-border">
    <Icon name={name} size={22} />
  </div>
);

/* ── 1 · SIMPLE WITH CTA ─────────────────────────────────────────────────── */
function Simple() {
  return (
    <div className="mx-auto flex min-h-[300px] max-w-md flex-col items-center justify-center px-6 text-center">
      <IconHalo name="fleet" />
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">No services yet</h3>
      <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
        Create your first service to start routing traffic to it, with its own cost limits and policies.
      </p>
      <div className="mt-5">
        <Primary><Icon name="plus" size={15} stroke={2.4} />Create service</Primary>
      </div>
    </div>
  );
}

/* ── 2 · WITH STARTER TEMPLATES ──────────────────────────────────────────── */
const TEMPLATES = [
  { id: 'support', icon: 'chat',  name: 'REST API',       desc: 'An HTTP service with routing and health checks' },
  { id: 'sales',   icon: 'store', name: 'Web storefront', desc: 'A server-rendered site with a CDN in front' },
  { id: 'data',    icon: 'audit', name: 'Data pipeline',  desc: 'Scheduled jobs that load into your warehouse' },
];
function Templates() {
  const [sel, setSel] = useState(null);
  return (
    <div className="mx-auto max-w-lg px-2 py-6 text-center">
      <IconHalo name="bot" />
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">Create your first service</h3>
      <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>Start from a template; you can adjust it later.</p>
      <div className="mt-5 space-y-2 text-left">
        {TEMPLATES.map(t => {
          const on = sel === t.id;
          return (
            <button key={t.id} onClick={() => setSel(t.id)}
              className={"group flex w-full items-center gap-3 rounded-lg border bg-card px-3.5 py-3 text-left shadow-sm transition-colors " + (on ? 'border-primary ring-2 ring-ring/25' : 'border-border hover:border-primary/40 hover:bg-secondary/40')}>
              <span className={"grid size-9 shrink-0 place-items-center rounded-md transition-colors " + (on ? 'bg-primary/14 text-primary' : 'bg-secondary text-muted-foreground group-hover:text-foreground')}>
                <Icon name={t.icon} size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-semibold tracking-tight text-foreground">{t.name}</span>
                <span className="block truncate text-[12px] text-muted-foreground">{t.desc}</span>
              </span>
              <Icon name={on ? 'check' : 'chevronRight'} size={16} stroke={on ? 2.4 : 1.8} className={on ? 'text-primary' : 'text-muted-foreground'} />
            </button>
          );
        })}
      </div>
      <button className="mt-4 font-mono text-[12px] text-muted-foreground transition-colors hover:text-foreground">or start from scratch →</button>
    </div>
  );
}

/* ── 3 · DROPZONE (dotted) ───────────────────────────────────────────────── */
function Dropzone() {
  const [file, setFile] = useState(null);
  return (
    <div className="mx-auto max-w-lg py-3">
      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-3 shadow-sm">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/14 text-primary"><Icon name="audit" size={17} /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-foreground">{file}</span>
            <span className="block font-mono text-[11px] text-muted-foreground">YAML · 4.2 KB · ready to validate</span>
          </span>
          <button onClick={() => setFile(null)} aria-label="Remove file" className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Icon name="x" size={14} stroke={2.2} /></button>
        </div>
      ) : (
        <button type="button" onClick={() => setFile('pii-redaction.yaml')}
          className="block w-full rounded-xl border-2 border-dashed border-border bg-background/40 px-6 py-12 text-center transition-colors hover:border-primary/50 hover:bg-primary/5">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground ring-1 ring-border"><Icon name="upload" size={22} /></div>
          <p className="mt-4 text-[13.5px] text-foreground">
            Drag a policy file here or <span className="font-semibold text-primary">browse</span>
          </p>
          <p className="mt-1 font-mono text-[11.5px] text-muted-foreground">YAML or JSON · max 1 MB</p>
        </button>
      )}
      <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground/80">click the area to simulate a selected file</p>
    </div>
  );
}

/* ── 4 · NO RESULTS (live search) ────────────────────────────────────────── */
const AGENTS = ['billing-api', 'support-triage', 'sales-notes', 'data-pipeline', 'onboarding-bot', 'qa-runner'];
function NoResults() {
  const [q, setQ] = useState('legacy');
  const res = AGENTS.filter(a => a.includes(q.trim().toLowerCase()));
  return (
    <div className="mx-auto w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <div className="flex h-9 flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25">
          <Icon name="search" size={15} className="shrink-0 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search services…"
            className="h-full w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
          {q && <button onClick={() => setQ('')} aria-label="Clear" className="grid size-5 shrink-0 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Icon name="x" size={12} stroke={2.4} /></button>}
        </div>
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{res.length}/{AGENTS.length}</span>
      </div>

      {res.length > 0 ? (
        <ul className="divide-y divide-border">
          {res.map(a => (
            <li key={a} className="flex items-center gap-3 px-4 py-3">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="font-mono text-[12.5px] text-foreground">{a}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center">
          <IconHalo name="search" />
          <h3 className="mt-4 text-[14px] font-semibold tracking-tight text-foreground">No results for “{q}”</h3>
          <p className="mt-1.5 max-w-xs text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>No services match. Try another term or check the active filters.</p>
          <button onClick={() => setQ('')} className="mt-4">
            <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12.5px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/70"><Icon name="x" size={13} stroke={2.2} className="text-muted-foreground" />Clear search</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ── 5 · NO DATA (chart) ──────────────────────────────────────────── */
const GRID_BG = { backgroundImage: 'repeating-linear-gradient(to top, hsl(var(--border) / 0.55) 0 1px, transparent 1px 25%)' };
function NoData() {
  const yTicks = ['$8k', '$6k', '$4k', '$2k', '$0'];
  const xTicks = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div className="mx-auto w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h3 className="text-[13.5px] font-semibold tracking-tight text-foreground">Daily workspace cost</h3>
          <p className="text-[11.5px] text-muted-foreground">Last 7 days</p>
        </div>
        <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 text-[11.5px] font-medium text-muted-foreground">
          <Icon name="calendar" size={13} />7 days
        </span>
      </div>
      <div className="px-4 pb-3 pt-4">
        <div className="flex">
          <div className="flex h-[184px] w-9 flex-col justify-between text-right">
            {yTicks.map(t => <span key={t} className="font-mono text-[10px] leading-none text-muted-foreground/45">{t}</span>)}
          </div>
          <div className="relative ml-2 h-[184px] flex-1">
            <div className="absolute inset-0 rounded-sm" style={GRID_BG} />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <IconHalo name="line" />
              <h4 className="mt-3 text-[13.5px] font-semibold tracking-tight text-foreground">No data for this period</h4>
              <p className="mt-1 max-w-[17rem] text-[12.5px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>No requests were recorded between these dates. Widen the range or come back when there is activity.</p>
              <button className="mt-3.5">
                <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12.5px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/70"><Icon name="calendar" size={13} className="text-muted-foreground" />Widen range</span>
              </button>
            </div>
          </div>
        </div>
        <div className="ml-[2.75rem] mt-2 flex justify-between">
          {xTicks.map(t => <span key={t} className="font-mono text-[10px] text-muted-foreground/45">{t}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SIMPLE = `// Simple empty state — icon halo + message + CTA, centred
<div className="mx-auto flex min-h-[300px] max-w-md flex-col items-center justify-center px-6 text-center">
  <div className="grid size-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground ring-1 ring-border">
    <FleetIcon />
  </div>
  <h3 className="mt-4 text-[15px] font-semibold text-foreground">No services yet</h3>
  <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">
    Create your first service to start routing traffic to it.
  </p>
  <button className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px]
                     font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
    <PlusIcon /> Create service
  </button>
</div>`;

const CODE_TEMPLATES = `// With templates — selectable rows as a starting point
{TEMPLATES.map((t) => {
  const on = sel === t.id;
  return (
    <button key={t.id} onClick={() => setSel(t.id)}
      className={"group flex w-full items-center gap-3 rounded-lg border bg-card px-3.5 py-3 text-left shadow-sm " +
        (on ? "border-primary ring-2 ring-ring/25" : "border-border hover:border-primary/40 hover:bg-secondary/40")}>
      <span className={"grid size-9 place-items-center rounded-md " +
        (on ? "bg-primary/14 text-primary" : "bg-secondary text-muted-foreground group-hover:text-foreground")}>
        <Icon name={t.icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-semibold text-foreground">{t.name}</span>
        <span className="block truncate text-[12px] text-muted-foreground">{t.desc}</span>
      </span>
      <Icon name={on ? "check" : "chevronRight"} className={on ? "text-primary" : "text-muted-foreground"} />
    </button>
  );
})}`;

const CODE_DROP = `// Dropzone — dotted border, primary on hover, click attaches the file
<button onClick={() => setFile("pii-redaction.yaml")}
  className="block w-full rounded-xl border-2 border-dashed border-border bg-background/40 px-6 py-12 text-center
             hover:border-primary/50 hover:bg-primary/5">
  <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground ring-1 ring-border">
    <UploadIcon />
  </div>
  <p className="mt-4 text-[13.5px] text-foreground">
    Drag a policy file here or <span className="font-semibold text-primary">browse</span>
  </p>
  <p className="mt-1 font-mono text-[11.5px] text-muted-foreground">YAML or JSON · max 1 MB</p>
</button>`;

const CODE_NORES = `// No results — live search; when nothing matches, empty + reset
const res = AGENTS.filter((a) => a.includes(q.trim().toLowerCase()));

res.length === 0 && (
  <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center">
    <div className="grid size-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground ring-1 ring-border">
      <SearchIcon />
    </div>
    <h3 className="mt-4 text-[14px] font-semibold text-foreground">No results for “{q}”</h3>
    <p className="mt-1.5 max-w-xs text-[13px] leading-6 text-muted-foreground">Try another term or check the filters.</p>
    <button onClick={() => setQ("")}
      className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12.5px]
                 font-medium shadow-sm hover:bg-secondary/70">Clear search</button>
  </div>
)`;

/* ── section ─────────────────────────────────────────────────────────────── */
const CODE_NODATA = `// No data — keep the chart frame and overlay the message
<div className="rounded-lg border border-border bg-card shadow-sm">
  <div className="flex items-center justify-between border-b border-border px-4 py-3">
    <div>
      <h3 className="text-[13.5px] font-semibold text-foreground">Daily workspace cost</h3>
      <p className="text-[11.5px] text-muted-foreground">Last 7 days</p>
    </div>
    <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2.5
                     text-[11.5px] text-muted-foreground"><CalendarIcon /> 7 days</span>
  </div>

  <div className="relative m-4 h-[184px]">
    {/* ghost gridlines — the frame is still there, only the data is missing */}
    <div className="absolute inset-0 rounded-sm"
      style={{ backgroundImage: "repeating-linear-gradient(to top, hsl(var(--border) / .55) 0 1px, transparent 1px 25%)" }} />
    {/* centred empty overlay */}
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground ring-1 ring-border">
        <LineIcon />
      </div>
      <h4 className="mt-3 text-[13.5px] font-semibold text-foreground">No data for this period</h4>
      <p className="mt-1 max-w-[17rem] text-[12.5px] leading-6 text-muted-foreground">
        No requests were recorded between these dates. Widen the range.
      </p>
      <button className="mt-3.5 inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3
                         text-[12.5px] font-medium shadow-sm hover:bg-secondary/70"><CalendarIcon /> Widen range</button>
    </div>
  </div>
</div>`;

function EmptyStatesSection() {
  return (
    <div>
      <SectionHead kicker="Feedback" title="Empty states" status="done"
        intro="The “nothing here yet”: instead of a blank screen, a sober icon, a sentence explaining what this is and a clear next action. Five patterns — simple with a CTA, one offering selectable starter templates, the dotted upload dropzone, no-results with live search and reset, and no-data inside a chart frame. The icon halo is neutral: brand green is reserved for the action." />

      <Variant title="Simple with CTA"
        desc="The base case: neutral icon halo, title, one sentence of context and a single primary button. Works as a full page, inside a container or inside a card."
        code={CODE_SIMPLE}>
        <Simple />
      </Variant>

      <Variant title="With starter templates"
        desc="When there is a good starting point, offer it: selectable rows with icon, name and description. Press one to mark it (check + primary ring) and leave a link to start from scratch."
        code={CODE_TEMPLATES}>
        <Templates />
      </Variant>

      <Variant title="Upload dropzone"
        desc="A dotted border inviting you to drop a file; it tints primary on hover. Click to simulate a selected file — the row appears with its meta and the ✕ to remove it."
        code={CODE_DROP}>
        <Dropzone />
      </Variant>

      <Variant title="No results" surface="card"
        desc="The empty state inside a list with live search. It starts with no matches for “legacy”; type “bot”, “data” or “sales” to see rows, or press “Clear search” to reset."
        code={CODE_NORES}>
        <NoResults />
      </Variant>

      <Variant title="No data in a chart" surface="card"
        desc="For a chart without data: keep the frame — header, axes and ghost gridlines — and overlay the message, so it reads as a chart (not an error) and the next action is clear. Useful when the date range returns no requests."
        code={CODE_NODATA}>
        <NoData />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['empty-states'] = EmptyStatesSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
