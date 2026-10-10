/* ============================================================================
   Gntik UI · viewers.jsx — Blocks, Layouts and Templates galleries.
   Every item renders in an iframe (/preview.html) so breakpoints follow the
   chosen device width and each frame carries its own theme. The code tab shows
   the real source file from the package. Frames follow the topbar density and
   direction (query params preview.html honours); each layout gets its generated
   API reference.
   ============================================================================ */
import { useEffect, useMemo, useState } from 'react';
import { CATALOG, loadSource } from '../preview-registry.js';
import { previewQuery, usePreviewSettings } from '../preview-settings.jsx';

const { SectionHead, CodeBlock, ApiReference } = window;

const DEVICES = [['Desktop', '100%'], ['Tablet', '768px'], ['Mobile', '390px']];
const THEMES = [['dark', 'Dark'], ['light', 'Light'], ['high_contrast', 'HC']];
const titleCase = (s) => s.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

function Segmented({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-md border border-border bg-card p-0.5">
      {options.map(([v, text]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}
          className={'h-6 rounded px-2 text-[11.5px] font-medium transition-colors ' +
            (value === v ? 'bg-primary/14 text-primary-text' : 'text-muted-foreground hover:text-foreground')}>
          {text}
        </button>
      ))}
    </div>
  );
}

