/* ============================================================================
   Gntik UI · file-upload.jsx — file upload ("Forms" group).
   Different from the Empty states dropzone (which fills a void): this is the
   real form control — multi-file dropzone with progress and states, compact
   button+name input, and image/logo upload. Click simulates the selection
   (deterministic preview). Tokens only, zero hardcoded colour.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useRef, useEffect } = window;

const Variant = ({ title, desc, code, surface = 'card', children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className={(surface === 'dots' ? 'preview-surface ' : 'bg-card ') + "rounded-lg border border-border p-5 sm:p-7"}>{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

const fmtSize = (kb) => kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : Math.round(kb) + ' KB';
const KIND = {
  yaml:  { icon: 'code',  tag: 'YAML' },
  json:  { icon: 'code',  tag: 'JSON' },
  jsonl: { icon: 'code',  tag: 'JSONL' },
  csv:   { icon: 'table', tag: 'CSV' },
  pdf:   { icon: 'audit', tag: 'PDF' },
};
const kindOf = (name) => KIND[name.split('.').pop()] || { icon: 'audit', tag: 'FILE' };

/* ── 1 · MULTI-FILE DROPZONE WITH PROGRESS ───────────────────────────────── */
const QUEUE = [
  { name: 'support-tickets-q2.csv', kb: 880 },
  { name: 'events-export.jsonl', kb: 1640 },
  { name: 'service-config.json', kb: 36 },
  { name: 'onboarding-handbook.pdf', kb: 3220 },
];
let UID = 100;
function Uploader() {
  const [files, setFiles] = useState([
    { id: 1, name: 'pii-redaction.yaml', kb: 4.2, progress: 100, status: 'done' },
    { id: 2, name: 'db-snapshot.bin', kb: 2480, progress: 0, status: 'error' },
  ]);
  const [drag, setDrag] = useState(false);
  const [qi, setQi] = useState(0);
  const timers = useRef({});
  useEffect(() => () => Object.values(timers.current).forEach(clearInterval), []);

  const addFile = () => {
    const sample = QUEUE[qi % QUEUE.length];
    setQi(i => i + 1);
    const id = ++UID;
    setFiles(f => [...f, { id, name: sample.name, kb: sample.kb, progress: 0, status: 'uploading' }]);
    timers.current[id] = setInterval(() => {
      setFiles(f => f.map(x => {
        if (x.id !== id) return x;
        const p = Math.min(100, x.progress + (10 + Math.random() * 16));
        if (p >= 100) { clearInterval(timers.current[id]); delete timers.current[id]; return { ...x, progress: 100, status: 'done' }; }
        return { ...x, progress: p };
      }));
    }, 220);
  };
  const remove = (id) => { clearInterval(timers.current[id]); delete timers.current[id]; setFiles(f => f.filter(x => x.id !== id)); };
  const onDrop = (e) => { e.preventDefault(); setDrag(false); addFile(); };

  return (
    <div className="mx-auto max-w-xl">
      <button type="button" onClick={addFile}
        onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
        className={"block w-full rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors " +
          (drag ? 'border-primary bg-primary/10' : 'border-border bg-background/40 hover:border-primary/50 hover:bg-primary/5')}>
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground ring-1 ring-border"><Icon name="upload" size={22} /></div>
        <p className="mt-4 text-[13.5px] text-foreground">Drag files here or <span className="font-semibold text-primary">browse</span></p>
        <p className="mt-1 font-mono text-[11.5px] text-muted-foreground">CSV · JSON · YAML · PDF · max 25 MB per file</p>
      </button>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map(f => {
            const k = kindOf(f.name);
            const err = f.status === 'error', done = f.status === 'done';
            return (
              <li key={f.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 shadow-sm">
                <span className={"grid size-9 shrink-0 place-items-center rounded-md " + (err ? 'bg-destructive/12 text-destructive' : done ? 'bg-primary/14 text-primary' : 'bg-secondary text-muted-foreground')}>
                  <Icon name={err ? 'alert' : k.icon} size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-medium text-foreground">{f.name}</span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted-foreground/70">{k.tag}</span>
                  </div>
                  {f.status === 'uploading' ? (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: f.progress + '%' }} />
                      </div>
                      <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-muted-foreground">{Math.round(f.progress)}%</span>
                    </div>
                  ) : (
                    <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px]">
                      {err
                        ? <span className="text-destructive">Exceeds the 25 MB limit · not uploaded</span>
                        : <span className="text-muted-foreground"><span className="text-primary">✓</span> {fmtSize(f.kb)} · uploaded</span>}
                    </div>
                  )}
                </div>
                {err
                  ? <button onClick={addFile} className="shrink-0 font-mono text-[11.5px] text-primary transition-colors hover:text-primary/80">Retry</button>
                  : null}
                <button onClick={() => remove(f.id)} aria-label="Remove" className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Icon name="x" size={14} stroke={2.2} /></button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground/80">click the area to simulate an upload</p>
    </div>
  );
}

/* ── 2 · COMPACT INPUT (button + name) ───────────────────────────────────── */
function CompactInput() {
  const [name, setName] = useState('');
  return (
    <div className="mx-auto max-w-md space-y-5">
      <div>
        <label className="mb-1.5 block text-[12.5px] font-medium text-foreground">Import data</label>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setName('support-tickets-q2.csv')}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[13px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/70">
            <Icon name="paperclip" size={15} className="text-muted-foreground" />Choose file
          </button>
          <span className={"min-w-0 flex-1 truncate text-[13px] " + (name ? 'text-foreground' : 'text-muted-foreground')}>{name || 'No file selected'}</span>
          {name && <button onClick={() => setName('')} aria-label="Remove" className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Icon name="x" size={13} stroke={2.2} /></button>}
        </div>
        <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">CSV or Parquet · up to 200 MB</p>
      </div>

      <div>
        <label className="mb-1.5 block text-[12.5px] font-medium text-foreground">Inline attachment</label>
        <div className="flex items-center rounded-md border border-border bg-background shadow-sm transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25">
          <button type="button" onClick={() => setName('pii-redaction.yaml')}
            className="inline-flex h-9 items-center gap-1.5 rounded-l-md border-r border-border bg-secondary/60 px-3 text-[12.5px] font-medium text-foreground transition-colors hover:bg-secondary">
            <Icon name="upload" size={14} className="text-muted-foreground" />Upload
          </button>
          <span className={"flex h-9 min-w-0 flex-1 items-center truncate px-3 text-[13px] " + (name ? 'text-foreground' : 'text-muted-foreground')}>{name || 'policy.yaml…'}</span>
        </div>
      </div>
    </div>
  );
}

/* ── 3 · LOGO / AVATAR UPLOAD ────────────────────────────────────────────── */
const STRIPES = { backgroundImage: 'repeating-linear-gradient(135deg, hsl(var(--muted-foreground) / 0.10) 0 6px, transparent 6px 12px)' };
function AvatarUpload() {
  const [on, setOn] = useState(false);
  return (
    <div className="mx-auto flex max-w-md items-center gap-5">
      {on ? (
        <div className="group relative size-[72px] shrink-0 overflow-hidden rounded-xl ring-1 ring-border">
          <div className="grid size-full place-items-center bg-primary/15 font-sans text-[26px] font-bold text-primary">a</div>
          <button onClick={() => setOn(true)} className="absolute inset-0 grid place-items-center bg-foreground/55 text-background opacity-0 transition-opacity group-hover:opacity-100">
            <Icon name="upload" size={18} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setOn(true)} aria-label="Upload logo"
          className="grid size-[72px] shrink-0 place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary" style={STRIPES}>
          <Icon name="upload" size={20} />
        </button>
      )}
      <div className="min-w-0">
        <div className="text-[13.5px] font-semibold tracking-tight text-foreground">Workspace logo</div>
        <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground" style={{ textWrap: 'pretty' }}>Square PNG or SVG, at least 256×256. Shown in the topbar and in invitations.</p>
        <div className="mt-2.5 flex items-center gap-2">
          <button onClick={() => setOn(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12.5px] font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/70">
            <Icon name="upload" size={13} className="text-muted-foreground" />{on ? 'Change' : 'Upload'}
          </button>
          {on && <button onClick={() => setOn(false)} className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-destructive">Remove</button>}
        </div>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_DROP = `// Multi-file dropzone — drag highlight + animated per-file progress
const addFile = () => {
  const id = nextId();
  setFiles((f) => [...f, { id, name, kb, progress: 0, status: "uploading" }]);
  const iv = setInterval(() => {
    setFiles((f) => f.map((x) => {
      if (x.id !== id) return x;
      const p = Math.min(100, x.progress + 10 + Math.random() * 16);
      if (p >= 100) { clearInterval(iv); return { ...x, progress: 100, status: "done" }; }
      return { ...x, progress: p };
    }));
  }, 220);
};

<button onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
  onDragLeave={() => setDrag(false)} onDrop={onDrop} onClick={addFile}
  className={"w-full rounded-xl border-2 border-dashed px-6 py-10 text-center " +
    (drag ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-primary/5")}>
  …
</button>

{/* progress row */}
<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
  <div className="h-full rounded-full bg-primary" style={{ width: f.progress + "%" }} />
</div>`;

const CODE_COMPACT = `// Compact input — button triggers the hidden <input type="file"> + name
<div className="flex items-center gap-3">
  <button onClick={() => inputRef.current.click()}
    className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3
               text-[13px] font-medium shadow-sm hover:bg-secondary/70">
    <PaperclipIcon /> Choose file
  </button>
  <span className={name ? "truncate text-foreground" : "text-muted-foreground"}>
    {name || "No file selected"}
  </span>
  <input ref={inputRef} type="file" className="sr-only"
    onChange={(e) => setName(e.target.files[0]?.name ?? "")} />
</div>`;

const CODE_AVA = `// Logo upload — striped placeholder → preview with hover overlay
{src ? (
  <div className="group relative size-[72px] overflow-hidden rounded-xl ring-1 ring-border">
    <img src={src} className="size-full object-cover" />
    <button className="absolute inset-0 grid place-items-center bg-foreground/55 text-background
                       opacity-0 group-hover:opacity-100"><UploadIcon /></button>
  </div>
) : (
  <button onClick={pick} aria-label="Upload logo"
    className="grid size-[72px] place-items-center rounded-xl border-2 border-dashed border-border
               text-muted-foreground hover:border-primary/50 hover:text-primary"><UploadIcon /></button>
)}`;

/* ── section ─────────────────────────────────────────────────────────────── */
function FileUploadSection() {
  return (
    <div>
      <SectionHead kicker="Forms" title="File upload" status="done"
        intro="The real upload control inside a form — not to be confused with the Empty states dropzone, which fills a void. Three forms: the multi-file dropzone with a per-file progress bar and states (uploading, uploaded, error with retry); the compact button + name input for a single attachment in a row; and image upload for a logo or avatar, with a striped placeholder and preview. In the catalog, clicking simulates the selection so the preview is deterministic." />

      <Variant title="Multi-file dropzone"
        desc="Drag (it tints primary) or click to queue files. Each one uploads with its progress bar and ends in ✓; the example includes a failed file with its retry action. The ✕ removes it from the queue."
        code={CODE_DROP}>
        <Uploader />
      </Variant>

      <Variant title="Compact input"
        desc="For a single attachment in a form row: a button that opens the picker and the file name next to it. Two treatments — standalone button and button attached to the field. Click to simulate the selection."
        code={CODE_COMPACT}>
        <CompactInput />
      </Variant>

      <Variant title="Logo / avatar upload"
        desc="For images: a box with a striped placeholder that, once selected, shows the preview with a change overlay on hover, plus change and remove actions. Click to toggle the state."
        code={CODE_AVA}>
        <AvatarUpload />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['file-upload'] = FileUploadSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
