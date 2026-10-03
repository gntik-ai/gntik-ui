/* ============================================================================
   Gntik UI · toggles.jsx — switches ("Forms" group).
   The brand switch (track turns green, recessed knob) as simple + sizes,
   a setting row with label and description, and with an icon inside the
   knob / inline. Neutral fixtures (auto-scaling, retries, maintenance).
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

/* ── Brand switch ────────────────────────────────────────────────────────── */
const SW = {
  sm: { track: 'h-[18px] w-8', knob: 'size-3.5', on: 'translate-x-[14px]', ic: 9 },
  md: { track: 'h-[22px] w-[40px]', knob: 'size-[18px]', on: 'translate-x-[18px]', ic: 11 },
  lg: { track: 'h-[26px] w-[46px]', knob: 'size-[22px]', on: 'translate-x-[20px]', ic: 13 },
};
const Switch = ({ on, onChange, size = 'md', disabled, icon }) => {
  const s = SW[size];
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} onClick={onChange}
      className={"relative inline-flex shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card " +
        s.track + " " + (on ? 'bg-primary' : 'bg-secondary') + (disabled ? ' cursor-not-allowed opacity-50' : ' cursor-pointer')}>
      <span className={"pointer-events-none ml-[2px] grid place-items-center rounded-full bg-background shadow-sm transition-transform " +
        s.knob + " " + (on ? s.on : 'translate-x-0')}>
        {icon && <Icon name={on ? 'check' : 'x'} size={s.ic} stroke={2.6} className={on ? 'text-primary' : 'text-muted-foreground'} />}
      </span>
    </button>
  );
};

/* hook: local state by id */
const useToggles = (init) => { const [on, set] = useState(init); return [on, (id) => set(o => ({ ...o, [id]: !o[id] }))]; };

/* ── 1 · SIMPLE + sizes + states ────────────────────────────────────────── */
function SimpleToggles() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const [c, setC] = useState(true);
  const Demo = ({ label, children }) => (
    <div className="flex flex-col items-center gap-2.5">
      {children}
      <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground/80">{label}</span>
    </div>
  );
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-wrap items-start justify-center gap-x-10 gap-y-6">
      <Demo label="sm"><Switch size="sm" on={a} onChange={() => setA(v => !v)} /></Demo>
      <Demo label="md"><Switch size="md" on={a} onChange={() => setA(v => !v)} /></Demo>
      <Demo label="lg"><Switch size="lg" on={a} onChange={() => setA(v => !v)} /></Demo>
      <Demo label="off"><Switch on={b} onChange={() => setB(v => !v)} /></Demo>
      <Demo label="on · disabled"><Switch on={c} disabled onChange={() => {}} /></Demo>
      <Demo label="off · disabled"><Switch on={false} disabled onChange={() => {}} /></Demo>
    </div>
  );
}

