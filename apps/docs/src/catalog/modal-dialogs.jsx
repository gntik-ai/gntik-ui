/* ============================================================================
   Gntik UI · modal-dialogs.jsx — modals ("Overlays" group).
   Scrim + centered panel, contained in the preview (absolute overlay, not fixed).
   Patterns: destructive confirmation, form modal (deploy) and simple
   success notice. Close via scrim, ✕ or Esc; animated enter/exit.
   Neutral fixtures (services, deployments, regions, policies). All tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useEffect, useRef } = window;

const Variant = ({ title, desc, code, children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="preview-surface rounded-lg border border-border p-5 sm:p-6">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── hook: mount + animate enter/exit ────────────────────────────────────── */
function useReveal(open, ms = 200) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let raf1, raf2, t;
    if (open) {
      setMounted(true);
      raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setShown(true)); });
    } else {
      setShown(false);
      t = setTimeout(() => setMounted(false), ms);
    }
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); clearTimeout(t); };
  }, [open]);
  return [mounted, shown];
}

/* ── modal shell: scrim + centered panel, contained (absolute) ──────────── */
const SIZE = { sm: 'max-w-[380px]', md: 'max-w-[460px]', lg: 'max-w-[560px]' };
function Modal({ open, onClose, size = 'md', children, labelledBy }) {
  const [mounted, shown] = useReveal(open);
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!mounted) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center p-5 sm:p-8">
      <div onClick={onClose}
        className={"absolute inset-0 bg-background/75 backdrop-blur-[3px] transition-opacity duration-200 " + (shown ? 'opacity-100' : 'opacity-0')} />
      <div role="dialog" aria-modal="true" aria-labelledby={labelledBy}
        className={"relative mt-6 w-full rounded-xl border border-border bg-popover shadow-lg transition-all duration-200 " + SIZE[size] + ' ' +
          (shown ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-[0.97]')}>
        {children}
      </div>
    </div>
  );
}

/* ── local primitives (fields + buttons, aligned with the kit) ───────────── */
const fieldCls = "block w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/25";
const Input = (p) => <input {...p} className={fieldCls + " h-9 " + (p.className || '')} />;
const Select = ({ children, ...p }) => (
  <div className="relative">
    <select {...p} className={fieldCls + " h-9 appearance-none pr-9 cursor-pointer"}>{children}</select>
    <Icon name="chevron" size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
  </div>
);
const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-[12.5px] font-medium text-foreground">{label}</span>
    {children}
    {hint && <span className="mt-1.5 block text-[11.5px] leading-4 text-muted-foreground" style={{ textWrap: 'pretty' }}>{hint}</span>}
  </label>
);
const BTN = {
  primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
  secondary: 'border border-border bg-card text-foreground hover:bg-secondary/60',
  ghost: 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
  destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
};
const Btn = ({ variant = 'secondary', className = '', children, ...p }) => (
  <button {...p} className={"inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-[13px] font-semibold transition-colors disabled:opacity-50 " + BTN[variant] + ' ' + className}>{children}</button>
);
const Trigger = ({ children, onClick, hint }) => (
  <div className="absolute inset-0 grid place-content-center gap-3 text-center">
    <div><Btn variant="secondary" onClick={onClick}>{children}</Btn></div>
    {hint && <p className="h-4 text-[12px] text-muted-foreground">{hint}</p>}
  </div>
);
const IconClose = ({ onClick }) => (
  <button onClick={onClick} aria-label="Close"
    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground">
    <Icon name="x" size={16} stroke={2.2} />
  </button>
);

