/* ============================================================================
   Gntik UI · alerts.jsx — inline alerts ("Feedback" group).
   The in-content banner: semantic tone + icon + title + body.
   Patterns — the four tones, with actions and dismiss, error summary
   with a list, the horizontal global banner and an onboarding banner.
   Tone never competes with the brand green; all colour comes from tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

const Variant = ({ title, desc, code, children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card p-6 sm:p-8">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── Brand alert ─────────────────────────────────────────────────────────── */
const TONE = {
  info:        { wrap: 'border-info/25 bg-info/10',               fg: 'text-info',        icon: 'info' },
  success:     { wrap: 'border-primary/25 bg-primary/10',         fg: 'text-primary',     icon: 'check' },
  warning:     { wrap: 'border-warning/30 bg-warning/10',         fg: 'text-warning',     icon: 'alert' },
  destructive: { wrap: 'border-destructive/30 bg-destructive/10', fg: 'text-destructive', icon: 'alert' },
};

function Alert({ tone = 'info', title, children, onDismiss, actions }) {
  const t = TONE[tone];
  return (
    <div className={"rounded-lg border p-4 " + t.wrap}>
      <div className="flex gap-3">
        <Icon name={t.icon} size={18} stroke={1.9} className={"mt-px shrink-0 " + t.fg} />
        <div className="min-w-0 flex-1">
          {title && <h3 className={"text-[13.5px] font-semibold tracking-tight " + t.fg}>{title}</h3>}
          {children && <div className={"text-[13px] leading-6 text-foreground/75 " + (title ? 'mt-1' : '')} style={{ textWrap: 'pretty' }}>{children}</div>}
          {actions && <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">{actions}</div>}
        </div>
        {onDismiss && (
          <button onClick={onDismiss} aria-label="Dismiss"
            className={"-mr-1 -mt-0.5 grid size-6 shrink-0 place-items-center rounded-md transition-colors hover:bg-foreground/10 " + t.fg}>
            <Icon name="x" size={14} stroke={2.4} />
          </button>
        )}
      </div>
    </div>
  );
}

const LinkBtn = ({ children, className = '', ...p }) => (
  <button type="button" {...p} className={"text-[12.5px] font-semibold transition-opacity hover:opacity-70 " + className}>{children}</button>
);
const Restore = ({ onClick, children }) => (
  <button onClick={onClick} className="mx-auto block font-mono text-[12px] text-primary hover:underline">{children}</button>
);

/* ── 1 · THE FOUR TONES ──────────────────────────────────────────────────── */
function Tones() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-3">
      <Alert tone="info" title="New runtime version available">
        All services will be upgraded to <span className="font-mono text-foreground/90">node-24</span> in the next maintenance window.
      </Alert>
      <Alert tone="success" title="Deploy complete">
        The <span className="font-mono text-foreground/90">billing-api</span> service is serving traffic in <span className="font-mono text-foreground/90">eu-west-1</span>.
      </Alert>
      <Alert tone="warning" title="Budget at 92%">
        The workspace has used $9.2k of $10k this month. Raise the limit or pause non-critical services.
      </Alert>
      <Alert tone="destructive" title="3 services not responding">
        Services in <span className="font-mono text-foreground/90">us-east-1</span> have not responded for 4 min. Check the provider status.
      </Alert>
    </div>
  );
}

/* ── 2 · WITH ACTIONS + DISMISS ──────────────────────────────────────────── */
function ActionAlert() {
  const [show, setShow] = useState(true);
  return (
    <div className="mx-auto w-full max-w-2xl">
      {show ? (
        <Alert tone="warning" title="The workspace is at 92% of its budget"
          onDismiss={() => setShow(false)}
          actions={<>
            <LinkBtn className="text-warning">Raise limit</LinkBtn>
            <LinkBtn className="text-muted-foreground font-medium">View usage</LinkBtn>
          </>}>
          You have used $9.2k of $10k this month. At 100%, non-critical services are paused automatically.
        </Alert>
      ) : <Restore onClick={() => setShow(true)}>restore alert</Restore>}
    </div>
  );
}