/* ── 2 · SETTING ROW with label + description ────────────────────────────── */
const SETTINGS = [
  { id: 'autoscale', label: 'Auto-scaling', desc: 'Provisions replicas based on the request queue.' },
  { id: 'retry', label: 'Automatic retries', desc: 'Retries 3× with backoff before falling back.' },
  { id: 'anon', label: 'Anonymize logs', desc: 'Redacts PII in the audit trail before persisting.' },
  { id: 'maint', label: 'Maintenance mode', desc: 'Locked: requires the system administrator role.', locked: true },
];
function SettingRows() {
  const [on, toggle] = useToggles({ autoscale: true, retry: true, anon: false, maint: false });
  return (
    <div className="mx-auto w-full max-w-lg divide-y divide-border/60 overflow-hidden rounded-md border border-border bg-background/40">
      {SETTINGS.map(s => (
        <div key={s.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-foreground">{s.label}</span>
              {s.locked && <Icon name="lock" size={12} className="text-muted-foreground" />}
            </div>
            <p className="mt-0.5 text-[12.5px] leading-5 text-muted-foreground" style={{ textWrap: 'pretty' }}>{s.desc}</p>
          </div>
          <Switch on={!!on[s.id]} disabled={s.locked} onChange={() => toggle(s.id)} />
        </div>
      ))}
    </div>
  );
}

/* ── 3 · WITH ICON + INLINE ──────────────────────────────────────────────── */
function IconInline() {
  const [hot, setHot] = useState(true);
  const [verbose, setVerbose] = useState(false);
  const [live, setLive] = useState(true);
  return (
    <div className="mx-auto w-full max-w-lg space-y-7">
      {/* with an icon inside the knob */}
      <div className="flex items-center justify-between rounded-md border border-border bg-background/40 px-4 py-3.5">
        <div>
          <div className="text-[13px] font-medium text-foreground">Keep warm</div>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">Avoids the service's cold start.</p>
        </div>
        <Switch on={hot} icon onChange={() => setHot(v => !v)} />
      </div>

      {/* inline with the label beside it */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <label className="flex cursor-pointer items-center gap-3" onClick={() => setVerbose(v => !v)}>
          <Switch size="sm" on={verbose} onChange={() => setVerbose(v => !v)} />
          <span className="text-[13px] font-medium text-foreground">Verbose traces</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3" onClick={() => setLive(v => !v)}>
          <Switch size="sm" on={live} icon onChange={() => setLive(v => !v)} />
          <span className="text-[13px] font-medium text-foreground">Live stream</span>
        </label>
      </div>
      <p className="text-[12px] text-muted-foreground">The knob shows check/✕ with the <code className="font-mono text-[11px]">icon</code> prop; at size sm it works as a compact toggle next to the label.</p>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SWITCH = `// Brand switch — bg-primary/bg-secondary track; recessed knob (bg-background)
const SW = {
  sm: { track: 'h-[18px] w-8',     knob: 'size-3.5',    on: 'translate-x-[14px]' },
  md: { track: 'h-[22px] w-[40px]', knob: 'size-[18px]', on: 'translate-x-[18px]' },
};
const Switch = ({ on, onChange, size = 'md', disabled, icon }) => {
  const s = SW[size];
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} onClick={onChange}
      className={\`relative inline-flex items-center rounded-full transition-colors focus:outline-none
        focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card
        \${s.track} \${on ? 'bg-primary' : 'bg-secondary'} \${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}\`}>
      <span className={\`ml-[2px] grid place-items-center rounded-full bg-background shadow-sm transition-transform
        \${s.knob} \${on ? s.on : 'translate-x-0'}\`}>
        {icon && <Icon name={on ? 'check' : 'x'} className={on ? 'text-primary' : 'text-muted-foreground'} />}
      </span>
    </button>
  );
};`;

const CODE_ROW = `// Setting row — label + description on the left, switch on the right
<div className="flex items-center justify-between gap-4 px-4 py-3.5">
  <div>
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-medium text-foreground">{s.label}</span>
      {s.locked && <LockIcon className="text-muted-foreground" />}
    </div>
    <p className="mt-0.5 text-[12.5px] text-muted-foreground">{s.desc}</p>
  </div>
  <Switch on={on[s.id]} disabled={s.locked} onChange={() => toggle(s.id)} />
</div>`;

/* ── section ─────────────────────────────────────────────────────────────── */
function TogglesSection() {
  return (
    <div>
      <SectionHead kicker="Forms" title="Toggles" status="done"
        intro="The brand switch for binary states: the track turns green when on and the knob is recessed (bg-background) so it reads well on any theme, including high contrast. Shown here simple and in three sizes, as a setting row with label and description, and with a check/✕ inside the knob or in a compact format next to a label." />

      <Variant title="Simple, sizes and states"
        desc="The standalone switch in sm · md · lg, plus the off, on-disabled and off-disabled states. role=switch and visible focus for accessibility."
        code={CODE_SWITCH}>
        <SimpleToggles />
      </Variant>

      <Variant title="Setting row"
        desc="The most common use: a divided list where each row has a label, a description and the switch on the right. The locked row shows a padlock and is disabled."
        code={CODE_ROW}>
        <SettingRows />
      </Variant>

      <Variant title="With icon and inline"
        desc="The knob can show a check when on and an ✕ when off (icon prop); at size sm it works as a compact toggle next to its label."
        code={CODE_SWITCH}>
        <IconInline />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['toggles'] = TogglesSection;
})();
