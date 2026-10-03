/* ============================================================================
   Gntik UI · textareas.jsx — text areas ("Forms" group).
   The brand textarea in its three uses: simple with counter, composer with a
   toolbar that posts a note to the run, and label-on-the-left for long
   descriptions. Neutral fixtures (runs, services, policies). Tokens, no hardcoding.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef } = window;

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

const taBase =
  "block w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] leading-6 text-foreground " +
  "placeholder:text-muted-foreground shadow-sm transition-colors resize-none " +
  "focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/25";

/* initials avatar (same as in feeds/stacked-lists) */
const Avatar = ({ initials, size = 28 }) => (
  <span className="inline-grid place-items-center rounded-full bg-accent text-accent-foreground font-semibold"
    style={{ width: size, height: size, fontSize: size * 0.4 }}>{initials}</span>
);

/* ── 1 · SIMPLE with counter ─────────────────────────────────────────────── */
function SimpleTA() {
  const MAX = 280;
  const [v, setV] = useState('The checkout service retries 3× before falling back.');
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="flex items-baseline justify-between mb-2">
        <label htmlFor="ta-note" className="block text-[13px] font-medium text-foreground">Run note</label>
        <span className={"font-mono text-[11px] " + (v.length > MAX ? 'text-destructive' : 'text-muted-foreground')}>{v.length}/{MAX}</span>
      </div>
      <textarea id="ta-note" rows={4} value={v} maxLength={MAX + 40} onChange={e => setV(e.target.value)} className={taBase} placeholder="Add context for the next operator…" />
      <p className="mt-2 text-[12px] leading-5 text-muted-foreground" style={{ textWrap: 'pretty' }}>Basic Markdown allowed. The note is kept in the run's audit trail.</p>
    </div>
  );
}