/* ── 1 · DESTRUCTIVE CONFIRMATION ─────────────────────────────────────────── */
function ConfirmModal() {
  const [open, setOpen] = useState(false);
  const [eco, setEco] = useState('');
  const remove = () => { setOpen(false); setEco('Service deleted'); setTimeout(() => setEco(''), 2200); };
  return (
    <div className="relative h-[440px] rounded-lg overflow-hidden">
      <Trigger onClick={() => setOpen(true)} hint={eco ? <span className="font-mono text-destructive">{eco}</span> : 'Opens the delete dialog'}>
        <Icon name="trash" size={15} />Delete service
      </Trigger>
      <Modal open={open} onClose={() => setOpen(false)} size="sm" labelledBy="confirm-t">
        <div className="p-5">
          <div className="flex gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-destructive/12 text-destructive"><Icon name="alert" size={20} stroke={2} /></span>
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 id="confirm-t" className="text-[15px] font-semibold tracking-tight text-foreground">Delete “checkout-api”</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
                It will be disconnected and its logs and metrics deleted. This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2.5">
            <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
            <Btn variant="destructive" onClick={remove}><Icon name="trash" size={15} />Delete</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ── 2 · FORM MODAL (deploy) ────────────────────────────────────────────── */
function FormModal() {
  const [open, setOpen] = useState(false);
  const [eco, setEco] = useState('');
  const [name, setName] = useState('support-triage');
  const submit = (e) => { e.preventDefault(); setOpen(false); setEco('Deploying ' + name + '…'); setTimeout(() => setEco(''), 2400); };
  return (
    <div className="relative h-[440px] rounded-lg overflow-hidden">
      <Trigger onClick={() => setOpen(true)} hint={eco ? <span className="font-mono text-primary">{eco}</span> : 'Opens the deploy form'}>
        <Icon name="bot" size={16} />Deploy service
      </Trigger>
      <Modal open={open} onClose={() => setOpen(false)} size="md" labelledBy="form-t">
        <form onSubmit={submit}>
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <h3 id="form-t" className="text-[15px] font-semibold tracking-tight text-foreground">Deploy service</h3>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">Configure and publish a new replica.</p>
            </div>
            <IconClose onClick={() => setOpen(false)} />
          </div>
          <div className="grid grid-cols-2 gap-4 px-5 py-5">
            <div className="col-span-2"><Field label="Service name"><Input value={name} onChange={e => setName(e.target.value)} placeholder="my-service" /></Field></div>
            <Field label="Region"><Select defaultValue="eu-west-1"><option>eu-west-1</option><option>us-east-1</option><option>ap-south-1</option><option>eu-central-1</option></Select></Field>
            <Field label="Runtime"><Select defaultValue="node-24"><option>node-24</option><option>python-3.13</option><option>go-1.24</option></Select></Field>
            <Field label="Cost limit / run" hint="Pauses when exceeded.">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[12.5px] text-muted-foreground">$</span>
                <Input defaultValue="0.40" className="pl-7 font-mono" />
              </div>
            </Field>
            <Field label="Policy"><Select defaultValue="pii-redaction"><option>pii-redaction</option><option>default</option><option>no policy</option></Select></Field>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
            <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground"><Icon name="info" size={13} />Active immediately</span>
            <div className="flex gap-2.5">
              <Btn variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Btn>
              <Btn variant="primary" type="submit"><Icon name="bolt" size={15} />Deploy</Btn>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ── 3 · SIMPLE NOTICE (success, single CTA) ─────────────────────────────── */
function NoticeModal() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative h-[440px] rounded-lg overflow-hidden">
      <Trigger onClick={() => setOpen(true)} hint="Opens the confirmation notice">
        <Icon name="check" size={16} />Show notice
      </Trigger>
      <Modal open={open} onClose={() => setOpen(false)} size="sm" labelledBy="notice-t">
        <div className="p-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/12 text-primary"><Icon name="check" size={24} stroke={2.2} /></span>
          <h3 id="notice-t" className="mt-4 text-[16px] font-semibold tracking-tight text-foreground">Services synced</h3>
          <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
            All 24 services are running version <span className="font-mono text-foreground/90">v4.5</span>. No restarts pending.
          </p>
          <Btn variant="primary" className="mt-5 w-full" onClick={() => setOpen(false)}>Got it</Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ── 4 · CENTERED NOTICE WITH TWO ACTIONS ────────────────────────────────── */
function NoticeDualModal() {
  const [open, setOpen] = useState(false);
  const [eco, setEco] = useState('');
  const apply = () => { setOpen(false); setEco('Rollback applied'); setTimeout(() => setEco(''), 2200); };
  return (
    <div className="relative h-[440px] rounded-lg overflow-hidden">
      <Trigger onClick={() => setOpen(true)} hint={eco ? <span className="font-mono text-primary">{eco}</span> : 'Opens the two-option notice'}>
        <Icon name="bolt" size={15} />Roll back services
      </Trigger>
      <Modal open={open} onClose={() => setOpen(false)} size="sm" labelledBy="dual-t">
        <div className="p-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/12 text-primary"><Icon name="bolt" size={22} stroke={2.2} /></span>
          <h3 id="dual-t" className="mt-4 text-[16px] font-semibold tracking-tight text-foreground">Apply rollback</h3>
          <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
            All 24 services will go back to version <span className="font-mono text-foreground/90">v4.4</span>. The current deployment will be paused.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 px-6 pb-6">
          <Btn variant="secondary" onClick={() => setOpen(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={apply}>Apply</Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ── 5 · CONFIRMATION WITH FOOTER BAR ────────────────────────────────────── */
function ConfirmBarModal() {
  const [open, setOpen] = useState(false);
  const [eco, setEco] = useState('');
  const off = () => { setOpen(false); setEco('Region deactivated'); setTimeout(() => setEco(''), 2200); };
  return (
    <div className="relative h-[440px] rounded-lg overflow-hidden">
      <Trigger onClick={() => setOpen(true)} hint={eco ? <span className="font-mono text-destructive">{eco}</span> : 'Opens the confirmation with an action footer'}>
        <Icon name="alert" size={15} />Deactivate region
      </Trigger>
      <Modal open={open} onClose={() => setOpen(false)} size="md" labelledBy="bar-t">
        <div className="p-5 sm:p-6">
          <div className="flex gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/12 text-destructive"><Icon name="alert" size={20} stroke={2} /></span>
            <div className="min-w-0 flex-1 pt-0.5 text-left">
              <h3 id="bar-t" className="text-[15px] font-semibold tracking-tight text-foreground">Deactivate “eu-west-1”</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
                The 9 services in this region will stop serving and traffic will be rerouted to <span className="font-mono text-foreground/90">eu-central-1</span>. You can reactivate it later.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-row-reverse gap-2.5 border-t border-border bg-secondary/40 px-5 py-4 sm:px-6">
          <Btn variant="destructive" onClick={off}>Deactivate</Btn>
          <Btn variant="secondary" onClick={() => setOpen(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SHELL = `// Modal — scrim + centered panel, close via scrim / ✕ / Esc, animated entry
function Modal({ open, onClose, size = "md", children }) {
  const [mounted, shown] = useReveal(open);          // mount + animate in/out
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!mounted) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-8">
      <div onClick={onClose}
        className={"absolute inset-0 bg-background/75 backdrop-blur-[3px] transition-opacity duration-200 " +
          (shown ? "opacity-100" : "opacity-0")} />
      <div role="dialog" aria-modal="true"
        className={"relative mt-6 w-full max-w-[460px] rounded-xl border border-border bg-popover shadow-lg " +
          "transition-all duration-200 " +
          (shown ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-[0.97]")}>
        {children}
      </div>
    </div>
  );
}`;

const CODE_CONFIRM = `// Destructive confirmation — destructive icon, danger action on the right
<Modal open={open} onClose={close} size="sm">
  <div className="p-5">
    <div className="flex gap-3.5">
      <span className="grid size-10 place-items-center rounded-lg bg-destructive/12 text-destructive"><AlertIcon /></span>
      <div className="flex-1 pt-0.5">
        <h3 className="text-[15px] font-semibold text-foreground">Delete “checkout-api”</h3>
        <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">
          It will be disconnected and its logs deleted. This action cannot be undone.
        </p>
      </div>
    </div>
    <div className="mt-5 flex justify-end gap-2.5">
      <button className="h-9 px-3.5 rounded-lg text-[13px] font-semibold text-muted-foreground hover:bg-secondary/60">Cancel</button>
      <button className="h-9 px-3.5 rounded-lg text-[13px] font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</button>
    </div>
  </div>
</Modal>`;

const CODE_DUAL = `// Centered notice with two actions — primary icon, 50/50 button grid
<Modal open={open} onClose={close} size="sm">
  <div className="p-6 text-center">
    <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/12 text-primary"><BoltIcon /></span>
    <h3 className="mt-4 text-[16px] font-semibold text-foreground">Apply rollback</h3>
    <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">
      All 24 services will go back to version v4.4. The current deployment will be paused.
    </p>
  </div>
  <div className="grid grid-cols-2 gap-2.5 px-6 pb-6">
    <button className="h-9 rounded-lg border border-border bg-card text-[13px] font-semibold text-foreground hover:bg-secondary/60">Cancel</button>
    <button className="h-9 rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground hover:bg-primary/90">Apply</button>
  </div>
</Modal>`;

const CODE_BAR = `// Confirmation with footer bar — icon on the left, tinted row-reverse footer
<Modal open={open} onClose={close} size="md">
  <div className="p-6">
    <div className="flex gap-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/12 text-destructive"><AlertIcon /></span>
      <div className="flex-1 pt-0.5">
        <h3 className="text-[15px] font-semibold text-foreground">Deactivate “eu-west-1”</h3>
        <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">
          The 9 services will stop serving and traffic will be rerouted to eu-central-1.
        </p>
      </div>
    </div>
  </div>
  <div className="flex flex-row-reverse gap-2.5 border-t border-border bg-secondary/40 px-6 py-4">
    <button className="h-9 px-3.5 rounded-lg bg-destructive text-[13px] font-semibold text-destructive-foreground hover:bg-destructive/90">Deactivate</button>
    <button className="h-9 px-3.5 rounded-lg border border-border bg-card text-[13px] font-semibold text-foreground hover:bg-secondary/60">Cancel</button>
  </div>
</Modal>`;

/* ── section ─────────────────────────────────────────────────────────────── */
function ModalDialogsSection() {
  return (
    <div>
      <SectionHead kicker="Overlays" title="Modal dialogs" status="done"
        intro="The dialog that stops everything and asks for a decision: a scrim that dims the background, a centered brand panel and contained focus. A single Modal shell covers every pattern — destructive confirmation, form (deploy) and success notice — and closes on outside click, with the ✕ or with Esc. Animated enter and exit. In the catalog the overlay is absolute (it lives inside the preview); in production you'd use fixed inset-0." />

      <Variant title="Destructive confirmation"
        desc="For irreversible actions: destructive-tone icon, one sentence with the consequence, and the danger action on the right after a neutral Cancel. Confirm and you'll see the echo under the trigger."
        code={CODE_CONFIRM}>
        <ConfirmModal />
      </Variant>

      <Variant title="Form modal"
        desc="The “create / edit” case without leaving the page: header with title and ✕, body with a grid of fields (input, selects, $ prefix) and a footer with the primary action. Enter or the button deploys and closes."
        code={CODE_SHELL}>
        <FormModal />
      </Variant>

      <Variant title="Success notice"
        desc="Minimal, centered version to confirm a result: primary icon, title, one line of detail and a single full-width CTA.">
        <NoticeModal />
      </Variant>

      <Variant title="Notice with two actions"
        desc="Centered decision when two equivalent ways out are needed: primary icon, title, detail and 50/50 buttons. The primary action sits on the right."
        code={CODE_DUAL}>
        <NoticeDualModal />
      </Variant>

      <Variant title="Confirmation with footer bar"
        desc="The panel-with-footer pattern: content with an icon on the left and a tinted action bar at the bottom in reverse order (danger action first). Useful when the body grows."
        code={CODE_BAR}>
        <ConfirmBarModal />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['modal-dialogs'] = ModalDialogsSection;
})();
