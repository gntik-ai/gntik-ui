/* ============================================================================
   Gntik UI · library.jsx — @gntik-ai/ui package components, rendered live.
   Reads every component folder in packages/ui: its *.doc.ts (name, group,
   keyboard contract, tokens) and its examples/*.tsx, which are both the
   preview and the copyable code (one file, no drift). Below the examples, the
   generated API reference (props, keyboard, accessibility: api-reference.jsx).
   Previews follow the topbar density and direction (PreviewScope).
   ============================================================================ */
import { useMemo, useState } from 'react';
import { PreviewScope } from '../preview-settings.jsx';

const { SectionHead, CodeBlock, ApiReference } = window;

const docs = import.meta.glob('../../../../packages/ui/src/components/*/*.doc.ts', { eager: true, import: 'doc' });
// Whole modules: helper files in examples/ (fixtures, demo routers) have no default export.
const exampleModules = import.meta.glob('../../../../packages/ui/src/components/*/examples/*.tsx', { eager: true });
const examples = Object.fromEntries(Object.entries(exampleModules).filter(([, m]) => typeof m.default === 'function').map(([p, m]) => [p, m.default]));
const sources = import.meta.glob('../../../../packages/ui/src/components/*/examples/*.tsx', { eager: true, query: '?raw', import: 'default' });

const folderOf = (path) => path.split('/components/')[1].split('/')[0];
const GROUP_ORDER = ['Actions', 'Forms', 'Overlays', 'Navigation', 'Display', 'Feedback', 'Layout', 'Theme'];
const titleOf = (path) => path.split('/').pop().replace('.tsx', '').replace(/([a-z])([A-Z])/g, '$1 $2');
// Examples import from '../Name'; in a product they import from the package.
const forProduct = (code) => code.replace(/from '\.\.\/(\.\.\/)?[A-Za-z]+(\/[A-Za-z.]+)?'/g, "from '@gntik-ai/ui'");

const COMPONENTS = Object.entries(docs)
  .map(([path, doc]) => {
    const folder = folderOf(path);
    const ex = Object.keys(examples)
      .filter((p) => folderOf(p) === folder)
      .sort()
      .map((p) => ({ title: titleOf(p), Comp: examples[p], code: forProduct(sources[p]) }));
    return { ...doc, folder, examples: ex };
  })
  .sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || a.name.localeCompare(b.name));

function ComponentEntry({ c }) {
  return (
    <section id={'ui-' + c.folder} className="mb-14 scroll-mt-6">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-[17px] font-semibold tracking-tight text-foreground">{c.name}</h2>
        <span className="font-mono text-[11px] text-muted-foreground">{c.group}</span>
        {c.primitive && <span className="font-mono text-[11px] text-muted-foreground">· {c.primitive}</span>}
        <span className="rounded-full bg-primary/14 px-2 py-0.5 text-[11px] font-medium text-primary-text">{c.status}</span>
      </div>
      <p className="mb-4 max-w-3xl text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>{c.description}</p>
      {c.examples.map(({ title, Comp, code }) => (
        <div key={title} className="mb-6">
          <div className="mb-2 text-[12.5px] font-medium text-foreground">{title}</div>
          <div className="rounded-lg border border-border bg-card p-6 sm:p-8"><PreviewScope><Comp /></PreviewScope></div>
          <CodeBlock code={code} />
        </div>
      ))}
      <ApiReference folder={c.folder} kind="component" level={3} />
    </section>
  );
}

function LibrarySection() {
  const [group, setGroup] = useState('All');
  const groups = useMemo(() => ['All', ...GROUP_ORDER.filter((g) => COMPONENTS.some((c) => c.group === g))], []);
  const shown = group === 'All' ? COMPONENTS : COMPONENTS.filter((c) => c.group === group);
  return (
    <div>
      <SectionHead kicker="Library" title="@gntik-ai/ui" status="done"
        intro={`${COMPONENTS.length} components on Base UI, styled only with brand tokens. Each example below is the real file from the package — the preview and the code are the same source. Every keyboard row is covered by a test, and every example passes axe.`} />
      <div className="mb-8 flex flex-wrap gap-1.5" role="group" aria-label="Filter by group">
        {groups.map((g) => (
          <button key={g} type="button" aria-pressed={group === g} onClick={() => setGroup(g)}
            className={'h-7 rounded-md px-2.5 text-[12px] font-medium transition-colors ' +
              (group === g ? 'bg-primary/14 text-primary-text' : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground')}>
            {g}
          </button>
        ))}
      </div>
      {shown.map((c) => <ComponentEntry key={c.folder} c={c} />)}
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['ui-components'] = LibrarySection;

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
