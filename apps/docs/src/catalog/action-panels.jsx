/* ============================================================================
   Gntik UI · action-panels.jsx — action panels ("Forms" group).
   The brand card-with-action: title + description + one control. Simple,
   with a right-hand action, with an inline input (domain allowlist), with a toggle
   and a danger zone. Tokens only, zero hardcoded colour.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

/* here the panel IS the card → the preview surface is dotted so it floats */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="preview-surface rounded-lg border border-border p-6 sm:p-8">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

const Panel = ({ children, tone = 'border-border' }) => (
  <div className={"mx-auto w-full max-w-2xl rounded-lg border bg-card shadow-sm " + tone}>{children}</div>
);
const H = ({ children }) => <h3 className="text-[15px] font-semibold tracking-tight text-foreground">{children}</h3>;
const P = ({ children }) => <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>{children}</p>;

const Primary = ({ children, ...p }) => (
  <button type="button" {...p} className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">{children}</button>
);
const Secondary = ({ children, ...p }) => (
  <button type="button" {...p} className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-card px-3.5 text-[13px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/70">{children}</button>
);
const Danger = ({ children, ...p }) => (
  <button type="button" {...p} className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-destructive px-3.5 text-[13px] font-semibold text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90">{children}</button>
);
const Switch = ({ on, onChange }) => (
  <button type="button" role="switch" aria-checked={on} onClick={onChange}
    className={"relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card " + (on ? 'bg-primary' : 'bg-secondary')}>
    <span className={"ml-[2px] size-[18px] rounded-full bg-background shadow-sm transition-transform " + (on ? 'translate-x-[18px]' : 'translate-x-0')} />
  </button>
);

/* ── 1 · SIMPLE ──────────────────────────────────────────────────────────── */
function SimplePanel() {
  const [done, setDone] = useState(false);
  return (
    <Panel>
      <div className="px-6 py-5">
        <H>Rotate the workspace API key</H>
        <P>Generates a new key and revokes the current one. In-flight requests keep using the old key for 5 minutes so traffic is not interrupted.</P>
        <div className="mt-4">
          <Primary onClick={() => { setDone(true); setTimeout(() => setDone(false), 1600); }}>
            {done ? <><Icon name="check" size={15} stroke={2.4} />Key rotated</> : <><Icon name="refresh" size={15} />Rotate API key</>}
          </Primary>
        </div>
      </div>
    </Panel>
  );
}

/* ── 2 · WITH RIGHT-HAND ACTION ──────────────────────────────────────────── */
function RightActionPanel() {
  return (
    <Panel>
      <div className="px-6 py-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <H>Export audit log</H>
          <P>Download every workspace event from the last 90 days as a signed CSV for your compliance team.</P>
        </div>
        <div className="mt-4 shrink-0 sm:mt-0">
          <Secondary><Icon name="download" size={15} className="text-muted-foreground" />Export CSV</Secondary>
        </div>
      </div>
    </Panel>
  );
}

/* ── 3 · WITH INLINE INPUT (allowlist) ───────────────────────────────────── */
function InputPanel() {
  const [domains, setDomains] = useState(['acme.com', 'acme.dev']);
  const [val, setVal] = useState('');
  const add = (e) => {
    if (e) e.preventDefault();
    const d = val.trim().toLowerCase();
    if (!d || domains.includes(d)) return;
    setDomains(x => [...x, d]); setVal('');
  };
  return (
    <Panel>
      <div className="px-6 py-5">
        <H>Allowed domains</H>
        <P>Only emails from these domains can join the workspace without a manual invite.</P>
        <form onSubmit={add} className="mt-4 flex max-w-md gap-2.5">
          <div className="flex w-full items-center rounded-md border border-border bg-background pl-3 shadow-sm transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25">
            <span className="select-none text-[13px] text-muted-foreground">@</span>
            <input value={val} onChange={e => setVal(e.target.value)} placeholder="company.com"
              className="h-9 w-full bg-transparent pl-1 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
          </div>
          <Primary onClick={add}><Icon name="plus" size={15} stroke={2.4} />Add</Primary>
        </form>
        <div className="mt-3.5 flex flex-wrap gap-2">
          {domains.map(d => (
            <span key={d} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background pl-2.5 pr-1.5 h-7 font-mono text-[12px] text-foreground">
              {d}
              <button onClick={() => setDomains(x => x.filter(y => y !== d))} className="grid h-4 w-4 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"><Icon name="x" size={11} stroke={2.4} /></button>
            </span>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ── 4 · WITH TOGGLE + DANGER ZONE ───────────────────────────────────────── */
function TogglePanel() {
  const [paused, setPaused] = useState(false);
  const [confirm, setConfirm] = useState('');
  const target = 'prod-eu';
  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      {/* toggle */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-start justify-between gap-6 px-6 py-5">
          <div className="min-w-0">
            <H>Pause deployments</H>
            <P>Stops accepting new requests on every service in the workspace. Active jobs finish normally.</P>
            {paused && <span className="mt-2.5 inline-flex items-center gap-1.5 rounded bg-warning/16 px-2 py-1 font-mono text-[11px] font-semibold text-warning"><span className="size-1.5 rounded-full bg-warning" />Deployments paused</span>}
          </div>
          <Switch on={paused} onChange={() => setPaused(v => !v)} />
        </div>
      </div>

      {/* danger zone */}
      <div className="rounded-lg border border-destructive/35 bg-card shadow-sm">
        <div className="px-6 py-5">
          <H>Delete workspace</H>
          <P>Deletes <span className="font-mono text-foreground">{target}</span>, its services, policies and audit log. This action cannot be undone.</P>
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={'Type "' + target + '" to confirm'}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus:outline-none focus:border-destructive/60 focus:ring-2 focus:ring-destructive/25 sm:max-w-xs" />
            <Danger disabled={confirm !== target} aria-disabled={confirm !== target}
              className={confirm !== target ? 'opacity-50 cursor-not-allowed' : ''}>
              <Icon name="trash" size={15} />Delete workspace
            </Danger>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SIMPLE = `// Simple panel — title + description + primary action
<div className="rounded-lg border border-border bg-card shadow-sm">
  <div className="px-6 py-5">
    <h3 className="text-[15px] font-semibold text-foreground">Rotate the API key</h3>
    <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-muted-foreground">Generates a new key and revokes the current one…</p>
    <button className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px]
                       font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
      <RefreshIcon /> Rotate API key
    </button>
  </div>
</div>`;

const CODE_RIGHT = `// Right-hand action — stacks on mobile, row on sm+
<div className="px-6 py-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
  <div>
    <h3 className="text-[15px] font-semibold text-foreground">Export audit log</h3>
    <p className="mt-1.5 text-[13px] text-muted-foreground">Download 90 days of events as a signed CSV.</p>
  </div>
  <button className="mt-4 shrink-0 sm:mt-0 inline-flex h-9 items-center gap-1.5 rounded-md border border-border
                     bg-card px-3.5 text-[13px] font-medium shadow-sm hover:bg-secondary/70">Export CSV</button>
</div>`;

const CODE_INPUT = `// With inline input — adds chips (allowlist)
<form onSubmit={add} className="mt-4 flex max-w-md gap-2.5">
  <div className="flex w-full items-center rounded-md border border-border bg-background pl-3 shadow-sm
                  focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25">
    <span className="text-[13px] text-muted-foreground">@</span>
    <input value={val} onChange={(e) => setVal(e.target.value)} className="h-9 w-full bg-transparent pl-1 focus:outline-none" />
  </div>
  <button className="h-9 rounded-md bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground">Add</button>
</form>`;

const CODE_DANGER = `// Danger zone — destructive border + confirm by name
<div className="rounded-lg border border-destructive/35 bg-card shadow-sm px-6 py-5">
  <h3 className="text-[15px] font-semibold text-foreground">Delete workspace</h3>
  <p className="mt-1.5 text-[13px] text-muted-foreground">This action cannot be undone.</p>
  <div className="mt-4 sm:flex sm:gap-2.5">
    <input value={confirm} onChange={(e) => setConfirm(e.target.value)}
      className="h-9 rounded-md border border-border bg-background px-3 text-[13px]
                 focus:border-destructive/60 focus:ring-2 focus:ring-destructive/25" />
    <button disabled={confirm !== target} className="h-9 rounded-md bg-destructive px-3.5 text-[13px]
      font-semibold text-destructive-foreground disabled:opacity-50">Delete workspace</button>
  </div>
</div>`;

/* ── section ─────────────────────────────────────────────────────────────── */
function ActionPanelsSection() {
  return (
    <div>
      <SectionHead kicker="Forms" title="Action panels" status="done"
        intro="The card-with-action: a title, a description and a single control that does one concrete thing to the workspace. Five variants — simple, with the action on the right, with an inline input for an allowlist, with a toggle, and the danger zone with confirm-by-name. Each panel is the brand card (bg-card, flat shadow) floating on the preview surface." />

      <Variant title="Simple"
        desc="Title, description and a primary button below. The button confirms in place with a brief check when pressed."
        code={CODE_SIMPLE}>
        <SimplePanel />
      </Variant>

      <Variant title="With right-hand action"
        desc="Description on the left and a secondary button on the right; stacks on mobile and becomes a row on medium screens."
        code={CODE_RIGHT}>
        <RightActionPanel />
      </Variant>

      <Variant title="With inline input"
        desc="A mini form inside the panel: add domains to the allowlist as chips with an @ prefix, and remove them with the ✕. Press Add and the chip appears."
        code={CODE_INPUT}>
        <InputPanel />
      </Variant>

      <Variant title="With toggle and danger zone"
        desc="A panel with a switch to pause deployments (with a status badge) and, below, the danger zone: destructive border and a button that only enables once you type the workspace name."
        code={CODE_DANGER}>
        <TogglePanel />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['action-panels'] = ActionPanelsSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
