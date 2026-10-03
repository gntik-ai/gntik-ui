/* ============================================================================
   Gntik UI · page-headings.jsx — screen header, a single pattern.
   Green section kicker (acts as breadcrumb) · foreground title · meta ·
   actions. No icons or logos. Variants: simple · with tabs · with banner.
   Neutral fixtures. All tokens from tokens/brand.css.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, useState } = window;

/* ── section kicker (green · mono) — acts as breadcrumb ──────────────────── */
const Kicker = ({ children }) => (
  <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary mb-2.5">{children}</div>
);

/* ── header buttons (text only) ─────────────────────────────────────────── */
const BtnPrimary = ({ children }) => (
  <button className="h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors">{children}</button>
);
const BtnOutline = ({ children }) => (
  <button className="h-9 px-3.5 rounded-lg border border-border bg-card text-foreground text-[13px] font-semibold hover:bg-secondary/60 transition-colors">{children}</button>
);

/* ── header tab row (interactive) ───────────────────────────────────────── */
function HeaderTabs() {
  const tabs = [['overview', 'Overview'], ['runs', 'Runs', 1284], ['policies', 'Policies'], ['logs', 'Logs'], ['settings', 'Settings']];
  const [active, setActive] = useState('overview');
  return (
    <div className="mt-5 -mx-7 px-7 border-b border-border">
      <div className="flex items-center gap-6">
        {tabs.map(([id, label, badge]) => {
          const on = active === id;
          return (
            <button key={id} onClick={() => setActive(id)}
              className={"relative flex items-center gap-2 h-10 -mb-px border-b-2 text-[13px] font-medium transition-colors " + (on ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              {label}
              {badge && <span className={"font-mono text-[10.5px] leading-none px-1.5 h-[18px] inline-flex items-center rounded-full " + (on ? 'bg-primary/14 text-primary' : 'bg-secondary text-muted-foreground')}>{badge.toLocaleString()}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── wrapper: name + description + preview + code ───────────────────────── */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card">
      <div className="p-7">{children}</div>
    </div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── snippets to paste ───────────────────────────────────────────────────── */
const CODE_SIMPLE = `// Simple — green kicker (breadcrumb) + title + meta + actions
<div>
  <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary mb-2.5">Operation</div>
  <div className="flex items-end justify-between gap-4 flex-wrap">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Deployments</h1>
      <p className="mt-1.5 text-[13px] text-muted-foreground">12 services · 3 environments · eu-west-1</p>
    </div>
    <div className="flex items-center gap-2.5">
      <button className="h-9 px-3.5 rounded-lg border border-border bg-card text-[13px] font-semibold">Filters</button>
      <button className="h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold">New deployment</button>
    </div>
  </div>
</div>`;

const CODE_TABS = `// With tabs — same pattern + resource-level navigation
<div>
  <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary mb-2.5">Services</div>
  <div className="flex items-end justify-between gap-4 flex-wrap">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">support-triage</h1>
      <p className="mt-1.5 font-mono text-[12.5px] text-muted-foreground">service · eu-west-1 · 1,284 runs today</p>
    </div>
    <div className="flex items-center gap-2.5">
      <button className="h-9 px-3.5 rounded-lg border border-border bg-card text-[13px] font-semibold">Pause</button>
      <button className="h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold">Configure</button>
    </div>
  </div>

  <div className="mt-5 border-b border-border">
    <nav className="flex items-center gap-6">
      {["Overview", "Runs", "Policies", "Logs", "Settings"].map((t, i) => (
        <button key={t} className={"h-10 -mb-px border-b-2 text-[13px] font-medium " +
          (i === 0 ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
          {t}
        </button>
      ))}
    </nav>
  </div>
</div>`;

const CODE_BANNER = `// With banner — notice (no icon) above the same pattern
<div>
  <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 mb-5">
    <div className="flex-1 min-w-0">
      <div className="text-[13px] font-medium text-foreground">contract-summarize reached 97% of its daily budget</div>
      <div className="mt-0.5 text-[12px] text-muted-foreground">Throttled to 1 run/min. Raise the cap or pause the service.</div>
    </div>
    <button className="h-8 px-3 rounded-md border border-border bg-card text-[12.5px] font-semibold shrink-0">Review</button>
  </div>

  <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary mb-2.5">Insights</div>
  <div className="flex items-end justify-between gap-4 flex-wrap">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Costs</h1>
      <p className="mt-1.5 text-[13px] text-muted-foreground">Spend across 12 services · billing period ends in 6 days</p>
    </div>
    <div className="flex items-center gap-2.5">
      <button className="h-9 px-3.5 rounded-lg border border-border bg-card text-[13px] font-semibold">Export</button>
      <button className="h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold">Set budget</button>
    </div>
  </div>
</div>`;

function PageHeadingsSection() {
  return (
    <div>
      <SectionHead kicker="Headings" title="Page headings" status="done"
        intro="The header of every screen, with a single pattern: a green section kicker that acts as breadcrumb, the foreground title, a meta line and the actions. No icons or logos. Three variants — simple, with tabs and with banner — and the tabs are interactive." />

      {/* 1 · Simple */}
      <Variant title="Simple" desc="The base pattern: green kicker (breadcrumb), title, a meta line and the actions. The default for any screen." code={CODE_SIMPLE}>
        <div>
          <Kicker>Operation</Kicker>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Deployments</h1>
              <p className="mt-1.5 text-[13px] text-muted-foreground">12 services · 3 environments · eu-west-1</p>
            </div>
            <div className="flex items-center gap-2.5">
              <BtnOutline>Filters</BtnOutline>
              <BtnPrimary>New deployment</BtnPrimary>
            </div>
          </div>
        </div>
      </Variant>

      {/* 2 · With tabs */}
      <Variant title="With tabs" desc="Same pattern for a resource header (service, workflow, policy) with internal navigation. The tabs change state." code={CODE_TABS}>
        <div>
          <Kicker>Services</Kicker>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">support-triage</h1>
              <p className="mt-1.5 font-mono text-[12.5px] text-muted-foreground">service · eu-west-1 · 1,284 runs today</p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <BtnOutline>Pause</BtnOutline>
              <BtnPrimary>Configure</BtnPrimary>
            </div>
          </div>
          <HeaderTabs />
        </div>
      </Variant>

      {/* 3 · With banner */}
      <Variant title="With banner" desc="Same pattern with a notice (budget, incident, migration) pinned above the kicker, with its action." code={CODE_BANNER}>
        <div>
          <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 mb-5">
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-foreground">contract-summarize reached 97% of its daily budget</div>
              <div className="mt-0.5 text-[12px] text-muted-foreground">Throttled to 1 run/min. Raise the cap or pause the service.</div>
            </div>
            <button className="h-8 px-3 rounded-md border border-border bg-card text-[12.5px] font-semibold text-foreground shrink-0 hover:bg-secondary/60 transition-colors">Review</button>
          </div>
          <Kicker>Insights</Kicker>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Costs</h1>
              <p className="mt-1.5 text-[13px] text-muted-foreground">Spend across 12 services · billing period ends in 6 days</p>
            </div>
            <div className="flex items-center gap-2.5">
              <BtnOutline>Export</BtnOutline>
              <BtnPrimary>Set budget</BtnPrimary>
            </div>
          </div>
        </div>
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['page-headings'] = PageHeadingsSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