/* ── 3 · ERROR SUMMARY (list) ────────────────────────────────────────────── */
function ErrorSummary() {
  const [show, setShow] = useState(true);
  return (
    <div className="mx-auto w-full max-w-2xl">
      {show ? (
        <Alert tone="destructive" title="Could not apply the “pii-redaction” policy"
          onDismiss={() => setShow(false)}
          actions={<>
            <LinkBtn className="text-destructive">Retry</LinkBtn>
            <LinkBtn className="text-muted-foreground font-medium">View policy</LinkBtn>
          </>}>
          Fix these 3 problems and publish again:
          <ul className="mt-2 list-disc space-y-1.5 pl-5 marker:text-destructive/60">
            <li>The <span className="font-mono text-foreground/90">billing-api</span> service has no region assigned.</li>
            <li>The <span className="font-mono text-foreground/90">block:ssn</span> rule references an empty pattern.</li>
            <li>The cost limit per request must be greater than 0.</li>
          </ul>
        </Alert>
      ) : <Restore onClick={() => setShow(true)}>restore alert</Restore>}
    </div>
  );
}

/* ── 4 · GLOBAL BANNER (horizontal) ──────────────────────────────────────── */
function Banner() {
  const [show, setShow] = useState(true);
  return (
    <div className="mx-auto w-full max-w-3xl">
      {show ? (
        <div className="flex flex-col gap-3 rounded-lg border border-info/25 bg-info/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Icon name="bell2" size={18} stroke={1.9} className="shrink-0 text-info" />
            <p className="text-[13px] leading-6 text-foreground/85" style={{ textWrap: 'pretty' }}>
              <span className="font-semibold text-info">Scheduled maintenance.</span> Services will restart zone by zone on Jul 2 at 02:00 UTC. No downtime expected.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" className="inline-flex h-8 items-center rounded-md border border-info/40 px-3 text-[12.5px] font-semibold text-info transition-colors hover:bg-info/10">View details</button>
            <button type="button" onClick={() => setShow(false)} aria-label="Dismiss" className="grid size-8 place-items-center rounded-md text-info transition-colors hover:bg-info/10"><Icon name="x" size={15} stroke={2.2} /></button>
          </div>
        </div>
      ) : <Restore onClick={() => setShow(true)}>restore banner</Restore>}
    </div>
  );
}

/* ── 5 · GETTING-STARTED BANNER (onboarding) ──────────────────────── */
const STEPS = [
  { n: 1, title: 'Connect a source', desc: 'Link a Git repository or point at your own container registry.', cta: 'Connect', disabled: false },
  { n: 2, title: 'Configure the service', desc: 'Create the service with its build settings, environment and a cost limit.', cta: 'Create service', disabled: true, hint: 'Connect a source first' },
  { n: 3, title: 'Deploy', desc: 'Pick a region and policy, and start serving real traffic.', cta: 'Deploy', disabled: true, hint: 'Create a service first' },
];

function StepButton({ disabled, hint, children }) {
  const base = 'inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors sm:w-auto';
  if (!disabled)
    return <button type="button" className={base + ' bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'}>{children}</button>;
  return (
    <div className="group relative inline-flex w-full sm:w-auto">
      <button type="button" disabled className={base + ' cursor-not-allowed bg-primary text-primary-foreground opacity-40'}>{children}</button>
      {hint && (
        <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 text-[11.5px] font-medium text-popover-foreground shadow-md opacity-0 transition-opacity duration-150 group-hover:opacity-100">{hint}</span>
      )}
    </div>
  );
}

