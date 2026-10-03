/* ============================================================================
   Gntik UI · feeds.jsx — activity timelines ("Lists" group).
   A feed tells what happened to a resource over time: a job lifecycle,
   an incident thread, a service log. Patterns:
   timeline with icons · stream with comments + composer · mixed feed
   (comments · assignments · tags) · status timeline · checklists · tabbed panel. Tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef, useClickOutside } = window;

/* ── timeline nodes (OPAQUE tiles, so the line does not show through) ────── */
const NODE = {
  muted:   'bg-secondary text-muted-foreground',
  accent:  'bg-accent text-accent-foreground',
  primary: 'bg-primary text-primary-foreground',
};
/* ── semantic tints (pills/tiles on a card surface) ──────────────────────── */
const TINT = {
  primary:     'bg-primary/15 text-primary',
  info:        'bg-info/15 text-info',
  warning:     'bg-warning/16 text-warning',
  destructive: 'bg-destructive/15 text-destructive',
  muted:       'bg-muted text-muted-foreground',
};

/* ── initials avatar (brand-tinted, same as in stacked-lists) ────────────── */
const Avatar = ({ initials, size = 24 }) => (
  <span className="rounded-full bg-primary/14 text-primary font-mono font-semibold inline-flex items-center justify-center shrink-0"
    style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}>{initials}</span>
);

/* ── variant wrapper (card, roomy padding so the thread breathes) ─────────── */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card p-6 sm:p-7">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── composer marks catalog (status, not severity-as-brand) ──────────────── */
const MARKS = [
  { v: 'investigating', name: 'Investigating', icon: 'eye',    tone: 'info' },
  { v: 'mitigated',     name: 'Mitigated',     icon: 'shield', tone: 'primary' },
  { v: 'blocked',       name: 'Blocked',       icon: 'alert',  tone: 'destructive' },
  { v: 'on-hold',       name: 'On hold',       icon: 'clock',  tone: 'muted' },
  { v: 'resolved',      name: 'Resolved',      icon: 'check',  tone: 'primary' },
];
const markOf = (v) => MARKS.find((m) => m.v === v) || MARKS[0];

/* ── data ────────────────────────────────────────────────────────────────── */
// 1 · job lifecycle (neutral → green progression)
const LIFECYCLE = [
  { tone: 'muted',   icon: 'inbox',  content: 'Queued from',     target: 'webhook · POST /ingest', at: '10:32:01' },
  { tone: 'muted',   icon: 'net',    content: 'Scheduled on',    target: 'worker eu-west-1 · w-7', at: '10:32:01' },
  { tone: 'accent',  icon: 'shield', content: 'Approved by',     target: 'policy · cost-guard',    at: '10:32:02' },
  { tone: 'accent',  icon: 'bolt',   content: 'Called upstream', target: 'payments-api',        at: '10:32:02' },
  { tone: 'primary', icon: 'check',  content: 'Job completed',   target: '18.2 MB · $0.21',      at: '10:32:09' },
];

// 2 · incident stream (events = dot on the line · comment = card)
const STREAM = [
  { type: 'event',   who: 'Dana Ruiz',   init: 'DR', verb: 'opened the incident', when: '7d' },
  { type: 'event',   who: 'Marco Vidal', init: 'MV', verb: 'escalated to on-call', when: '6d' },
  { type: 'comment', who: 'Lena Ortiz',  init: 'LO', when: '3d',
    body: 'Confirmed the latency spike in eu-west-1 — cost-guard cut off two services. Halving concurrency and watching for 10 min.' },
  { type: 'event',   who: 'Sam Cho',     init: 'SC', verb: 'reviewed the runbook', when: '2d' },
  { type: 'done',    who: 'Marco Vidal', init: 'MV', verb: 'resolved the incident', when: '1d' },
];

