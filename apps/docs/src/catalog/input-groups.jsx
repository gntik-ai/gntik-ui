/* ============================================================================
   Gntik UI · input-groups.jsx — fields with add-ons ("Forms" group).
   Composite inputs on the brand primitive (recessed bg-background, green
   ring): icons and prefixes, keyboard hint, attached button, inline select,
   states (error/disabled) and the three sizes. Neutral fixtures.
   No hardcoded colors — everything resolves to tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

/* ── variant wrapper (card + code), same as form-layouts ────────────────── */
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

const labelCls = "block text-[12.5px] font-medium text-foreground mb-2";
const Cell = ({ label, children, wide }) => (
  <div className={wide ? "sm:col-span-2" : ""}>
    {label && <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80 mb-2">{label}</div>}
    {children}
  </div>
);
const G2 = ({ children }) => (
  <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">{children}</div>
);

/* brand ring shared by every group (focus-within on the wrapper) */
const ring = "transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25";
const groupBase = "flex items-center rounded-md border border-border bg-background shadow-sm " + ring;
const bareInput = "h-9 w-full min-w-0 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none";

/* keyboard hint · mono pill */
const Kbd = ({ children }) => (
  <span className="inline-flex h-[18px] items-center rounded border border-border bg-card px-1.5 font-mono text-[10px] font-medium text-muted-foreground">{children}</span>
);

/* ════════════════════════════════════════════════════════════════════════
   1 · ICONS, PREFIXES AND AFFIXES
   ════════════════════════════════════════════════════════════════════════ */
function Affixes() {
  return (
    <G2>
      <Cell label="Leading icon">
        <div className={groupBase + " pl-3 pr-3"}>
          <Icon name="search" size={15} className="text-muted-foreground shrink-0" />
          <input className={bareInput + " pl-2.5"} placeholder="Search services…" />
        </div>
      </Cell>

      <Cell label="Keyboard hint">
        <div className={groupBase + " pl-3 pr-2"}>
          <Icon name="bolt" size={15} className="text-muted-foreground shrink-0" />
          <input className={bareInput + " pl-2.5 pr-2"} placeholder="Go to…" />
          <Kbd>⌘K</Kbd>
        </div>
      </Cell>

      <Cell label="Domain prefix">
        <div className={groupBase + " pl-3 pr-3"}>
          <span className="select-none text-[13px] text-muted-foreground">example.com/</span>
          <input className={bareInput + " pl-1"} defaultValue="prod-eu" />
        </div>
      </Cell>

      <Cell label="Unit suffix">
        <div className={groupBase + " pl-3 pr-3"}>
          <input className={bareInput} defaultValue="2000" inputMode="numeric" />
          <span className="select-none text-[13px] text-muted-foreground shrink-0">req/s</span>
        </div>
      </Cell>

      <Cell label="Trailing icon-button" wide>
        <div className={groupBase + " pl-3 pr-1.5"}>
          <Icon name="lock" size={15} className="text-muted-foreground shrink-0" />
          <input type="password" className={bareInput + " pl-2.5"} defaultValue="sk-live-example" />
          <button type="button" aria-label="Show token"
            className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-secondary/70 hover:text-foreground transition-colors shrink-0">
            <Icon name="eye" size={15} />
          </button>
        </div>
      </Cell>
    </G2>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   2 · INLINE LABEL AND ATTACHED SELECT
   ════════════════════════════════════════════════════════════════════════ */
function InlineLabel() {
  return (
    <G2>
      <Cell label="Inset label">
        <div className={"rounded-md border border-border bg-background px-3 pt-1.5 pb-1 shadow-sm " + ring}>
          <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Namespace</label>
          <input className="block w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none" defaultValue="checkout-services" />
        </div>
      </Cell>

      <Cell label="Select inline (trailing)">
        <div className={groupBase + " pl-3 pr-0"}>
          <input className={bareInput} defaultValue="50" inputMode="numeric" />
          <div className="relative shrink-0">
            <select defaultValue="usd" className="h-9 cursor-pointer appearance-none rounded-r-md bg-transparent pl-2 pr-7 text-[13px] font-medium text-muted-foreground focus:outline-none">
              <option value="usd">USD / day</option>
              <option value="eur">EUR / day</option>
              <option value="tok">credits</option>
            </select>
            <Icon name="chevron" size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </Cell>

      <Cell label="Select inline (leading)" wide>
        <div className={groupBase + " pl-0 pr-3"}>
          <div className="relative shrink-0">
            <select defaultValue="https" className="h-9 cursor-pointer appearance-none rounded-l-md border-r border-border bg-transparent pl-3 pr-7 text-[13px] font-medium text-muted-foreground focus:outline-none">
              <option value="https">https://</option>
              <option value="wss">wss://</option>
            </select>
            <Icon name="chevron" size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
          <input className={bareInput + " pl-3"} defaultValue="checkout.acme.internal/webhook" />
        </div>
      </Cell>
    </G2>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   3 · WITH ATTACHED BUTTON
   ════════════════════════════════════════════════════════════════════════ */
function ButtonAttached() {
  const [val, setVal] = useState('');
  const [sent, setSent] = useState(false);
  const invite = () => { if (!val.trim()) return; setSent(true); setVal(''); setTimeout(() => setSent(false), 1500); };
  const join = "h-9 text-[13px] focus:outline-none focus:relative focus:z-10 focus:border-primary/60 focus:ring-2 focus:ring-ring/25";
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div>
        <label className={labelCls}>Invite operator</label>
        <div className="flex shadow-sm rounded-md">
          <input value={val} onChange={e => setVal(e.target.value)} type="email" placeholder="operator@acme.com"
            className={"w-full rounded-l-md border border-border bg-background px-3 text-foreground placeholder:text-muted-foreground " + join} />
          <button type="button" onClick={invite}
            className="-ml-px inline-flex shrink-0 items-center gap-1.5 rounded-r-md border border-primary bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            <Icon name={sent ? 'check' : 'plus'} size={15} stroke={2.4} />{sent ? 'Sent' : 'Invite'}
          </button>
        </div>
      </div>

      <div>
        <label className={labelCls}>Search services</label>
        <div className="flex shadow-sm rounded-md">
          <div className="flex w-full items-center rounded-l-md border border-border bg-background pl-3 focus-within:relative focus-within:z-10 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25 transition-colors">
            <Icon name="search" size={15} className="text-muted-foreground shrink-0" />
            <input placeholder="service, namespace, policy…" className="h-9 w-full bg-transparent pl-2.5 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
          </div>
          <button type="button"
            className="-ml-px inline-flex shrink-0 items-center gap-1.5 rounded-r-md border border-border bg-secondary/60 px-3.5 text-[13px] font-medium text-foreground hover:bg-secondary transition-colors">
            <Icon name="filter" size={14} className="text-muted-foreground" />Filters
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   4 · STATES AND SIZES
   ════════════════════════════════════════════════════════════════════════ */
function StatesSizes() {
  const sizes = [['sm', 'h-8 text-[12px]', 'Small'], ['md', 'h-9 text-[13px]', 'Medium'], ['lg', 'h-10 text-[14px]', 'Large']];
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* states */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Email <span className="text-destructive">·</span> error</label>
          <div className="flex items-center rounded-md border border-destructive/70 bg-background px-3 shadow-sm focus-within:ring-2 focus-within:ring-destructive/25 transition-colors">
            <input defaultValue="operator@acme" className="h-9 w-full bg-transparent text-[13px] text-foreground focus:outline-none" aria-invalid="true" />
            <Icon name="alert" size={15} className="text-destructive shrink-0" />
          </div>
          <p className="mt-1.5 text-[12px] text-destructive">Enter a valid work email.</p>
        </div>

        <div>
          <label className={labelCls}>Workspace · ok</label>
          <div className="flex items-center rounded-md border border-primary/50 bg-background px-3 shadow-sm">
            <input defaultValue="prod-eu" className="h-9 w-full bg-transparent text-[13px] text-foreground focus:outline-none" />
            <Icon name="check" size={15} className="text-primary shrink-0" stroke={2.4} />
          </div>
          <p className="mt-1.5 text-[12px] text-muted-foreground">Available in the EU-West region.</p>
        </div>

        <div>
          <label className={labelCls}>Role · disabled</label>
          <input disabled defaultValue="Senior operator"
            className="h-9 w-full cursor-not-allowed rounded-md border border-border bg-secondary/50 px-3 text-[13px] text-muted-foreground shadow-sm focus:outline-none" />
        </div>

        <div>
          <label className={labelCls}>Token · read-only</label>
          <div className="flex items-center rounded-md border border-border bg-secondary/40 px-3 shadow-sm">
            <input readOnly defaultValue="sk-live-9f2c…a71" className="h-9 w-full bg-transparent font-mono text-[12px] text-muted-foreground focus:outline-none" />
            <button className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0"><Icon name="copy" size={14} /></button>
          </div>
        </div>
      </div>

      {/* sizes */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80 mb-3">Sizes · sm · md · lg</div>
        <div className="space-y-3">
          {sizes.map(([k, cls, ph]) => (
            <div key={k} className={"flex items-center rounded-md border border-border bg-background px-3 shadow-sm " + ring}>
              <Icon name="search" size={k === 'lg' ? 16 : 14} className="text-muted-foreground shrink-0" />
              <input placeholder={ph} className={"w-full bg-transparent pl-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none " + cls} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_AFFIX = `// Icon add-on — the brand ring lives on the WRAPPER (focus-within)
<div className="flex items-center rounded-md border border-border bg-background px-3 shadow-sm
                transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25">
  <SearchIcon className="text-muted-foreground shrink-0" />
  <input className="h-9 w-full bg-transparent pl-2.5 text-[13px] text-foreground
                    placeholder:text-muted-foreground focus:outline-none" placeholder="Search services…" />
</div>

// Text prefix / suffix: a text-muted-foreground span beside the transparent input
<span className="text-[13px] text-muted-foreground">example.com/</span>
<input className="bg-transparent ..." defaultValue="prod-eu" />
<span className="text-[13px] text-muted-foreground">req/s</span>`;

const CODE_BTN = `// Attached button — shared border + focus:relative to lift the ring above the button
<div className="flex rounded-md shadow-sm">
  <input className="w-full rounded-l-md border border-border bg-background px-3 h-9 text-[13px]
                    focus:outline-none focus:relative focus:z-10 focus:border-primary/60 focus:ring-2 focus:ring-ring/25" />
  <button className="-ml-px inline-flex items-center gap-1.5 rounded-r-md border border-primary bg-primary
                     px-3.5 h-9 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90">
    <PlusIcon /> Invite
  </button>
</div>`;

const CODE_STATE = `// Error — destructive border + ring + trailing icon + helper
<div className="flex items-center rounded-md border border-destructive/70 bg-background px-3 shadow-sm
                focus-within:ring-2 focus-within:ring-destructive/25">
  <input aria-invalid className="h-9 w-full bg-transparent text-[13px] focus:outline-none" />
  <AlertIcon className="text-destructive" />
</div>
<p className="mt-1.5 text-[12px] text-destructive">Enter a valid email.</p>

// Sizes: only the input height/text changes — sm h-8/12px · md h-9/13px · lg h-10/14px`;

/* ── section ─────────────────────────────────────────────────────────────── */
function InputGroupsSection() {
  return (
    <div>
      <SectionHead kicker="Forms" title="Input groups" status="done"
        intro="The brand field with add-ons: leading icons, text prefixes and suffixes, keyboard hint, attached button or select and the validation states. The brand trick is that the green ring lives on the container (focus-within), so the icon, prefix and input focus as a single piece. Recessed fields (bg-background) on the card, with radii and shadows from the tokens." />

      <Variant title="Icons, prefixes and affixes"
        desc="Leading icon, keyboard hint in a mono pill, domain prefix, unit suffix and a trailing icon button. All inside a single wrapper that takes the ring on focus."
        code={CODE_AFFIX}>
        <Affixes />
      </Variant>

      <Variant title="Inline label and attached select"
        desc="Inset label inside the field and selects attached left or right that share the border — for a cost unit or URL scheme, without breaking the group."
        code={CODE_BTN}>
        <InlineLabel />
      </Variant>

      <Variant title="With attached button"
        desc="Input + button joined in a single row. The email field sends the invitation and the search field has a secondary filters button; focus lifts above the button."
        code={CODE_BTN}>
        <ButtonAttached />
      </Variant>

      <Variant title="States and sizes"
        desc="Error validation (destructive ring + icon + helper), confirmation, disabled and read-only with copy; and the three sizes sm · md · lg on the same group."
        code={CODE_STATE}>
        <StatesSizes />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['input-groups'] = InputGroupsSection;
})();