function Onboarding() {
  const [show, setShow] = useState(true);
  return (
    <div className="mx-auto w-full max-w-3xl">
      {show ? (
        <div className="relative rounded-xl border border-border bg-background p-6 sm:p-7">
          <button onClick={() => setShow(false)} aria-label="Dismiss"
            className="absolute right-3 top-3 grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground">
            <Icon name="x" size={15} stroke={2.2} />
          </button>
          <h3 className="pr-8 text-[15px] font-semibold tracking-tight text-foreground">Launch your first service</h3>
          <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
            Connect a source, configure the service and deploy it to start serving traffic.
          </p>
          <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col justify-between gap-5 border-l-2 border-primary/25 pl-4">
                <div>
                  <span className="inline-flex items-center rounded-md bg-primary/14 px-2 py-0.5 text-[11px] font-semibold tracking-tight text-primary">Step {s.n}</span>
                  <h4 className="mt-3 text-[13.5px] font-semibold tracking-tight text-foreground">{s.title}</h4>
                  <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>{s.desc}</p>
                </div>
                <StepButton disabled={s.disabled} hint={s.hint}>{s.cta}</StepButton>
              </div>
            ))}
          </div>
        </div>
      ) : <Restore onClick={() => setShow(true)}>restore banner</Restore>}
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_ALERT = `// Brand alert — a single component, semantic tone from tokens
const TONE = {
  info:        { wrap: "border-info/25 bg-info/10",               fg: "text-info",        icon: "info"  },
  success:     { wrap: "border-primary/25 bg-primary/10",         fg: "text-primary",     icon: "check" },
  warning:     { wrap: "border-warning/30 bg-warning/10",         fg: "text-warning",     icon: "alert" },
  destructive: { wrap: "border-destructive/30 bg-destructive/10", fg: "text-destructive", icon: "alert" },
};

function Alert({ tone = "info", title, children, onDismiss, actions }) {
  const t = TONE[tone];
  return (
    <div className={"rounded-lg border p-4 " + t.wrap}>
      <div className="flex gap-3">
        <Icon name={t.icon} size={18} className={"mt-px shrink-0 " + t.fg} />
        <div className="min-w-0 flex-1">
          {title && <h3 className={"text-[13.5px] font-semibold " + t.fg}>{title}</h3>}
          {children && <div className="mt-1 text-[13px] leading-6 text-foreground/75">{children}</div>}
          {actions && <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{actions}</div>}
        </div>
        {onDismiss && (
          <button onClick={onDismiss} aria-label="Dismiss"
            className={"-mr-1 grid size-6 place-items-center rounded-md hover:bg-foreground/10 " + t.fg}>
            <XIcon />
          </button>
        )}
      </div>
    </div>
  );
}`;

const CODE_ACTIONS = `// With actions — links in the tone + a neutral one, and the ✕ to dismiss
<Alert
  tone="warning"
  title="The workspace is at 92% of its budget"
  onDismiss={() => setShow(false)}
  actions={
    <>
      <button className="text-[12.5px] font-semibold text-warning hover:opacity-70">Raise limit</button>
      <button className="text-[12.5px] font-medium text-muted-foreground hover:opacity-70">View usage</button>
    </>
  }
>
  You have used $9.2k of $10k this month. At 100%, non-critical services are paused.
</Alert>`;

const CODE_ERRORS = `// Error summary — destructive + list of problems
<Alert tone="destructive" title="Could not apply the “pii-redaction” policy">
  Fix these 3 problems and publish again:
  <ul className="mt-2 list-disc space-y-1.5 pl-5 marker:text-destructive/60">
    <li>The <span className="font-mono text-foreground/90">billing-api</span> service has no region.</li>
    <li>The <span className="font-mono text-foreground/90">block:ssn</span> rule references an empty pattern.</li>
    <li>The cost limit per request must be greater than 0.</li>
  </ul>
</Alert>`;

const CODE_BANNER = `// Global banner — horizontal, message + ghost CTA + dismiss
<div className="flex flex-col gap-3 rounded-lg border border-info/25 bg-info/10 px-4 py-3
                sm:flex-row sm:items-center sm:justify-between">
  <div className="flex min-w-0 items-center gap-3">
    <BellIcon className="shrink-0 text-info" />
    <p className="text-[13px] text-foreground/85">
      <span className="font-semibold text-info">Scheduled maintenance.</span> Services restart on Jul 2 at 02:00 UTC.
    </p>
  </div>
  <div className="flex shrink-0 items-center gap-2">
    <button className="h-8 rounded-md border border-info/40 px-3 text-[12.5px] font-semibold text-info hover:bg-info/10">View details</button>
    <button onClick={dismiss} className="grid size-8 place-items-center rounded-md text-info hover:bg-info/10"><XIcon /></button>
  </div>
</div>`;

