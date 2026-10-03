/* ============================================================================
   Gntik UI · checkboxes.jsx — checkboxes ("Forms" group).
   The brand checkbox (styled native input, green check) in a list with
   descriptions, in a group with an indeterminate "select all", and as
   multi-select cards (safeguards, namespaces, permissions).
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

/* brand checkbox with indeterminate support (same pattern as Tables) */
const Check = ({ checked, indeterminate, onChange, disabled }) => (
  <span className="relative inline-flex items-center justify-center w-[18px] h-[18px] shrink-0">
    <input type="checkbox" checked={checked} disabled={disabled} ref={el => el && (el.indeterminate = !!indeterminate)} onChange={onChange}
      className="peer appearance-none w-[18px] h-[18px] rounded-[5px] border border-border bg-background cursor-pointer checked:bg-primary checked:border-primary indeterminate:bg-primary indeterminate:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors" />
    <span className="pointer-events-none absolute text-primary-foreground opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-100">
      <Icon name={indeterminate ? 'minus' : 'check'} size={13} stroke={2.4} />
    </span>
  </span>
);

/* ── 1 · LIST with description ───────────────────────────────────────────── */
const GUARDRAILS = [
  { id: 'pii', label: 'PII redaction', desc: 'Masks emails, cards and phone numbers before they are stored.' },
  { id: 'allow', label: 'Integration allowlist', desc: 'The service can only call integrations approved for its namespace.' },
  { id: 'audit', label: 'Audit log', desc: 'Records every request and response for compliance review.' },
];
function ListWithDesc() {
  const [on, setOn] = useState({ pii: true, allow: true, audit: false });
  return (
    <fieldset className="mx-auto w-full max-w-lg">
      <legend className="text-[13px] font-semibold text-foreground">Service safeguards</legend>
      <div className="mt-3 divide-y divide-border/60 overflow-hidden rounded-md border border-border bg-background/40">
        {GUARDRAILS.map(g => (
          <label key={g.id} htmlFor={'gr-' + g.id} className="flex cursor-pointer items-start gap-3 px-4 py-3.5">
            <span className="mt-0.5"><Check checked={!!on[g.id]} onChange={() => setOn(o => ({ ...o, [g.id]: !o[g.id] }))} /></span>
            <span className="min-w-0">
              <span id={'gr-' + g.id} className="block text-[13px] font-medium text-foreground">{g.label}</span>
              <span className="mt-0.5 block text-[12.5px] leading-5 text-muted-foreground" style={{ textWrap: 'pretty' }}>{g.desc}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* ── 2 · GROUP with "select all" (indeterminate) ─────────────────────────── */
const NAMESPACES = ['checkout-api', 'support-tier1', 'data-pipeline', 'billing-api', 'onboarding'];
function SelectAll() {
  const [sel, setSel] = useState(['checkout-api', 'support-tier1']);
  const all = sel.length === NAMESPACES.length;
  const some = sel.length > 0 && !all;
  const toggleAll = () => setSel(all ? [] : [...NAMESPACES]);
  const toggle = (n) => setSel(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n]);
  return (
    <div className="mx-auto w-full max-w-lg">
      <label className="flex items-center gap-3 border-b border-border pb-3">
        <Check checked={all} indeterminate={some} onChange={toggleAll} />
        <span className="text-[13px] font-semibold text-foreground">Include all namespaces</span>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">{sel.length}/{NAMESPACES.length}</span>
      </label>
      <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {NAMESPACES.map(n => (
          <label key={n} className="flex cursor-pointer items-center gap-3">
            <Check checked={sel.includes(n)} onChange={() => toggle(n)} />
            <span className="font-mono text-[12.5px] text-foreground">{n}</span>
          </label>
        ))}
      </div>
      <p className="mt-4 text-[12px] text-muted-foreground">The header goes indeterminate (dash) when the selection is partial.</p>
    </div>
  );
}

/* ── 3 · Multi-select CARDS ──────────────────────────────────────────────── */
const CAPS = [
  { id: 'web', icon: 'search', label: 'Outbound network', desc: 'Calls external endpoints during a request.' },
  { id: 'code', icon: 'code', label: 'Code execution', desc: 'Isolated sandbox for Python and JS.' },
  { id: 'files', icon: 'box', label: 'File access', desc: 'Reads and writes the workspace bucket.' },
  { id: 'tools', icon: 'bolt', label: 'Webhooks', desc: 'Calls the namespace\'s registered APIs.' },
];
function CardChecks() {
  const [sel, setSel] = useState(['web', 'tools']);
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  return (
    <fieldset className="mx-auto w-full max-w-2xl">
      <legend className="mb-3 text-[13px] font-semibold text-foreground">Service permissions</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CAPS.map(c => {
          const on = sel.includes(c.id);
          return (
            <label key={c.id}
              className={"relative flex cursor-pointer gap-3 rounded-md border bg-background p-4 transition-colors " +
                (on ? 'border-primary/60 ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground/40')}>
              <input type="checkbox" checked={on} onChange={() => toggle(c.id)} className="sr-only" />
              <span className={"grid size-9 shrink-0 place-items-center rounded-md transition-colors " + (on ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground')}>
                <Icon name={c.icon} size={17} />
              </span>
              <span className="min-w-0 pr-6">
                <span className="block text-[13px] font-semibold text-foreground">{c.label}</span>
                <span className="mt-0.5 block text-[12px] leading-5 text-muted-foreground" style={{ textWrap: 'pretty' }}>{c.desc}</span>
              </span>
              <span className={"absolute right-3 top-3 grid size-[18px] place-items-center rounded-[5px] border transition-all " + (on ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-transparent')}>
                <Icon name="check" size={12} stroke={2.6} />
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_CHECK = `// Brand checkbox — styled native input (supports indeterminate)
const Check = ({ checked, indeterminate, onChange }) => (
  <span className="relative inline-flex h-[18px] w-[18px] items-center justify-center">
    <input type="checkbox" checked={checked} onChange={onChange}
      ref={(el) => el && (el.indeterminate = !!indeterminate)}
      className="peer h-[18px] w-[18px] appearance-none rounded-[5px] border border-border bg-background
                 cursor-pointer transition-colors checked:bg-primary checked:border-primary
                 indeterminate:bg-primary indeterminate:border-primary" />
    <span className="pointer-events-none absolute text-primary-foreground opacity-0
                     peer-checked:opacity-100 peer-indeterminate:opacity-100">
      <Icon name={indeterminate ? 'minus' : 'check'} size={13} stroke={2.4} />
    </span>
  </span>
);`;

const CODE_LIST = `// List with description — check on top (items-start), two-line text
<div className="divide-y divide-border/60 rounded-md border border-border bg-background/40">
  {items.map((it) => (
    <label key={it.id} className="flex items-start gap-3 px-4 py-3.5 cursor-pointer">
      <span className="mt-0.5"><Check checked={on[it.id]} onChange={() => toggle(it.id)} /></span>
      <span>
        <span className="block text-[13px] font-medium text-foreground">{it.label}</span>
        <span className="block text-[12.5px] text-muted-foreground">{it.desc}</span>
      </span>
    </label>
  ))}
</div>`;

const CODE_ALL = `// Select all — the header goes indeterminate on partial selection
const all = sel.length === items.length;
const some = sel.length > 0 && !all;
<Check checked={all} indeterminate={some} onChange={() => setSel(all ? [] : [...items])} />`;

const CODE_CARDS = `// Multi-select card — sr-only input; the border/ring and the tick are the UI
<label className={\`relative flex gap-3 rounded-md border bg-background p-4 cursor-pointer \${
  on ? 'border-primary/60 ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground/40'}\`}>
  <input type="checkbox" checked={on} onChange={toggle} className="sr-only" />
  <span className={\`grid size-9 place-items-center rounded-md \${on ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'}\`}><Icon /></span>
  <span>{title}<small>{desc}</small></span>
  <span className={\`absolute right-3 top-3 grid size-[18px] place-items-center rounded-[5px] border \${
    on ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-transparent'}\`}><CheckIcon /></span>
</label>`;

/* ── section ─────────────────────────────────────────────────────────────── */
function CheckboxesSection() {
  return (
    <div>
      <SectionHead kicker="Forms" title="Checkboxes" status="done"
        intro="The brand checkbox is a styled native input: a recessed box that fills green with the tick in primary-foreground, and it supports the indeterminate state. Here in its three forms — a list with descriptions for safeguards, a group with “select all” for namespaces, and multi-select cards for service permissions." />

      <Variant title="List with description"
        desc="The box aligned to the top with a label and a help line. The pattern for options that need explaining — safeguards, permissions, alerts."
        code={CODE_LIST}>
        <ListWithDesc />
      </Variant>

      <Variant title="Select all · indeterminate"
        desc="A header that checks or unchecks the group and shows the dash (indeterminate) when the selection is partial, over a grid of namespaces."
        code={CODE_ALL}>
        <SelectAll />
      </Variant>

      <Variant title="Multi-select cards"
        desc="When each option deserves an icon and description: the input is hidden and the whole card is the target, with a brand ring and a corner tick when active."
        code={CODE_CARDS}>
        <CardChecks />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['checkboxes'] = CheckboxesSection;
})();
