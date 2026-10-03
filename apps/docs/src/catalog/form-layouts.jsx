/* ============================================================================
   Gntik UI · form-layouts.jsx — form compositions ("Forms" group).
   Three canonical layouts on brand primitives (input · native select ·
   textarea · checkbox · radio card), all with tokens:
     1 · Settings with sections — label on the left, fields on the right.
     2 · Request with packages — fields + selectable capacity cards.
     3 · Create workspace — two columns: plan cards + help panel.
   Zero hardcoded colour.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

/* ── field primitives (reused by the 3 forms) ────────────────────────────── */
const labelCls = "block text-[13px] font-medium text-foreground";
const fieldCls =
  "block w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground " +
  "placeholder:text-muted-foreground shadow-sm transition-colors " +
  "focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/25";

const Input = ({ className = "", ...p }) => (
  <input {...p} className={fieldCls + " h-9 disabled:cursor-not-allowed disabled:bg-secondary/50 disabled:text-muted-foreground " + className} />
);

const Textarea = ({ className = "", rows = 4, ...p }) => (
  <textarea rows={rows} {...p} className={fieldCls + " py-2 leading-6 resize-none " + className} />
);

const NativeSelect = ({ className = "", children, ...p }) => (
  <div className="relative">
    <select {...p} className={fieldCls + " h-9 appearance-none pr-9 cursor-pointer " + className}>{children}</select>
    <Icon name="chevron" size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
  </div>
);

const Field = ({ label, htmlFor, required, hint, children, className = "" }) => (
  <div className={className}>
    <label htmlFor={htmlFor} className={labelCls}>
      {label}{required && <span className="text-destructive">*</span>}
    </label>
    <div className="mt-2">{children}</div>
    {hint && <p className="mt-2 text-[12px] leading-5 text-muted-foreground" style={{ textWrap: 'pretty' }}>{hint}</p>}
  </div>
);

/* brand checkbox — styled native input (same as in Tables) */
const Check = ({ checked, onChange }) => (
  <span className="relative inline-flex items-center justify-center w-[18px] h-[18px] shrink-0">
    <input type="checkbox" checked={checked} onChange={onChange}
      className="peer appearance-none w-[18px] h-[18px] rounded-[5px] border border-border bg-background cursor-pointer checked:bg-primary checked:border-primary transition-colors" />
    <span className="pointer-events-none absolute text-primary-foreground opacity-0 peer-checked:opacity-100">
      <Icon name="check" size={13} stroke={2.4} />
    </span>
  </span>
);

const Divider = ({ className = "" }) => <div className={"border-t border-border " + className} />;

const SubmitBtn = ({ label, done, doneLabel }) => (
  <button type="submit"
    className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
    {done && <Icon name="check" size={15} stroke={2.4} />}{done ? doneLabel : label}
  </button>
);
const GhostBtn = ({ children, ...p }) => (
  <button type="button" {...p}
    className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-4 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
    {children}
  </button>
);

/* variant wrapper — preview surface, bare form */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card p-6 sm:p-8 lg:p-10">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* minimal hook: brief feedback on submit (no real action) */
function useSubmitFlash() {
  const [done, setDone] = useState(false);
  const fire = (e) => { if (e) e.preventDefault(); setDone(true); setTimeout(() => setDone(false), 1600); };
  return [done, fire];
}

/* ════════════════════════════════════════════════════════════════════════
   1 · SETTINGS WITH SECTIONS — profile · workspace · alerts
   ════════════════════════════════════════════════════════════════════════ */
const SettingsHead = ({ title, desc }) => (
  <div>
    <h3 className="font-sans font-semibold text-[14px] text-foreground">{title}</h3>
    <p className="mt-1 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>{desc}</p>
  </div>
);

const TEAM_ALERTS = [
  { id: 'access', label: 'Workspace access requests', on: true },
  { id: 'digest', label: 'Weekly team activity digest', on: false },
];
const OPS_ALERTS = [
  { id: 'cost', label: 'Cost spikes per namespace', on: true },
  { id: 'latency', label: 'High service latency', on: false },
  { id: 'retries', label: 'Retries and fallbacks', on: true },
  { id: 'quota', label: 'Usage quota near the limit', on: true },
];