/* ── section ─────────────────────────────────────────────────────────────── */
const CODE_ONBOARDING = `// Getting-started banner — numbered steps, actions and dismiss
const STEPS = [
  { n: 1, title: "Connect a source",      desc: "…", cta: "Connect",        disabled: false },
  { n: 2, title: "Configure the service", desc: "…", cta: "Create service", disabled: true, hint: "Connect a source first" },
  { n: 3, title: "Deploy",                desc: "…", cta: "Deploy",         disabled: true, hint: "Create a service first" },
];

<div className="relative rounded-xl border border-border bg-background p-6 sm:p-7">
  <button onClick={dismiss} aria-label="Dismiss"
    className="absolute right-3 top-3 grid size-7 place-items-center rounded-md
               text-muted-foreground hover:bg-secondary/70 hover:text-foreground">
    <XIcon />
  </button>
  <h3 className="pr-8 text-[15px] font-semibold text-foreground">Launch your first service</h3>
  <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-muted-foreground">
    Connect a source, configure the service and deploy it to serve traffic.
  </p>
  <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-3">
    {STEPS.map((s) => (
      <div key={s.n} className="flex flex-col justify-between gap-5 border-l-2 border-primary/25 pl-4">
        <div>
          <span className="inline-flex items-center rounded-md bg-primary/14 px-2 py-0.5
                           text-[11px] font-semibold text-primary">Step {s.n}</span>
          <h4 className="mt-3 text-[13.5px] font-semibold text-foreground">{s.title}</h4>
          <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground">{s.desc}</p>
        </div>
        {s.disabled ? (
          <div className="group relative inline-flex">
            <button disabled className="h-9 rounded-lg bg-primary px-3.5 text-[13px] font-semibold
                                       text-primary-foreground opacity-40 cursor-not-allowed">{s.cta}</button>
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2
                             whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5
                             text-[11.5px] text-popover-foreground shadow-md opacity-0 group-hover:opacity-100">{s.hint}</span>
          </div>
        ) : (
          <button className="h-9 rounded-lg bg-primary px-3.5 text-[13px] font-semibold
                             text-primary-foreground shadow-sm hover:bg-primary/90">{s.cta}</button>
        )}
      </div>
    ))}
  </div>
</div>`;

function AlertsSection() {
  return (
    <div>
      <SectionHead kicker="Feedback" title="Alerts" status="done"
        intro="The in-content banner: communicates status or consequence right where it happens. A single Alert component covers the four semantic tones — info, success, warning and destructive — with optional icon, title and body. Five usage patterns: the tones, an alert with actions and dismiss, an error summary with a list, the horizontal global banner and a getting-started banner with numbered steps. Tone never competes with the brand green; all colour comes from tokens." />

      <Variant title="The four tones"
        desc="Info for news, primary (success) for confirmations, warning for recoverable risk and destructive for failure. Tone border + soft fill, icon and title in the colour, body in muted foreground so it reads in all three themes."
        code={CODE_ALERT}>
        <Tones />
      </Variant>

      <Variant title="With actions and dismiss"
        desc="Actions as links: the main one in the tone, secondary ones neutral, and the ✕ to dismiss. Press the ✕ to close it — the link restores it."
        code={CODE_ACTIONS}>
        <ActionAlert />
      </Variant>

      <Variant title="Error summary"
        desc="Destructive with a list of concrete problems: ideal after validating a form or publishing a policy. The body accepts any content — here, a bulleted list in the tone."
        code={CODE_ERRORS}>
        <ErrorSummary />
      </Variant>

      <Variant title="Global banner"
        desc="Horizontal variant for workspace-wide notices: message on the left, ghost CTA and dismiss on the right. Stacks on mobile and becomes a row on sm+."
        code={CODE_BANNER}>
        <Banner />
      </Variant>

      <Variant title="Getting-started banner"
        desc="In-content onboarding: title, intro and numbered steps with their action. The first step is active; the rest unlock in order — hover a locked button to see the requirement. The ✕ dismisses it."
        code={CODE_ONBOARDING}>
        <Onboarding />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['alerts'] = AlertsSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
