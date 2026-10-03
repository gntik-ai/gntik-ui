/* ============================================================================
   Gntik UI · notifications.jsx — toasts ("Overlays" group).
   Ephemeral notifications stacked in a corner, contained in the preview.
   Brand toast (semantic tone + icon + progress bar) with auto-dismiss,
   pause on hover and manual close. Three patterns: the four tones, an
   interactive stack with auto-dismiss, and a toast with an "undo" action. Tokens.
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

/* ── semantic tone (never competes with brand green except on success) ──── */
const TTONE = {
  success:     { fg: 'text-primary',     icon: 'check', bar: 'bg-primary' },
  info:        { fg: 'text-info',        icon: 'info',  bar: 'bg-info' },
  warning:     { fg: 'text-warning',     icon: 'alert', bar: 'bg-warning' },
  destructive: { fg: 'text-destructive', icon: 'alert', bar: 'bg-destructive' },
};

/* ── Toast · rAF progress, pause on hover, animated exit ──────────────────── */
function Toast({ t, onClose, onAction }) {
  const tn = TTONE[t.tone] || TTONE.info;
  const duration = t.duration ?? 5000;
  const [enter, setEnter] = useState(false);
  const [pct, setPct] = useState(100);
  const start = useRef(0), elapsed = useRef(0), raf = useRef(0), paused = useRef(false), fired = useRef(false);

  const close = () => { if (fired.current) return; fired.current = true; onClose(t.id); };

  useEffect(() => { const r = requestAnimationFrame(() => setEnter(true)); return () => cancelAnimationFrame(r); }, []);

  useEffect(() => {
    if (duration === 0 || t.leaving) return;
    const tick = (now) => {
      if (paused.current) { raf.current = requestAnimationFrame(tick); return; }
      if (!start.current) start.current = now;
      const e = elapsed.current + (now - start.current);
      const p = Math.max(0, 100 - (e / duration) * 100);
      setPct(p);
      if (p <= 0) { close(); return; }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [t.leaving]);

  const onEnter = () => { if (duration === 0) return; paused.current = true; if (start.current) { elapsed.current += performance.now() - start.current; start.current = 0; } };
  const onLeave = () => { paused.current = false; };

  return (
    <div onMouseEnter={onEnter} onMouseLeave={onLeave}
      className={"pointer-events-auto w-[320px] overflow-hidden rounded-xl border border-border bg-popover shadow-lg transition-all duration-200 ease-out " +
        (enter && !t.leaving ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-3 opacity-0 scale-[0.97]')}>
      <div className="flex gap-3 p-3.5">
        <span className={"mt-px grid size-7 shrink-0 place-items-center rounded-lg bg-foreground/5 " + tn.fg}><Icon name={tn.icon} size={16} stroke={2} /></span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold tracking-tight text-foreground">{t.title}</div>
          {t.body && <div className="mt-0.5 text-[12.5px] leading-5 text-muted-foreground" style={{ textWrap: 'pretty' }}>{t.body}</div>}
          {t.action && (
            <div className="mt-2">
              <button onClick={() => { onAction && onAction(t); close(); }} className={"text-[12px] font-semibold transition-opacity hover:opacity-70 " + tn.fg}>{t.action}</button>
            </div>
          )}
        </div>
        <button onClick={close} aria-label="Close"
          className="-mr-1 -mt-0.5 grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground">
          <Icon name="x" size={13} stroke={2.4} />
        </button>
      </div>
      {duration !== 0 && <div className="h-0.5 w-full bg-foreground/10"><div className={"h-full transition-none " + tn.bar} style={{ width: pct + '%' }} /></div>}
    </div>
  );
}

/* ── corner stack (contained in the preview with absolute) ───────────────── */
function ToastStack({ toasts, onClose, onAction }) {
  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-50 flex w-[320px] flex-col items-end gap-2.5">
      {toasts.map(t => <Toast key={t.id} t={t} onClose={onClose} onAction={onAction} />)}
    </div>
  );
}

/* hook: capped toast queue, deferred exit */
let SEQ = 1;
function useToaster(max = 4) {
  const [toasts, setToasts] = useState([]);
  const dismiss = (id) => {
    setToasts(ts => ts.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 220);
  };
  const push = (toast) => setToasts(ts => [...ts, { id: SEQ++, ...toast }].slice(-max));
  const clear = () => setToasts(ts => ts.map(t => ({ ...t, leaving: true }))) || setTimeout(() => setToasts([]), 220);
  return { toasts, push, dismiss, clear };
}

/* ── 1 · THE FOUR TONES (static, no auto-dismiss) ───────────────────────── */
function Tones() {
  const init = [
    { id: 's', tone: 'success', title: 'Deploy complete', body: 'checkout-api is serving traffic in eu-west-1.', duration: 0 },
    { id: 'i', tone: 'info', title: 'New runtime version', body: 'All services move to runtime 4.5 tonight.', duration: 0 },
    { id: 'w', tone: 'warning', title: 'Budget at 92%', body: '$9.2k of $10k used this month.', duration: 0 },
    { id: 'd', tone: 'destructive', title: '3 workers not responding', body: 'us-east-1 has been unresponsive for 4 min.', duration: 0 },
  ];
  const [list, setList] = useState(init);
  const remove = (id) => setList(l => l.filter(t => t.id !== id));
  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      {list.map(t => <div key={t.id} className="flex justify-center"><Toast t={t} onClose={remove} /></div>)}
      {list.length === 0 && <button onClick={() => setList(init)} className="col-span-full mx-auto font-mono text-[12px] text-primary hover:underline">restore toasts</button>}
    </div>
  );
}

/* ── 2 · INTERACTIVE STACK with auto-dismiss ──────────────────────────────── */
const SPAWN = [
  { label: 'Deploy', tone: 'success', icon: 'check', payload: { tone: 'success', title: 'Deploy complete', body: 'checkout-api v4.5 is live.' } },
  { label: 'Runtime', tone: 'info', icon: 'info', payload: { tone: 'info', title: 'New version available', body: 'Runtime 4.5 is ready to roll out.' } },
  { label: 'Budget', tone: 'warning', icon: 'alert', payload: { tone: 'warning', title: 'Budget at 92%', body: '$9.2k of $10k this month.' } },
  { label: 'Outage', tone: 'destructive', icon: 'alert', payload: { tone: 'destructive', title: '3 workers not responding', body: 'Check us-east-1.' } },
];
const SPBTN = { success: 'text-primary', info: 'text-info', warning: 'text-warning', destructive: 'text-destructive' };
function StackDemo() {
  const { toasts, push, dismiss, clear } = useToaster(4);
  return (
    <div className="relative h-[440px] rounded-lg overflow-hidden">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="mb-4 text-[12.5px] text-muted-foreground">Fire a toast — it stacks at the bottom right and dismisses itself. Hover over it to pause.</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {SPAWN.map(s => (
            <button key={s.label} onClick={() => push(s.payload)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-[13px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/60">
              <Icon name={s.icon} size={15} className={SPBTN[s.tone]} />{s.label}
            </button>
          ))}
        </div>
        <button onClick={clear} disabled={!toasts.length}
          className="mt-3 font-mono text-[11.5px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40">clear all · {toasts.length}/4</button>
      </div>
      <ToastStack toasts={toasts} onClose={dismiss} />
    </div>
  );
}

/* ── 3 · WITH ACTION (undo) ─────────────────────────────────────────────── */
function UndoDemo() {
  const { toasts, push, dismiss } = useToaster(2);
  const [paused, setPaused] = useState(false);
  const pause = () => {
    setPaused(true);
    push({ tone: 'warning', title: 'Workers paused', body: 'All 24 workers stopped accepting traffic.', action: 'Undo', duration: 7000 });
  };
  return (
    <div className="relative h-[420px] rounded-lg overflow-hidden">
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 text-center">
        <span className={"inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11.5px] " + (paused ? 'border-warning/30 bg-warning/10 text-warning' : 'border-primary/30 bg-primary/10 text-primary')}>
          <span className="size-1.5 rounded-full bg-current" />Workers {paused ? 'paused' : 'active'}
        </span>
        <button onClick={pause} disabled={paused}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-[13px] font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary/60 disabled:opacity-50">
          <Icon name="pause" size={15} />Pause workers
        </button>
        <p className="text-[12px] text-muted-foreground">Click <span className="font-mono text-foreground">Undo</span> in the toast to revert.</p>
      </div>
      <ToastStack toasts={toasts} onClose={dismiss} onAction={() => setPaused(false)} />
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_TOASTER = `// useToaster — capped queue with deferred exit; auto-dismiss lives in each Toast
let SEQ = 1;
function useToaster(max = 4) {
  const [toasts, setToasts] = useState([]);
  const dismiss = (id) => {
    setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 220);  // let the exit animation finish
  };
  const push = (toast) => setToasts((ts) => [...ts, { id: SEQ++, ...toast }].slice(-max));
  return { toasts, push, dismiss };
}

// Stack contained in a corner (in production: fixed bottom-4 right-4)
<div className="pointer-events-none absolute bottom-4 right-4 z-50 flex w-[320px] flex-col items-end gap-2.5">
  {toasts.map((t) => <Toast key={t.id} t={t} onClose={dismiss} />)}
</div>`;

const CODE_TOAST = `// Toast — requestAnimationFrame progress, pause on hover
function Toast({ t, onClose }) {
  const duration = t.duration ?? 5000;
  const [pct, setPct] = useState(100);
  const start = useRef(0), elapsed = useRef(0), raf = useRef(0), paused = useRef(false);

  useEffect(() => {
    if (duration === 0) return;                  // 0 = sticky (no auto-dismiss)
    const tick = (now) => {
      if (paused.current) { raf.current = requestAnimationFrame(tick); return; }
      if (!start.current) start.current = now;
      const e = elapsed.current + (now - start.current);
      const p = Math.max(0, 100 - (e / duration) * 100);
      setPct(p);
      p <= 0 ? onClose(t.id) : (raf.current = requestAnimationFrame(tick));
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const onEnter = () => { paused.current = true; elapsed.current += performance.now() - start.current; start.current = 0; };
  const onLeave = () => { paused.current = false; };
  // … bar: <div style={{ width: pct + "%" }} className={"h-full " + tn.bar} /> …
}`;

/* ── section ─────────────────────────────────────────────────────────────── */
function NotificationsSection() {
  return (
    <div>
      <SectionHead kicker="Overlays" title="Notifications" status="done"
        intro="The ephemeral notice that appears in a corner, reports something that already happened and goes away on its own. A brand Toast with semantic tone, icon and progress bar; they stack up to a cap, pause on hover and can be closed manually or carry an undo action. Here they are contained in the preview; in production, fixed to the corner. The tone only turns green on success — it never competes with the brand." />

      <Variant title="The four tones"
        desc="The anatomy at rest (no auto-dismiss): toned icon, title, body and the ✕ to close. Success in brand green, info, warning and destructive. Close them and the link restores them.">
        <Tones />
      </Variant>

      <Variant title="Stacked with auto-dismiss"
        desc="Fire toasts: they stack at the bottom right up to 4, each with its own progress bar and automatic dismissal. Hover to pause the timer; “clear all” closes them at once."
        code={CODE_TOASTER}>
        <StackDemo />
      </Variant>

      <Variant title="With action (undo)"
        desc="The optimistic pattern: act now and offer to revert while the toast is alive. Pause the workers and click Undo before the toast expires — the state goes back to active."
        code={CODE_TOAST}>
        <UndoDemo />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['notifications'] = NotificationsSection;
})();