// 3 · mixed feed (comment · assignment · tags)
const MIXED = [
  { id: 1, type: 'comment', who: 'Eduardo Benz', init: 'EB', when: '6d',
    body: 'The support-triage service returned 5xx during the spike. It retried three times before falling back — attaching the request trace.' },
  { id: 2, type: 'assignment', who: 'Hilary Mahy', init: 'HM', assigned: 'Kristin Watson', when: '2d' },
  { id: 3, type: 'tags', who: 'Hilary Mahy', init: 'HM', when: '6h',
    tags: [
      { name: 'Latency',   dot: 'fill-category-rose' },
      { name: 'eu-west-1', dot: 'fill-category-cyan' },
      { name: 'Cost',      dot: 'fill-category-amber' },
    ] },
  { id: 4, type: 'comment', who: 'Jason Meyers', init: 'JM', when: '2h',
    body: 'Raised the upstream timeout to 8s and enabled the circuit breaker. No 5xx in the last hour — closing if it holds.' },
];

/* ── interactive variant 2: stream + composer that posts to the thread ───── */
function ActivityFeed() {
  const [items, setItems] = useState(STREAM);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [mark, setMark] = useState(null);
  const pickRef = useRef(null);
  useClickOutside(pickRef, () => setOpen(false), open);

  const submit = (e) => {
    if (e) e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setItems((xs) => [...xs, { type: 'comment', who: 'You', init: 'YO', when: 'now', body: t, mark }]);
    setText(''); setMark(null); setOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <ul role="list" className="space-y-6">
        {items.map((it, i) => (
          <li key={i} className="relative flex gap-3">
            {/* connector line */}
            <div className={"absolute left-0 top-0 flex w-6 justify-center " + (i === items.length - 1 ? 'h-6' : '-bottom-6')}>
              <span className="w-px bg-border" />
            </div>

            {it.type === 'comment' ? (
              <>
                <span className="relative z-10 mt-1.5"><Avatar initials={it.init} size={24} /></span>
                <div className="flex-auto rounded-md border border-border bg-background/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[12px] text-muted-foreground">
                      <span className="font-semibold text-foreground">{it.who}</span> commented
                      {it.mark && (
                        <span className={"ml-2 inline-flex items-center gap-1 h-[18px] px-1.5 rounded font-mono text-[10px] font-semibold align-middle " + TINT[markOf(it.mark).tone]}>
                          <Icon name={markOf(it.mark).icon} size={11} />{markOf(it.mark).name}
                        </span>
                      )}
                    </div>
                    <time className="shrink-0 font-mono text-[11px] text-muted-foreground">{it.when}</time>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-foreground/80" style={{ textWrap: 'pretty' }}>{it.body}</p>
                </div>
              </>
            ) : (
              <>
                <div className="relative z-10 flex size-6 flex-none items-center justify-center bg-card">
                  {it.type === 'done'
                    ? <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary"><Icon name="check" size={13} /></span>
                    : <span className="size-1.5 rounded-full bg-muted-foreground/40 ring-2 ring-border" />}
                </div>
                <p className="flex-auto py-0.5 text-[12px] text-muted-foreground">
                  <span className="font-semibold text-foreground">{it.who}</span> {it.verb}.
                </p>
                <time className="flex-none py-0.5 font-mono text-[11px] text-muted-foreground">{it.when}</time>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* composer */}
      <div className="mt-6 flex gap-3">
        <span className="mt-0.5"><Avatar initials="YO" size={24} /></span>
        <form onSubmit={submit} className="relative flex-auto">
          <div className="rounded-lg border border-border bg-background/50 transition-colors focus-within:border-primary/50">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              placeholder="Add a comment…"
              className="block w-full resize-none bg-transparent px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
            <div className="flex items-center justify-between gap-2 border-t border-border/60 px-2 py-2">
              <div ref={pickRef} className="flex items-center gap-0.5">
                <button type="button" aria-label="Attach file"
                  className="size-8 inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/50">
                  <Icon name="paperclip" size={16} />
                </button>
                <div className="relative">
                  <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Mark status"
                    className="size-8 inline-flex items-center justify-center rounded-md transition-colors hover:bg-accent/50">
                    {mark
                      ? <span className={"size-6 inline-flex items-center justify-center rounded-md " + TINT[markOf(mark).tone]}><Icon name={markOf(mark).icon} size={14} /></span>
                      : <span className="text-muted-foreground"><Icon name="spark" size={16} /></span>}
                  </button>
                  {open && (
                    <div className="absolute bottom-10 left-0 z-20 w-52 rounded-lg border border-border bg-popover py-1.5 shadow-md">
                      {MARKS.map((m) => (
                        <button key={m.v} type="button" onClick={() => { setMark(m.v); setOpen(false); }}
                          className="flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left transition-colors hover:bg-accent/50">
                          <span className={"size-7 inline-flex items-center justify-center rounded-md " + TINT[m.tone]}><Icon name={m.icon} size={14} /></span>
                          <span className="text-[12.5px] text-foreground">{m.name}</span>
                          {mark === m.v && <Icon name="check" size={14} className="ml-auto text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button type="submit" disabled={!text.trim()}
                className="h-8 px-3.5 rounded-md bg-primary text-primary-foreground text-[12.5px] font-semibold transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed">
                Comment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_TIMELINE = `// Timeline with icons — opaque node on the line + action/object + time
<ul role="list" className="-mb-6">
  {events.map((e, i) => (
    <li key={i}>
      <div className="relative pb-6">
        {i !== events.length - 1 && (
          <span aria-hidden className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" />
        )}
        <div className="relative flex gap-3">
          <span className={\`flex size-8 items-center justify-center rounded-full ring-8 ring-card \${NODE[e.tone]}\`}>
            <Icon name={e.icon} size={16} />
          </span>
          <div className="flex min-w-0 flex-1 justify-between gap-4 pt-1.5">
            <p className="text-[13px] text-muted-foreground">
              {e.content} <span className="font-semibold text-foreground">{e.target}</span>
            </p>
            <time className="shrink-0 font-mono text-[11px] text-muted-foreground">{e.at}</time>
          </div>
        </div>
      </div>
    </li>
  ))}
</ul>
// NODE = { muted:'bg-secondary text-muted-foreground', accent:'bg-accent text-accent-foreground', primary:'bg-primary text-primary-foreground' }`;

const CODE_ACTIVITY = `// Stream with comments — event = dot on the line, comment = card
<ul role="list" className="space-y-6">
  {items.map((it, i) => (
    <li key={i} className="relative flex gap-3">
      <div className={\`absolute left-0 top-0 flex w-6 justify-center \${i === items.length - 1 ? 'h-6' : '-bottom-6'}\`}>
        <span className="w-px bg-border" />
      </div>
      {it.type === 'comment' ? (
        <>
          <span className="relative z-10 mt-1.5"><Avatar initials={it.init} /></span>
          <div className="flex-auto rounded-md border border-border bg-background/50 p-3">
            <div className="flex justify-between gap-3 text-[12px] text-muted-foreground">
              <span><b className="text-foreground">{it.who}</b> commented</span>
              <time>{it.when}</time>
            </div>
            <p className="mt-1 text-[13px] text-foreground/80">{it.body}</p>
          </div>
        </>
      ) : (
        <>
          <div className="relative z-10 flex size-6 items-center justify-center bg-card">
            {it.type === 'done'
              ? <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary"><CheckIcon /></span>
              : <span className="size-1.5 rounded-full bg-muted-foreground/40 ring-2 ring-border" />}
          </div>
          <p className="flex-auto py-0.5 text-[12px] text-muted-foreground">
            <b className="text-foreground">{it.who}</b> {it.verb}.
          </p>
          <time className="py-0.5 font-mono text-[11px] text-muted-foreground">{it.when}</time>
        </>
      )}
    </li>
  ))}
</ul>
// + composer: textarea + attach + status picker (Listbox) + "Comment"`;

const CODE_MIXED = `// Mixed feed — comment (avatar + badge), assignment and tags
<ul role="list" className="-mb-8">
  {feed.map((it, i) => (
    <li key={it.id}>
      <div className="relative pb-8">
        {i !== feed.length - 1 && (
          <span aria-hidden className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-border" />
        )}
        <div className="relative flex items-start gap-3">
          {it.type === 'comment' && (
            <>
              <span className="relative">
                <Avatar initials={it.init} size={40} />
                <span className="absolute -right-1 -bottom-0.5 rounded-tl bg-card px-0.5 py-px">
                  <Icon name="chat" size={15} className="text-muted-foreground" />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <b className="text-[13px] text-foreground">{it.who}</b>
                <p className="mt-0.5 text-[12px] text-muted-foreground">Commented {it.when}</p>
                <p className="mt-2 text-[13px] text-foreground/80">{it.body}</p>
              </div>
            </>
          )}
          {it.type === 'assignment' && (
            <>
              <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground ring-8 ring-card">
                <Icon name="user" size={16} />
              </span>
              <p className="min-w-0 flex-1 pt-1.5 text-[13px] text-muted-foreground">
                <b className="text-foreground">{it.who}</b> assigned <b className="text-foreground">{it.assigned}</b>
                <span className="ml-1 whitespace-nowrap">· {it.when}</span>
              </p>
            </>
          )}
          {it.type === 'tags' && (
            <>
              <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground ring-8 ring-card">
                <Icon name="tag" size={16} />
              </span>
              <p className="min-w-0 flex-1 pt-1 text-[13px] text-muted-foreground">
                <b className="text-foreground">{it.who}</b> added tags{' '}
                {it.tags.map((t) => (
                  <span key={t.name} className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-foreground">
                    <svg viewBox="0 0 6 6" className={\`size-1.5 \${t.dot}\`}><circle cx="3" cy="3" r="3" /></svg>{t.name}
                  </span>
                ))}{' '}
                <span className="whitespace-nowrap">· {it.when}</span>
              </p>
            </>
          )}
        </div>
      </div>
    </li>
  ))}
</ul>`;

/* ════════════════════════════════════════════════════════════════════════
   Family 2 · SETUP STEPS — what is left to do (workspace onboarding)
   ════════════════════════════════════════════════════════════════════════ */

// 4-7 · workspace status timeline (done · in progress · to do)
const TIMELINE_STEPS = [
  { id: 1, type: 'done',     title: 'Workspace created',          desc: 'You created your first workspace in private mode.',     time: '3d ago' },
  { id: 2, type: 'done',     title: 'Database connected',         desc: 'Connected to Postgres · prod (read-only).',             time: '2d ago' },
  { id: 3, type: 'done',     title: 'Cost policy active',         desc: 'cost-guard capped at $500/day per namespace.',          time: '31 min ago' },
  { id: 4, type: 'progress', title: 'Security audit',             desc: 'Reviewing policies and unauthorised access.',           time: 'Running…' },
  { id: 5, type: 'open',     title: 'Invite your team',           desc: 'Add teammates to the workspace and assign them a role.', time: 'Up next' },
];
// 5 · checklist with a CTA on the active step
const SETUP = [
  { type: 'done',     title: 'Create your workspace',      desc: 'You created your first workspace in private mode. Edit it any time.' },
  { type: 'progress', title: 'Connect a data source',      desc: 'Link your database to the workspace with any of the 20+ connectors.', cta: 'Connect database', icon: 'database' },
  { type: 'open',     title: 'Deploy your first service',  desc: 'Launch it from a template or from your own configuration.' },
];
// 6 · numbered checklist with progress bar
const GETTING = [
  { id: '1.', status: 'complete', title: 'Set up your organisation',   desc: 'You created your account. You can edit the details any time.' },
  { id: '2.', status: 'open',     title: 'Connect a data source',      desc: 'The platform supports more than 50 databases and warehouses.' },
  { id: '3.', status: 'open',     title: 'Define your metrics',        desc: 'Create them with your own SQL or the visual query editor.' },
  { id: '4.', status: 'open',     title: 'Create a report',            desc: 'Turn the metrics into visualisations and arrange them.' },
];
const DETAILS = [
  { name: 'Name',          value: 'prod_workspace' },
  { name: 'Storage',       value: '0.25 / 10 GB' },
  { name: 'Billing cycle', value: '1st of the month' },
];

/* ── status timeline node (bg-card masks the line) ───────────────────────── */
const StepNode = ({ type }) => (
  <div className="relative z-10 flex size-6 flex-none items-center justify-center bg-card">
    {type === 'done'
      ? <Icon name="check" size={18} className="text-primary" />
      : type === 'progress'
        ? <span className="size-2.5 rounded-full bg-primary ring-4 ring-card" />
        : <span className="size-3 rounded-full border border-muted-foreground/40 bg-card ring-4 ring-card" />}
  </div>
);

/* ── checklist circle (done filled · active green ring · to-do subtle) ───── */
const CheckCircle = ({ type }) => (
  type === 'done'
    ? <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon name="check" size={15} /></span>
    : type === 'progress'
      ? <span className="size-6 shrink-0 rounded-full border-2 border-primary" />
      : <span className="size-6 shrink-0 rounded-full border-2 border-muted-foreground/30" />
);

/* ── progress bar (track secondary · fill primary) ───────────────────────── */
const ProgressBar = ({ value }) => (
  <div className="h-2 w-32 rounded-full bg-secondary overflow-hidden">
    <div className="h-full rounded-full bg-primary" style={{ width: value + '%' }} />
  </div>
);

/* ── the status timeline, reused by the bare and tabbed variants ─────────── */
const StatusTimeline = () => (
  <ul role="list" className="space-y-6">
    {TIMELINE_STEPS.map((s, i) => (
      <li key={s.id} className="relative flex gap-x-3">
        <div className={"absolute left-0 top-0 flex w-6 justify-center " + (i === TIMELINE_STEPS.length - 1 ? 'h-6' : '-bottom-6')}>
          <span className="w-px bg-border" />
        </div>
        <div className="flex items-start gap-2.5">
          <StepNode type={s.type} />
          <div>
            <p className="text-[13px] font-medium text-foreground">
              {s.title} <span className="font-normal text-muted-foreground/70">· {s.time}</span>
            </p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground" style={{ textWrap: 'pretty' }}>{s.desc}</p>
          </div>
        </div>
      </li>
    ))}
  </ul>
);

/* ── tabbed panel (Updates / Details) ────────────────────────────────────── */
function SetupTabs() {
  const [tab, setTab] = useState(0);
  const TABS = ['Updates', 'Details'];
  return (
    <div>
      <h3 className="font-sans font-semibold text-[14px] text-foreground">Workspace setup</h3>
      <div className="mt-4 flex gap-1 rounded-lg bg-secondary p-1">
        {TABS.map((t, k) => (
          <button key={t} onClick={() => setTab(k)}
            className={"flex-1 h-8 rounded-md text-[12.5px] font-medium transition-colors " + (tab === k ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 ? (
        <div className="mt-6">
          <StatusTimeline />
          <button type="button"
            className="mt-6 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold transition-colors hover:bg-primary/90">
            <Icon name="bell" size={16} />Notify me when done
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <h4 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">General</h4>
          <ul className="mt-2 rounded-md bg-secondary divide-y divide-border/70">
            {DETAILS.map((d) => (
              <li key={d.name} className="flex items-center justify-between h-12 px-4">
                <span className="text-[13px] text-muted-foreground">{d.name}</span>
                <span className="text-[13px] font-medium text-foreground">{d.value}</span>
              </li>
            ))}
          </ul>
          <h4 className="mt-6 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Privacy</h4>
          <ul className="mt-2 rounded-md bg-secondary divide-y divide-border/70">
            <li className="flex items-center justify-between h-12 px-4">
              <span className="text-[13px] text-muted-foreground">Users</span>
              <div className="flex -space-x-1.5">
                {['DR', 'MV', 'LO'].map((a) => (
                  <span key={a} className="inline-flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary font-mono text-[9px] font-semibold ring-2 ring-secondary">{a}</span>
                ))}
              </div>
            </li>
            <li className="flex items-center justify-between h-12 px-4">
              <span className="text-[13px] text-muted-foreground">Access</span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-card px-2 py-1 text-[11px] font-medium text-foreground ring-1 ring-border">
                <Icon name="lock" size={13} className="text-muted-foreground" />Private
              </span>
            </li>
          </ul>
          <a href="#" onClick={(e) => e.preventDefault()}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card text-[13px] font-medium text-foreground transition-colors hover:bg-accent/40">
            <Icon name="sliders" size={16} />Go to workspace settings
          </a>
        </div>
      )}
    </div>
  );
}

const CODE_TIMELINE_STATUS = `// Status timeline — done = check, in progress = ringed dot, to do = hollow ring
<ul role="list" className="space-y-6">
  {steps.map((s, i) => (
    <li key={s.id} className="relative flex gap-x-3">
      <div className={\`absolute left-0 top-0 flex w-6 justify-center \${i === steps.length - 1 ? 'h-6' : '-bottom-6'}\`}>
        <span className="w-px bg-border" />
      </div>
      <div className="flex items-start gap-2.5">
        <div className="relative z-10 flex size-6 items-center justify-center bg-card">
          {s.type === 'done'
            ? <Icon name="check" className="text-primary" />
            : s.type === 'progress'
              ? <span className="size-2.5 rounded-full bg-primary ring-4 ring-card" />
              : <span className="size-3 rounded-full border border-muted-foreground/40 bg-card ring-4 ring-card" />}
        </div>
        <div>
          <p className="text-[13px] font-medium text-foreground">
            {s.title} <span className="font-normal text-muted-foreground/70">· {s.time}</span>
          </p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{s.desc}</p>
        </div>
      </div>
    </li>
  ))}
</ul>`;

const CODE_CHECKLIST = `// Checklist — done (link + filled check), in progress (card with CTA), to do (dimmed)
<ul role="list" className="space-y-3">
  {steps.map((s, i) =>
    s.type === 'progress' ? (
      <li key={i} className="rounded-lg bg-secondary p-4">
        <div className="flex items-start gap-3">
          <span className="size-6 shrink-0 rounded-full border-2 border-primary" />
          <div>
            <p className="text-[13.5px] font-medium text-foreground">{s.title}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{s.desc}</p>
            <button className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground hover:bg-primary/90">
              <Icon name={s.icon} size={15} />{s.cta}
            </button>
          </div>
        </div>
      </li>
    ) : (
      <li key={i} className="relative rounded-lg p-4 hover:bg-accent/30">
        <a href={s.href} className="absolute inset-0" aria-hidden />
        <div className="flex items-start gap-3">
          {s.type === 'done'
            ? <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon name="check" size={15} /></span>
            : <span className="size-6 rounded-full border-2 border-muted-foreground/30" />}
          <div className={s.type === 'open' ? 'opacity-60' : ''}>
            <p className="text-[13.5px] font-medium text-foreground">{s.title}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{s.desc}</p>
          </div>
        </div>
      </li>
    )
  )}
</ul>`;

const CODE_PROGRESS = `// Checklist with progress — counter + bar on top, numbered steps in cards
<div className="flex items-center justify-end gap-3">
  <span className="text-[12.5px] text-muted-foreground">Step 1/{steps.length}</span>
  <div className="h-2 w-32 rounded-full bg-secondary">
    <div className="h-full rounded-full bg-primary" style={{ width: '25%' }} />
  </div>
</div>
<ul role="list" className="mt-4 space-y-3">
  {steps.map((s) => (
    <li key={s.id} className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        {s.status === 'complete'
          ? <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon name="check" size={15} /></span>
          : <span className="flex size-6 items-center justify-center font-mono text-[13px] text-muted-foreground">{s.id}</span>}
        <div>
          <p className="text-[13.5px] font-medium text-foreground">{s.title}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{s.desc}</p>
        </div>
      </div>
    </li>
  ))}
</ul>`;

const CODE_TABS = `// Tabbed panel — Updates (timeline + CTA) / Details (lists + access)
<TabGroup>
  <TabList variant="solid">
    <Tab>Updates</Tab>
    <Tab>Details</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>{/* <StatusTimeline /> + "Notify me when done" button */}</TabPanel>
    <TabPanel>{/* General + Privacy lists (avatars + Private badge) */}</TabPanel>
  </TabPanels>
</TabGroup>
// sober segmented control: bg-secondary p-1 · active = bg-card shadow-sm`;

function FeedsSection() {
  return (
    <div>
      <SectionHead kicker="Lists" title="Feeds" status="done"
        intro="A feed tells what happens to a resource over time — and what is left to do. Two families in one section: activity timelines (a job lifecycle, an incident thread, a mixed feed) and setup steps (status timeline, checklists and a tabbed panel) for workspace onboarding. The same sober vocabulary: nodes on a thin line, brand green for what is complete and semantic tones for status." />

      {/* 1 · Timeline with icons */}
      <Variant title="Timeline with icons"
        desc="A job lifecycle in order: each step is a node on the line, with the action and its object on the left and the timestamp on the right. The tone moves from neutral to green as the job progresses to completion."
        code={CODE_TIMELINE}>
        <div className="mx-auto w-full max-w-[520px]">
          <ul role="list" className="-mb-6">
            {LIFECYCLE.map((e, i) => (
              <li key={i}>
                <div className="relative pb-6">
                  {i !== LIFECYCLE.length - 1 && (
                    <span aria-hidden="true" className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" />
                  )}
                  <div className="relative flex gap-3">
                    <span className={"flex size-8 items-center justify-center rounded-full ring-8 ring-card shrink-0 " + NODE[e.tone]}>
                      <Icon name={e.icon} size={16} />
                    </span>
                    <div className="flex min-w-0 flex-1 justify-between gap-4 pt-1.5">
                      <p className="text-[13px] text-muted-foreground">
                        {e.content} <span className="font-semibold text-foreground">{e.target}</span>
                      </p>
                      <time className="shrink-0 font-mono text-[11px] text-muted-foreground pt-px">{e.at}</time>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Variant>

      {/* 2 · Stream with comments + composer */}
      <Variant title="Stream with comments"
        desc="Minor events land as a dot on the line; comments open in a card. Below, a working composer: type, attach, mark the status in the popover and post — the comment is added to the thread with its mark."
        code={CODE_ACTIVITY}>
        <ActivityFeed />
      </Variant>

      {/* 3 · Mixed feed */}
      <Variant title="Mixed feed"
        desc="A single thread interleaving types: comments with avatar and badge, assignments and tag additions. Each type brings its own node but shares the same line — the tag colour dots use the categorical accents."
        code={CODE_MIXED}>
        <div className="mx-auto w-full max-w-[560px]">
          <ul role="list" className="-mb-8">
            {MIXED.map((it, i) => (
              <li key={it.id}>
                <div className="relative pb-8">
                  {i !== MIXED.length - 1 && (
                    <span aria-hidden="true" className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-border" />
                  )}
                  <div className="relative flex items-start gap-3">
                    {it.type === 'comment' && (
                      <>
                        <span className="relative shrink-0">
                          <Avatar initials={it.init} size={40} />
                          <span className="absolute -right-1 -bottom-0.5 rounded-tl bg-card px-0.5 py-px">
                            <Icon name="chat" size={15} className="text-muted-foreground" />
                          </span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="text-[13px] font-semibold text-foreground">{it.who}</span>
                          <p className="mt-0.5 text-[12px] text-muted-foreground">Commented {it.when}</p>
                          <p className="mt-2 text-[13px] leading-relaxed text-foreground/80" style={{ textWrap: 'pretty' }}>{it.body}</p>
                        </div>
                      </>
                    )}
                    {it.type === 'assignment' && (
                      <>
                        <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground ring-8 ring-card shrink-0">
                          <Icon name="user" size={16} />
                        </span>
                        <p className="min-w-0 flex-1 pt-1.5 text-[13px] text-muted-foreground">
                          <span className="font-semibold text-foreground">{it.who}</span> assigned <span className="font-semibold text-foreground">{it.assigned}</span>
                          <span className="ml-1 whitespace-nowrap">· {it.when}</span>
                        </p>
                      </>
                    )}
                    {it.type === 'tags' && (
                      <>
                        <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground ring-8 ring-card shrink-0">
                          <Icon name="tag" size={16} />
                        </span>
                        <p className="min-w-0 flex-1 pt-1 text-[13px] leading-7 text-muted-foreground">
                          <span className="font-semibold text-foreground">{it.who}</span> added tags{' '}
                          {it.tags.map((t) => (
                            <span key={t.name} className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-foreground align-middle">
                              <svg viewBox="0 0 6 6" aria-hidden="true" className={"size-1.5 " + t.dot}><circle cx="3" cy="3" r="3" /></svg>{t.name}
                            </span>
                          ))}{' '}
                          <span className="whitespace-nowrap">· {it.when}</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Variant>

      {/* 4 · Status timeline */}
      <Variant title="Status timeline"
        desc="Setup progress as a vertical timeline: completed steps get a green check, the step in progress is a ringed dot and pending ones stay as a hollow ring. Each step carries its relative time."
        code={CODE_TIMELINE_STATUS}>
        <div className="mx-auto w-full max-w-[460px]">
          <StatusTimeline />
        </div>
      </Variant>

      {/* 5 · Step checklist */}
      <Variant title="Step checklist"
        desc="Onboarding as a checklist: completed steps are sober links with a filled check, the active step is highlighted in a card with its call to action and pending ones are dimmed. To guide the first setup."
        code={CODE_CHECKLIST}>
        <div className="mx-auto w-full max-w-[460px]">
          <ul role="list" className="space-y-3">
            {SETUP.map((s, i) => (
              s.type === 'progress' ? (
                <li key={i} className="rounded-lg bg-secondary p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle type="progress" />
                    <div>
                      <p className="text-[13.5px] font-medium text-foreground">{s.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
                      <button type="button" className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                        <Icon name={s.icon} size={15} />{s.cta}
                      </button>
                    </div>
                  </div>
                </li>
              ) : (
                <li key={i} className="relative rounded-lg p-4 transition-colors hover:bg-accent/30">
                  <a href="#" onClick={(e) => e.preventDefault()} className="absolute inset-0 rounded-lg" aria-hidden="true" />
                  <div className="flex items-start gap-3">
                    <CheckCircle type={s.type} />
                    <div className={s.type === 'open' ? 'opacity-60' : ''}>
                      <p className="text-[13.5px] font-medium text-foreground">{s.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </li>
              )
            ))}
          </ul>
        </div>
      </Variant>

      {/* 6 · Checklist with progress */}
      <Variant title="Checklist with progress"
        desc="The same idea with a progress indicator: step counter and bar in the header, numbered steps in cards and a footer with the support contact. For multi-step flows where how much is left matters."
        code={CODE_PROGRESS}>
        <div className="mx-auto w-full max-w-[460px]">
          <h3 className="font-sans font-semibold text-[14px] text-foreground">Getting started</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">Complete the steps to get your workspace ready and create your first dashboard.</p>
          <div className="mt-4 flex items-center justify-end gap-3">
            <span className="text-[12.5px] text-muted-foreground">Step 1/{GETTING.length}</span>
            <ProgressBar value={25} />
          </div>
          <ul role="list" className="mt-4 space-y-3">
            {GETTING.map((s) => (
              <li key={s.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  {s.status === 'complete'
                    ? <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon name="check" size={15} /></span>
                    : <span className="flex size-6 shrink-0 items-center justify-center font-mono text-[13px] text-muted-foreground">{s.id}</span>}
                  <div>
                    <p className="text-[13.5px] font-medium text-foreground">{s.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-lg bg-secondary p-4">
            <h4 className="text-[13px] font-medium text-foreground">Need help?</h4>
            <p className="mt-1 text-[13px] text-muted-foreground">Talk to the team at <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-primary hover:text-primary/80">support@example.com</a>.</p>
          </div>
        </div>
      </Variant>

      {/* 7 · Tabbed panel */}
      <Variant title="Tabbed panel"
        desc="The timeline mounted in a tabbed panel: “Updates” shows progress and a button to notify you when done; “Details” opens the workspace card — data, users and access level. The tab switches live."
        code={CODE_TABS}>
        <div className="mx-auto w-full max-w-[480px]">
          <SetupTabs />
        </div>
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['feeds'] = FeedsSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