function SettingsForm() {
  const [checks, setChecks] = useState(() => {
    const o = {}; [...TEAM_ALERTS, ...OPS_ALERTS].forEach(a => o[a.id] = a.on); return o;
  });
  const toggle = (id) => setChecks(c => ({ ...c, [id]: !c[id] }));
  const [done, fire] = useSubmitFlash();

  const AlertList = ({ items }) => (
    <div className="mt-3 rounded-md border border-border bg-background/40 divide-y divide-border/60">
      {items.map(a => (
        <label key={a.id} htmlFor={a.id} className="flex items-center gap-3 px-3.5 h-[46px] cursor-pointer">
          <Check checked={checks[a.id]} onChange={() => toggle(a.id)} />
          <span className="text-[13px] font-medium text-foreground select-none">{a.label}</span>
        </label>
      ))}
    </div>
  );

  return (
    <form onSubmit={fire} className="mx-auto w-full max-w-4xl">
      {/* Profile */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
        <SettingsHead title="Profile" desc="How you appear in jobs, audits and assignments within the workspace." />
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            <Field className="col-span-full sm:col-span-3" label="First name" htmlFor="first-name">
              <Input id="first-name" name="first-name" autoComplete="given-name" placeholder="Emma" />
            </Field>
            <Field className="col-span-full sm:col-span-3" label="Last name" htmlFor="last-name">
              <Input id="last-name" name="last-name" autoComplete="family-name" placeholder="Crown" />
            </Field>
            <Field className="col-span-full" label="Work email" htmlFor="email">
              <Input id="email" name="email" type="email" autoComplete="email" placeholder="emma@company.com" />
            </Field>
            <Field className="col-span-full sm:col-span-3" label="Time zone" htmlFor="tz">
              <NativeSelect id="tz" name="tz" defaultValue="eu">
                <option value="eu">Europe/Madrid (CET)</option>
                <option value="us-e">America/New_York (EST)</option>
                <option value="us-w">America/Los_Angeles (PST)</option>
              </NativeSelect>
            </Field>
            <Field className="col-span-full sm:col-span-3" label="Role" htmlFor="role"
              hint="Only a system administrator can change the role.">
              <Input id="role" name="role" placeholder="Senior engineer" disabled defaultValue="Senior engineer" />
            </Field>
          </div>
        </div>
      </div>

      <Divider className="my-9" />

      {/* Workspace settings */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
        <SettingsHead title="Workspace settings" desc="Name, visibility and description of the current workspace." />
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            <Field className="col-span-full sm:col-span-3" label="Workspace name" htmlFor="ws-name">
              <Input id="ws-name" name="ws-name" placeholder="prod-workspace" />
            </Field>
            <Field className="col-span-full sm:col-span-3" label="Visibility" htmlFor="ws-vis">
              <NativeSelect id="ws-vis" name="ws-vis" defaultValue="private">
                <option value="private">Private</option>
                <option value="public">Public</option>
              </NativeSelect>
            </Field>
            <Field className="col-span-full" label="Description" htmlFor="ws-desc"
              hint="Note: the description is not shown outside the organisation.">
              <Textarea id="ws-desc" name="ws-desc" rows={4} placeholder="What this workspace is for…" />
            </Field>
          </div>
        </div>
      </div>

      <Divider className="my-9" />

      {/* Alerts */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
        <SettingsHead title="Alerts" desc="Choose which team and operations events you want to receive." />
        <div className="md:col-span-2 space-y-7">
          <fieldset>
            <legend className="text-[13px] font-medium text-foreground">Team</legend>
            <p className="mt-1 text-[13px] text-muted-foreground">Notices about team access and activity.</p>
            <AlertList items={TEAM_ALERTS} />
          </fieldset>
          <fieldset>
            <legend className="text-[13px] font-medium text-foreground">Operations</legend>
            <p className="mt-1 text-[13px] text-muted-foreground">Operational signals: service cost, latency and reliability.</p>
            <AlertList items={OPS_ALERTS} />
          </fieldset>
        </div>
      </div>

      <Divider className="my-9" />
      <div className="flex items-center justify-end gap-3">
        <GhostBtn>Back</GhostBtn>
        <SubmitBtn label="Save settings" done={done} doneLabel="Saved" />
      </div>
    </form>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   2 · REQUEST WITH PACKAGES — fields + selectable capacity cards
   ════════════════════════════════════════════════════════════════════════ */
const PACKAGES = [
  { id: 'starter',    title: 'Starter',    desc: 'Up to 10,000 requests per day.',   price: 'Free',
    features: ['Community support', '50 GB of storage', 'Built-in workflow builder'] },
  { id: 'premium',    title: 'Premium',    desc: '500,000 requests per day¹',        price: '$900/mo²',
    features: ['Slack Connect support', '100 GB of storage', 'Managed workspace', 'Built-in workflow builder'] },
  { id: 'enterprise', title: 'Enterprise', desc: 'Tailored to your team\'s needs',   price: 'Custom',
    features: ['Priority Slack Connect support', 'Unlimited storage', 'Built-in workflow builder', 'Volume discount'] },
];

function PackagesForm() {
  const [sel, setSel] = useState('starter');
  const [done, fire] = useSubmitFlash();
  const pkg = PACKAGES.find(p => p.id === sel);

  return (
    <form onSubmit={fire} className="mx-auto w-full max-w-2xl">
      <h3 className="font-sans text-[18px] font-semibold tracking-tight text-foreground">Request capacity for a team</h3>
      <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
        Provision a workspace with a dedicated quota. We approve the request and have the namespace ready in less than one business day.
      </p>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-6">
        <Field className="col-span-full sm:col-span-3" label="First name" htmlFor="p-first" required>
          <Input id="p-first" name="p-first" autoComplete="given-name" required placeholder="Emma" />
        </Field>
        <Field className="col-span-full sm:col-span-3" label="Last name" htmlFor="p-last">
          <Input id="p-last" name="p-last" autoComplete="family-name" placeholder="Crown" />
        </Field>
        <Field className="col-span-full" label="Work email" htmlFor="p-email" required>
          <Input id="p-email" name="p-email" type="email" autoComplete="email" required placeholder="emma@company.com" />
        </Field>
        <Field className="col-span-full sm:col-span-3" label="Team" htmlFor="p-team">
          <Input id="p-team" name="p-team" autoComplete="organization" placeholder="Platform, Support…" />
        </Field>
        <Field className="col-span-full sm:col-span-3" label="Team size" htmlFor="p-size">
          <NativeSelect id="p-size" name="p-size" defaultValue="">
            <option value="" disabled>Select…</option>
            <option value="1-9">1–9</option>
            <option value="10-50">10–50</option>
            <option value="50-250">50–250</option>
            <option value="250+">250+</option>
          </NativeSelect>
        </Field>
      </div>

      <Divider className="my-8" />

      <div role="radiogroup" aria-label="Capacity package">
        <p className="text-[13px] font-semibold text-foreground">Choose a capacity package</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PACKAGES.map(p => {
            const on = sel === p.id;
            return (
              <button type="button" key={p.id} role="radio" aria-checked={on} onClick={() => setSel(p.id)}
                className={"relative flex flex-col rounded-md border bg-background p-4 text-left transition-colors " +
                  (on ? "border-primary/60 ring-2 ring-primary/25" : "border-border hover:border-muted-foreground/40")}>
                <span className="block text-[13px] font-semibold text-foreground">{p.title}</span>
                <span className="mt-1 text-[12.5px] leading-5 text-muted-foreground">{p.desc}</span>
                <span className="mt-6 text-[13px] font-semibold text-foreground">{p.price}</span>
                <span className={"absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity " + (on ? "opacity-100" : "opacity-0")}>
                  <Icon name="check" size={13} stroke={2.6} />
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-[13px] font-medium text-foreground">Includes:</p>
        <ul role="list" className="mt-2 space-y-2">
          {pkg.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <Icon name="check" size={16} className="text-primary shrink-0" />
              <span className="text-[13px] text-foreground/85">{f}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[12px] text-muted-foreground"><sup>1</sup> $0.50 / 10K requests over the limit.</p>
        <p className="mt-1 text-[12px] text-muted-foreground"><sup>2</sup> No card required to sign up.</p>
      </div>

      <Divider className="my-8" />
      <div className="flex items-center justify-end gap-3">
        <GhostBtn>Back</GhostBtn>
        <SubmitBtn label="Request access" done={done} doneLabel="Request sent" />
      </div>
    </form>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   3 · CREATE WORKSPACE — two columns: plan cards + help panel
   ════════════════════════════════════════════════════════════════════════ */
const PLANS = [
  { id: 'hobby', name: 'Hobby', price: '$40', recommended: false,
    features: ['1,000 requests per day', '3 environments', 'Up to 10 members', 'Community support'] },
  { id: 'premium', name: 'Premium', price: '$80', recommended: true,
    features: ['100,000 requests per day', '10 environments', 'Up to 50 members', 'Premium Slack support'] },
  { id: 'enterprise', name: 'Enterprise', price: '$160', recommended: false,
    features: ['Unlimited requests', 'Unlimited environments and members', 'SSO with SAML', '99.99% SLA', 'Volume discount'] },
];
const WS_HIGHLIGHTS = [
  'Used by 24/7 operations teams',
  'Built on open-source technology',
  'The largest community of practitioners',
];

function CreateWorkspaceForm() {
  const [sel, setSel] = useState('hobby');
  const [done, fire] = useSubmitFlash();

  return (
    <form onSubmit={fire} className="w-full">
      <h3 className="font-sans text-[18px] font-semibold tracking-tight text-foreground">Create new workspace</h3>

      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-12">
        {/* main column */}
        <div className="lg:col-span-7">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
              <Field className="sm:w-56 shrink-0" label="Organisation" htmlFor="ws-org">
                <NativeSelect id="ws-org" name="ws-org" defaultValue="1">
                  <option value="1">Acme, Inc.</option>
                  <option value="2">Hero Labs</option>
                  <option value="3">Rose Holding</option>
                </NativeSelect>
              </Field>
              <Field className="flex-1" label="Workspace name" htmlFor="ws-new">
                <Input id="ws-new" name="ws-new" placeholder="prod-eu" />
              </Field>
            </div>
            <Field label="Region" htmlFor="ws-region"
              hint="For the best performance, pick the region closest to your users.">
              <NativeSelect id="ws-region" name="ws-region" defaultValue="1">
                <option value="1">EU-West (Frankfurt)</option>
                <option value="2">US-East (Boston)</option>
                <option value="3">US-West (San Francisco)</option>
              </NativeSelect>
            </Field>
          </div>

          <h4 className="mt-10 text-[13px] font-medium text-foreground">Plan type<span className="text-destructive">*</span></h4>
          <div role="radiogroup" aria-label="Plan type" className="mt-3 space-y-4">
            {PLANS.map(plan => {
              const on = sel === plan.id;
              return (
                <button type="button" key={plan.id} role="radio" aria-checked={on} onClick={() => setSel(plan.id)}
                  className={"relative block w-full overflow-hidden rounded-md border bg-background text-left transition-colors " +
                    (on ? "border-primary/60 ring-2 ring-primary/25" : "border-border hover:border-muted-foreground/40")}>
                  <div className="flex items-start gap-3 px-5 py-4">
                    <span className={"mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors " +
                      (on ? "border-primary bg-primary" : "border-muted-foreground/40 bg-background")}>
                      <span className={"size-1.5 rounded-full " + (on ? "bg-primary-foreground" : "bg-transparent")} />
                    </span>
                    <div className="w-full">
                      <p className="flex items-center gap-2 leading-6">
                        <span className="text-[13px] font-semibold text-foreground">{plan.name}</span>
                        {plan.recommended && (
                          <span className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/14">recommended</span>
                        )}
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                            <Icon name="check" size={14} className="text-muted-foreground/60 shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border bg-background/60 px-5 py-2.5">
                    <span className="inline-flex items-center gap-1 text-[12.5px] text-primary hover:underline underline-offset-4">
                      Learn more <Icon name="external" size={13} />
                    </span>
                    <div>
                      <span className="text-[15px] font-semibold text-foreground">{plan.price}</span>
                      <span className="text-[12.5px] text-muted-foreground">/mo</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* help panel */}
        <div className="lg:col-span-5">
          <div className="rounded-lg border border-border bg-secondary/50 p-6">
            <h4 className="text-[13px] font-semibold text-foreground">Which plan fits best?</h4>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
              Start on Hobby to validate a service and move to Premium once traffic is steady. Enterprise adds SSO, an SLA and dedicated support.
            </p>
            <ul role="list" className="mt-4 space-y-3">
              {WS_HIGHLIGHTS.map((h, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"><Icon name="check" size={13} stroke={2.4} /></span>
                  <span className="text-[13px] text-foreground/85">{h}</span>
                </li>
              ))}
            </ul>
            <a href="#" onClick={(e) => e.preventDefault()} className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline underline-offset-4">
              Compare workspace plans <Icon name="external" size={14} />
            </a>
          </div>
        </div>
      </div>

      <Divider className="my-8" />
      <div className="flex items-center justify-end gap-3">
        <GhostBtn>Cancel</GhostBtn>
        <SubmitBtn label="Create workspace" done={done} doneLabel="Workspace created" />
      </div>
    </form>
  );
}

/* ── snippets to paste ───────────────────────────────────────────────────── */
const CODE_PRIMS = `// Field primitives — recessed input (bg-background) + brand ring
const field =
  "block w-full rounded-md border border-border bg-background px-3 text-[13px] " +
  "text-foreground placeholder:text-muted-foreground shadow-sm transition-colors " +
  "focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/25";

const Input = (p) => <input {...p} className={\`\${field} h-9\`} />;
const Textarea = (p) => <textarea {...p} className={\`\${field} py-2 leading-6 resize-none\`} />;
const Select = ({ children, ...p }) => (
  <div className="relative">
    <select {...p} className={\`\${field} h-9 appearance-none pr-9 cursor-pointer\`}>{children}</select>
    <ChevronIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
  </div>
);
const Field = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-[13px] font-medium text-foreground">
      {label}{required && <span className="text-destructive">*</span>}
    </label>
    <div className="mt-2">{children}</div>
    {hint && <p className="mt-2 text-[12px] text-muted-foreground">{hint}</p>}
  </div>
);`;

const CODE_SETTINGS = `// Settings with sections — label on the left, fields on the right
{sections.map((s) => (
  <div key={s.id} className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
    <div>
      <h3 className="text-[14px] font-semibold text-foreground">{s.title}</h3>
      <p className="mt-1 text-[13px] leading-6 text-muted-foreground">{s.desc}</p>
    </div>
    <div className="md:col-span-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">{s.fields /* col-span-3 / col-span-full */}</div>
    </div>
  </div>
))}
// Alert list: brand checkbox in divided rows
<div className="rounded-md border border-border bg-background/40 divide-y divide-border/60">
  {alerts.map((a) => (
    <label key={a.id} className="flex items-center gap-3 px-3.5 h-[46px] cursor-pointer">
      <Check checked={checks[a.id]} onChange={() => toggle(a.id)} />
      <span className="text-[13px] font-medium text-foreground">{a.label}</span>
    </label>
  ))}
</div>
// footer: <Divider /> + actions on the right (Back · Save settings)`;

const CODE_PACKAGES = `// Selectable capacity cards — the "Includes" list reacts to the choice
const [sel, setSel] = useState('starter');
const pkg = PACKAGES.find((p) => p.id === sel);

<div role="radiogroup" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
  {PACKAGES.map((p) => {
    const on = sel === p.id;
    return (
      <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => setSel(p.id)}
        className={\`relative flex flex-col rounded-md border bg-background p-4 text-left transition-colors \${
          on ? 'border-primary/60 ring-2 ring-primary/25' : 'border-border hover:border-muted-foreground/40'}\`}>
        <span className="text-[13px] font-semibold text-foreground">{p.title}</span>
        <span className="mt-1 text-[12.5px] text-muted-foreground">{p.desc}</span>
        <span className="mt-6 text-[13px] font-semibold text-foreground">{p.price}</span>
        {on && (
          <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckIcon />
          </span>
        )}
      </button>
    );
  })}
</div>

<ul className="mt-2 space-y-2">
  {pkg.features.map((f, i) => (
    <li key={i} className="flex items-center gap-2 text-[13px] text-foreground/85">
      <CheckIcon className="text-primary" />{f}
    </li>
  ))}
</ul>`;

const CODE_WORKSPACE = `// Create workspace — plan cards (col 7) + help panel (col 5)
<div className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-12">
  <div className="lg:col-span-7">
    {/* Organisation + Name (row) · Region (with hint) */}
    <div role="radiogroup" className="mt-3 space-y-4">
      {PLANS.map((plan) => {
        const on = sel === plan.id;
        return (
          <button key={plan.id} type="button" role="radio" aria-checked={on} onClick={() => setSel(plan.id)}
            className={\`relative block w-full overflow-hidden rounded-md border bg-background text-left transition-colors \${
              on ? 'border-primary/60 ring-2 ring-primary/25' : 'border-border hover:border-muted-foreground/40'}\`}>
            <div className="flex items-start gap-3 px-5 py-4">
              <span className={\`mt-0.5 flex size-4 items-center justify-center rounded-full border \${
                on ? 'border-primary bg-primary' : 'border-muted-foreground/40'}\`}>
                <span className={\`size-1.5 rounded-full \${on ? 'bg-primary-foreground' : ''}\`} />
              </span>
              <div>
                <span className="text-[13px] font-semibold text-foreground">{plan.name}</span>
                {plan.recommended && <Badge>recommended</Badge>}
                <ul>{plan.features.map((f) => <li key={f}><CheckIcon />{f}</li>)}</ul>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border bg-background/60 px-5 py-2.5">
              <a className="text-primary">Learn more</a>
              <span className="text-[15px] font-semibold text-foreground">{plan.price}<small>/mo</small></span>
            </div>
          </button>
        );
      })}
    </div>
  </div>
  <aside className="lg:col-span-5">{/* bg-secondary/50 panel with highlights */}</aside>
</div>`;

/* ── section ─────────────────────────────────────────────────────────────── */
function FormLayoutsSection() {
  return (
    <div>
      <SectionHead kicker="Forms" title="Form layouts" status="done"
        intro="Complete form compositions on the brand primitives: input, native select, textarea, checkbox and radio card, all with the green ring and the token radii and shadows. Three canonical layouts — settings with sections, a capacity request and workspace creation. Fields are recessed (bg-background) on the card and everything reacts live: check, type and submit." />

      <Variant title="Field primitives"
        desc="The base shared by the three forms. A recessed field with a token border, brand ring on focus, and a Field wrapper with label, required asterisk and help note. Native select with its own chevron."
        code={CODE_PRIMS}>
        <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Work email" htmlFor="demo-email" required>
            <Input id="demo-email" type="email" placeholder="emma@company.com" />
          </Field>
          <Field label="Region" htmlFor="demo-region">
            <NativeSelect id="demo-region" defaultValue="1">
              <option value="1">EU-West (Frankfurt)</option>
              <option value="2">US-East (Boston)</option>
            </NativeSelect>
          </Field>
          <Field className="sm:col-span-2" label="Description" htmlFor="demo-desc" hint="Help text under the field.">
            <Textarea id="demo-desc" rows={3} placeholder="What this workspace is for…" />
          </Field>
          <Field label="Status" htmlFor="demo-disabled" hint="Disabled field.">
            <Input id="demo-disabled" disabled defaultValue="Read-only" />
          </Field>
          <div>
            <span className={labelCls}>Alert</span>
            <label className="mt-2 flex items-center gap-3 h-9 cursor-pointer">
              <Check checked onChange={() => {}} />
              <span className="text-[13px] font-medium text-foreground">Cost spikes</span>
            </label>
          </div>
        </div>
      </Variant>

      <Variant title="Settings with sections"
        desc="The classic settings page layout: each block has its title and description on the left and the fields in a grid on the right, separated by dividers. Profile, workspace settings and an alert list with checkboxes that toggle live."
        code={CODE_SETTINGS}>
        <SettingsForm />
      </Variant>

      <Variant title="Request with packages"
        desc="A sign-up form with selectable capacity cards. Pick Starter, Premium or Enterprise and the “Includes” list updates instantly; the active card takes the green ring and the check mark."
        code={CODE_PACKAGES}>
        <PackagesForm />
      </Variant>

      <Variant title="Create workspace"
        desc="Two-column layout: on the left the details and the plan as stacked cards with features and price; on the right a help panel that supports the decision. The recommended plan is flagged and the selection is highlighted with the brand ring."
        code={CODE_WORKSPACE}>
        <CreateWorkspaceForm />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['form-layouts'] = FormLayoutsSection;
})();