function Viewer({ kind, id, title, file, height }) {
  const [device, setDevice] = useState('100%');
  const [theme, setTheme] = useState(() => document.documentElement.classList.contains('high_contrast') ? 'high_contrast'
    : document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  const [tab, setTab] = useState('preview');
  const [code, setCode] = useState('');
  const [auto, setAuto] = useState(null);
  const settings = usePreviewSettings();
  const src = `/preview.html?kind=${kind}&id=${encodeURIComponent(id)}&theme=${theme}${previewQuery(settings)}`;

  useEffect(() => {
    if (kind !== 'block') return undefined;
    const onMsg = (e) => { if (e.data?.type === 'gntik-preview-height' && e.data.id === id) setAuto(Math.min(e.data.height, 1200)); };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [kind, id]);
  useEffect(() => {
    if (tab !== 'code' || code) return;
    let alive = true;
    loadSource(file).then((c) => alive && setCode(c));
    return () => { alive = false; };
  }, [tab, file, code]);

  return (
    <div className="mb-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Segmented label={`${title}: view`} options={[['preview', 'Preview'], ['code', 'Code']]} value={tab} onChange={setTab} />
        {tab === 'preview' && <>
          <Segmented label={`${title}: device width`} options={DEVICES.map(([n, w]) => [w, n])} value={device} onChange={setDevice} />
          <Segmented label={`${title}: theme`} options={THEMES} value={theme} onChange={setTheme} />
        </>}
        <a href={src} target="_blank" rel="noreferrer" className="ml-auto text-[12px] font-medium text-primary-text underline-offset-4 hover:underline">Open in new tab</a>
      </div>
      {tab === 'preview' ? (
        <div className="overflow-hidden rounded-lg border border-border bg-muted/40">
          <iframe title={`${title} preview`} src={src} loading="lazy"
            style={{ width: device, height: kind === 'block' ? (auto ?? height) : height }}
            className="mx-auto block border-0 bg-background transition-[width] duration-200 motion-reduce:transition-none" />
        </div>
      ) : (
        <CodeBlock code={code || '// loading…'} open />
      )}
    </div>
  );
}

function Gallery({ kicker, title, intro, groups, kind, height, api }) {
  const names = groups.map(([g]) => g);
  const [group, setGroup] = useState('All');
  const shown = group === 'All' ? groups : groups.filter(([g]) => g === group);
  return (
    <div>
      <SectionHead kicker={kicker} title={title} status="done" intro={intro} />
      <div className="mb-8 flex flex-wrap gap-1.5" role="group" aria-label="Filter by family">
        {['All', ...names].map((g) => (
          <button key={g} type="button" aria-pressed={group === g} onClick={() => setGroup(g)}
            className={'h-7 rounded-md px-2.5 text-[12px] font-medium transition-colors ' +
              (group === g ? 'bg-primary/14 text-primary-text' : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground')}>
            {titleCase(g)}
          </button>
        ))}
      </div>
      {shown.map(([g, items]) => (
        <section key={g} className="mb-12" aria-labelledby={`${kind}-${g}`}>
          <h2 id={`${kind}-${g}`} className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-primary-text">{titleCase(g)}</h2>
          {items.map((it) => (
            <article key={it.id} className="mb-10" aria-labelledby={`${kind}-${it.id}-t`}>
              <div className="mb-1 flex flex-wrap items-baseline gap-x-3">
                <h3 id={`${kind}-${it.id}-t`} className="text-[16px] font-semibold tracking-tight text-foreground">{it.title}</h3>
                <span className="font-mono text-[11px] text-muted-foreground">{it.id}</span>
              </div>
              {it.description && <p className="mb-2 max-w-3xl text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>{it.description}</p>}
              {it.uses?.length > 0 && <p className="mb-3 text-[11.5px] text-muted-foreground">Uses: {it.uses.join(' · ')}</p>}
              <Viewer kind={kind} id={it.id} title={it.title} file={it.file} height={height} />
              {kind === 'template' && it.id === 'create-wizard' && <>
                <p className="my-4 text-[13px] leading-6 text-muted-foreground">
                  Keep the list mounted and open the flow from page state. WizardLayout overlay defaults to fullscreen;
                  dialog-wizard defaults to a dialog on desktop and tablet, and fills mobile viewports. Use the page
                  template for a dedicated flow. Closing preserves the current step and answers.
                </p>
                <Viewer kind="template" id="create-wizard--overlay" title="Create wizard over a list"
                  file="../../../packages/templates/src/create-wizard/examples/Overlay.tsx" height={height} />
                <h4 className="my-4 text-[15px] font-semibold text-foreground">Dialog wizard</h4>
                <Viewer kind="block" id="dialog-wizard" title="Dialog wizard"
                  file="../../../packages/blocks/src/forms/DialogWizard/examples/CreateResource.tsx" height={height} />
              </>}
            </article>
          ))}
          {api?.(g, items)}
        </section>
      ))}
    </div>
  );
}

const groupBy = (items, key) => {
  const map = new Map();
  for (const it of items) { const k = key(it); map.set(k, [...(map.get(k) ?? []), it]); }
  return [...map.entries()];
};

function BlocksSection() {
  const groups = useMemo(() => groupBy(CATALOG.blocks.map((b) => ({
    id: b.id, title: b.meta.name, description: b.meta.description, uses: b.meta.uses, file: b.file, family: b.family,
  })), (b) => b.family), []);
  return <Gallery kicker="Compositions" title="Blocks" kind="block" height={360} groups={groups}
    intro={`${CATALOG.blocks.length} blocks from @gntik-ai/blocks — page sections composed from the kit, data-driven with sample fixtures. Preview each at desktop, tablet or mobile width in any theme, or copy it into a product with \`gntik-ui add <id>\`.`} />;
}

function LayoutsSection() {
  const groups = useMemo(() => groupBy(CATALOG.layouts.map((l) => ({
    id: l.id, title: `${l.doc.name} · ${titleCase(l.example.replace(/([a-z])([A-Z])/g, '$1 $2'))}`, description: l.doc.description, file: l.file, layout: l.doc.name,
  })), (l) => l.layout), []);
  // One generated API reference per layout folder, after its examples.
  const api = (g, items) => {
    const folder = CATALOG.layouts.find((l) => l.id === items[0]?.id)?.layout;
    return folder ? <ApiReference folder={folder} kind="layout" level={3} /> : null;
  };
  return <Gallery kicker="Compositions" title="Layouts" kind="layout" height={620} groups={groups} api={api}
    intro={`${new Set(CATALOG.layouts.map((l) => l.layout)).size} page layouts from @gntik-ai/ui — shells, split and inspector views, settings, auth, wizard, docs, status and print. Resize the frame to see each one adapt.`} />;
}

function TemplatesSection() {
  const groups = useMemo(() => groupBy(CATALOG.templates.map((t) => ({
    id: t.id, title: t.meta.name, description: `${t.meta.description} · ${t.meta.layout} · ${t.meta.priority}`, uses: t.meta.blocks, file: t.file, family: t.meta.family,
  })), (t) => t.family), []);
  return <Gallery kicker="Compositions" title="Page templates" kind="template" height={760} groups={groups}
    intro={`${CATALOG.templates.length} complete pages from @gntik-ai/templates, built only from layouts and blocks. Switch device and theme per frame; \`gntik-ui add <id>\` copies a template into your app.`} />;
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['blocks'] = BlocksSection;
window.SECTIONS['layouts'] = LayoutsSection;
window.SECTIONS['templates'] = TemplatesSection;

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
