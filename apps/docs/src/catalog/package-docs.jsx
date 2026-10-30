/* ============================================================================
   Gntik UI · package-docs.jsx — the page shared by every package that documents
   its components from source: library.jsx (@gntik-ai/ui, including the optional
   forms entry) and chat.jsx (@gntik-ai/chat).
   Each component folder's *.doc.ts gives the name, group and keyboard contract;
   its examples/*.tsx are both the live preview and the copyable code (one file,
   no drift); the generated API reference sits below (api-reference.jsx).
   A section file only declares its import.meta.glob patterns (they must be
   literal strings) and calls buildEntries + PackageDocs.
   ============================================================================ */
import { useMemo, useState } from 'react';
import { Anatomy } from './api-reference.jsx';
import { PreviewScope } from '../preview-settings.jsx';

export const GROUP_ORDER = ['Actions', 'Forms', 'Overlays', 'Navigation', 'Display', 'Feedback', 'Layout', 'Theme'];

/** "FieldArrayToolParameters.tsx" → "Field Array Tool Parameters". */
const titleOf = (path) =>
  path
    .split('/')
    .pop()
    .replace('.tsx', '')
    .replace(/([a-z])([A-Z])/g, '$1 $2');

/**
 * Pairs every doc with its examples (preview component + source for the copyable code).
 *  - docs / examples / sources: import.meta.glob results keyed by path (examples already filtered
 *    to modules with a default export; sources imported with ?raw).
 *  - folderOf(path): the folder key of a doc path (e.g. "Button", or "FieldArray" for forms/FieldArray.doc.ts).
 *  - ownerOf(examplePath, folders): which folder an example belongs to (default: its own folder).
 *  - forProduct(code): rewrites an example's relative imports to the package an app would import from.
 *  - apiKind: the ApiReference kind for these docs (component | chat | forms).
 * Entries come back unsorted; merge the lists you need and pass them through sortEntries.
 */
export function buildEntries({ docs, examples, sources, folderOf, ownerOf, forProduct, apiKind }) {
  const found = Object.entries(docs).map(([path, doc]) => ({ doc, folder: folderOf(path) }));
  const folders = found.map((f) => f.folder);
  const owner = ownerOf ?? ((path) => folderOf(path));
  return found.map(({ doc, folder }) => ({
    ...doc,
    folder,
    apiKind,
    examples: Object.keys(examples)
      .filter((p) => owner(p, folders) === folder)
      .sort()
      .map((p) => ({ title: titleOf(p), Comp: examples[p], code: forProduct(sources[p]) })),
  }));
}

/** Group order first (Actions, Forms, Overlays…), then name. */
export const sortEntries = (entries) =>
  [...entries].sort(
    (a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || a.name.localeCompare(b.name),
  );

export function ComponentEntry({ c, idPrefix, page = false }) {
  const { CodeBlock, ApiReference } = window;
  const Heading = page ? 'h1' : 'h2';
  return (
    <section id={idPrefix + '-' + c.folder} className="mb-14 scroll-mt-6">
      {page && (
        <a href="#ui-components" className="mb-6 inline-block text-[13px] text-primary-text underline focus-ring">
          Back to Library
        </a>
      )}
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Heading
          tabIndex={page ? -1 : undefined}
          className={
            page
              ? 'text-[2rem] font-bold tracking-tight text-foreground'
              : 'text-[17px] font-semibold tracking-tight text-foreground'
          }
        >
          {c.name}
        </Heading>
        <span className="font-mono text-[11px] text-muted-foreground">{c.group}</span>
        {c.primitive && <span className="font-mono text-[11px] text-muted-foreground">· {c.primitive}</span>}
        <span className="rounded-full bg-primary/14 px-2 py-0.5 text-[11px] font-medium text-primary-text">
          {c.status}
        </span>
      </div>
      <p className="mb-4 max-w-3xl text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
        {c.description}
      </p>
      {page && (
        <>
          <CodeBlock
            code={`import { ${c.importName ?? c.name} } from '${c.apiKind === 'forms' ? '@gntik-ai/ui/forms' : '@gntik-ai/ui'}'`}
            open
          />
          <Anatomy anatomy={c.anatomy} />
          <h2 className="mb-4 mt-8 text-[17px] font-semibold text-foreground">Examples</h2>
        </>
      )}
      {c.examples.map(({ title, Comp, code }) => (
        <div key={title} className="mb-6">
          {page ? (
            <h3 className="mb-2 text-[12.5px] font-medium text-foreground">{title}</h3>
          ) : (
            <div className="mb-2 text-[12.5px] font-medium text-foreground">{title}</div>
          )}
          <div data-component-preview="" className="rounded-lg border border-border bg-card p-6 sm:p-8">
            <PreviewScope>
              <Comp />
            </PreviewScope>
          </div>
          <CodeBlock code={code} />
        </div>
      ))}
      <ApiReference folder={c.folder} kind={c.apiKind} level={page ? 2 : 3} page={page} />
    </section>
  );
}

/** A section page: heading, group filter and one entry per component. `idPrefix` anchors each entry (#ui-Button). */
export function PackageDocs({ kicker, title, intro, entries, idPrefix }) {
  const { SectionHead } = window;
  const [group, setGroup] = useState('All');
  const groups = useMemo(() => ['All', ...GROUP_ORDER.filter((g) => entries.some((c) => c.group === g))], [entries]);
  const shown = group === 'All' ? entries : entries.filter((c) => c.group === group);
  return (
    <div>
      <SectionHead kicker={kicker} title={title} status="done" intro={intro} />
      <div className="mb-8 flex flex-wrap gap-1.5" role="group" aria-label="Filter by group">
        {groups.map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={group === g}
            onClick={() => setGroup(g)}
            className={
              'h-7 rounded-md px-2.5 text-[12px] font-medium transition-colors ' +
              (group === g
                ? 'bg-primary/14 text-primary-text'
                : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground')
            }
          >
            {g}
          </button>
        ))}
      </div>
      {shown.map((c) => (
        <ComponentEntry key={idPrefix + c.folder} c={c} idPrefix={idPrefix} />
      ))}
    </div>
  );
}

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