/* ── 2 · COMPOSER with toolbar (posts to the thread) ───────────────────────── */
const TOOLS = [['paperclip', 'Attach'], ['users', 'Mention'], ['code', 'Code'], ['tag', 'Label']];
function ComposerTA() {
  const [text, setText] = useState('');
  const [posts, setPosts] = useState([]);
  const submit = (e) => {
    if (e) e.preventDefault();
    const t = text.trim(); if (!t) return;
    setPosts(p => [{ id: Date.now(), body: t }, ...p].slice(0, 3));
    setText('');
  };
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="flex gap-3">
        <span className="mt-0.5 shrink-0"><Avatar initials="ME" size={32} /></span>
        <form onSubmit={submit} className="flex-auto">
          <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25">
            <textarea rows={3} value={text} onChange={e => setText(e.target.value)} placeholder="Comment on this run…"
              className="block w-full resize-none bg-transparent px-3 py-2.5 text-[13px] leading-6 text-foreground placeholder:text-muted-foreground focus:outline-none" />
            <div className="flex items-center justify-between border-t border-border/70 bg-secondary/30 px-2 py-1.5">
              <div className="flex items-center gap-0.5">
                {TOOLS.map(([ic, lbl]) => (
                  <button key={ic} type="button" title={lbl} aria-label={lbl}
                    className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                    <Icon name={ic} size={15} />
                  </button>
                ))}
              </div>
              <button type="submit" disabled={!text.trim()}
                className="inline-flex h-7 items-center gap-1.5 rounded-md bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed">
                Comment
              </button>
            </div>
          </div>
        </form>
      </div>

      {posts.length > 0 && (
        <ul className="mt-5 space-y-3">
          {posts.map(p => (
            <li key={p.id} className="flex gap-3">
              <span className="mt-0.5 shrink-0"><Avatar initials="ME" size={28} /></span>
              <div className="flex-auto rounded-md border border-border bg-background/50 p-3">
                <div className="text-[12px] text-muted-foreground"><span className="font-semibold text-foreground">You</span> commented · <span className="font-mono text-[11px]">now</span></div>
                <p className="mt-1 text-[13px] leading-relaxed text-foreground/85" style={{ textWrap: 'pretty' }}>{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── 3 · LABEL ON THE LEFT + auto-grow ──────────────────────────────────── */
function LabeledTA() {
  const ref = useRef(null);
  const [v, setV] = useState('Tier-1 support assistant. Answers billing tickets and escalates to a human when it detects cancellation intent. Languages: EN, ES.');
  const grow = (e) => {
    setV(e.target.value);
    const el = ref.current; if (!el) return; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px';
  };
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="grid grid-cols-1 gap-x-10 gap-y-3 md:grid-cols-3">
        <div>
          <label htmlFor="ta-desc" className="block text-[13px] font-semibold text-foreground">Instructions</label>
          <p className="mt-1 text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>The system prompt that defines the behavior. Grows with the content.</p>
        </div>
        <div className="md:col-span-2">
          <textarea id="ta-desc" ref={ref} value={v} onInput={grow}
            className={taBase + " min-h-[88px] overflow-hidden"} placeholder="Describe what this does…" />
          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <Icon name="info" size={13} className="shrink-0" />
            Versioned on every save; you can revert from the history.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_SIMPLE = `const MAX = 280;
const [v, setV] = useState('');

<div className="flex items-baseline justify-between mb-2">
  <label className="text-[13px] font-medium text-foreground">Run note</label>
  <span className={\`font-mono text-[11px] \${v.length > MAX ? 'text-destructive' : 'text-muted-foreground'}\`}>{v.length}/{MAX}</span>
</div>
<textarea rows={4} value={v} onChange={(e) => setV(e.target.value)}
  className="block w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] leading-6 resize-none
             shadow-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/25" />`;

const CODE_COMPOSER = `// Toolbar inside the border — the ring lives on the wrapper (focus-within)
<div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm
                focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25">
  <textarea rows={3} className="block w-full resize-none bg-transparent px-3 py-2.5 text-[13px] focus:outline-none" />
  <div className="flex items-center justify-between border-t border-border/70 bg-secondary/30 px-2 py-1.5">
    <div className="flex gap-0.5">
      {tools.map((t) => <button key={t} className="grid h-7 w-7 place-items-center rounded-md
        text-muted-foreground hover:bg-secondary hover:text-foreground"><Icon name={t} /></button>)}
    </div>
    <button disabled={!text.trim()} className="h-7 rounded-md bg-primary px-3 text-[12.5px] font-semibold
      text-primary-foreground disabled:opacity-40">Comment</button>
  </div>
</div>`;

const CODE_GROW = `// Auto-grow: reset height and set it to scrollHeight on every input
const ref = useRef(null);
const grow = (e) => {
  setV(e.target.value);
  const el = ref.current; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px';
};
<textarea ref={ref} value={v} onInput={grow}
  className="... resize-none min-h-[88px] overflow-hidden" />`;

/* ── section ─────────────────────────────────────────────────────────────── */
function TextareasSection() {
  return (
    <div>
      <SectionHead kicker="Forms" title="Textareas" status="done"
        intro="The brand textarea in its three roles: a simple note with a character counter, a composer with a toolbar that posts to the run thread, and an instructions field with the label on the left that grows with its content. Recessed on the card, green ring on focus and the toolbar built into the border." />

      <Variant title="Simple with counter"
        desc="Label + right-aligned counter that turns red past the limit, and a help note below. The default case."
        code={CODE_SIMPLE}>
        <SimpleTA />
      </Variant>

      <Variant title="Composer with toolbar"
        desc="Action toolbar (attach, mention, code, label) and submit button built into the border; the brand ring wraps the whole piece. Type and comment: the note is added to the thread."
        code={CODE_COMPOSER}>
        <ComposerTA />
      </Variant>

      <Variant title="Label on the left + auto-grow"
        desc="The settings layout: description on the left, field on the right. The instructions textarea grows as you type and is versioned on every save."
        code={CODE_GROW}>
        <LabeledTA />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['textareas'] = TextareasSection;
})();
