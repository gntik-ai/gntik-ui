/* ============================================================================
   Gntik UI · hooks.jsx — the @gntik-ai/ui/hooks entry, rendered live.
   Reads every packages/ui/src/hooks/*.doc.ts (a HookDoc: name, signature, what the hook
   returns on the server) and its examples/<docName>*.tsx, which are both the preview and the
   copyable code. hooks.meta.ts gives the page intro (the same file the ui-hooks registry item
   points at). The index lists every hook in full; each hook also has its own sub-page.
   ============================================================================ */
import { Fragment } from 'react';
import { useI18n } from '@gntik-ai/ui';
import { hooksMessages } from '../i18n/hooks-messages';
import { HOOK_PAGES } from './item-inventory.js';
import { PreviewScope } from '../preview-settings.jsx';
import { routeHash } from './routes.js';

const docs = import.meta.glob('../../../../packages/ui/src/hooks/*.doc.ts', { eager: true, import: 'doc' });
const meta = import.meta.glob('../../../../packages/ui/src/hooks/hooks.meta.ts', { eager: true, import: 'meta' });
const examples = import.meta.glob('../../../../packages/ui/src/hooks/examples/*.tsx', { eager: true });
const sources = import.meta.glob('../../../../packages/ui/src/hooks/examples/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const baseOf = (path, suffix) => path.split('/').pop().replace(suffix, '');
const HOOKS_META = Object.values(meta)[0];

// Examples import hooks from '../useName' and everything else from deeper relative paths such as
// '../../i18n/I18nProvider'; a product imports the first from the entry and the rest from the root.
const rewriteImports = (code) =>
  code
    .replace(/from '\.\.\/(?:index|use[A-Za-z]+)'/g, "from '@gntik-ai/ui/hooks'")
    .replace(/from '(?:\.\.\/)+[^']+'/g, "from '@gntik-ai/ui'");

// Several relative imports collapse onto one package path: keep one import per module.
const mergeImports = (code) => {
  const names = new Map();
  const statement = /^import \{([^}]+)\} from '(@gntik-ai\/ui(?:\/hooks)?)';\n/gm;
  for (const [, list, from] of code.matchAll(statement)) {
    const all = names.get(from) ?? [];
    names.set(from, [
      ...all,
      ...list
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean),
    ]);
  }
  const written = new Set();
  return code.replace(statement, (_, __, from) => {
    if (written.has(from)) return '';
    written.add(from);
    return `import { ${[...new Set(names.get(from))].sort().join(', ')} } from '${from}';\n`;
  });
};

const forProduct = (code) => mergeImports(rewriteImports(code));

const ENTRIES = Object.entries(docs)
  .map(([path, doc]) => {
    const folder = baseOf(path, '.doc.ts');
    return {
      ...doc,
      folder,
      id: HOOK_PAGES.find((p) => p.folder === folder).id,
      examples: Object.entries(examples)
        .filter(([p, m]) => baseOf(p, '.tsx').startsWith(`${folder}Example`) && typeof m.default === 'function')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([p, m]) => ({ key: p, Comp: m.default, code: forProduct(sources[p]) })),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

function HookEntry({ c, page = false }) {
  const { CodeBlock, ApiReference } = window;
  const { locale } = useI18n();
  const copy = hooksMessages[locale.split('-')[0]] ?? hooksMessages.en;
  const Heading = page ? 'h1' : 'h2';
  const Sub = page ? 'h2' : 'h3';
  const covered = [c.name, ...(c.also ?? [])];
  return (
    <section id={`ui-${c.folder}`} className="mb-14 scroll-mt-6">
      {page && (
        <a
          href={routeHash('ui-hooks')}
          className="mb-6 inline-block text-[13px] text-primary-text underline focus-ring"
        >
          {copy.back}
        </a>
      )}
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Heading
          tabIndex={page ? -1 : undefined}
          className={
            page
              ? 'font-mono text-[2rem] font-bold tracking-tight text-foreground'
              : 'font-mono text-[17px] font-semibold tracking-tight text-foreground'
          }
        >
          {c.name}
        </Heading>
        <span className="rounded-full bg-primary/14 px-2 py-0.5 text-[11px] font-medium text-primary-chip-text">
          {c.status}
        </span>
        {!page && (
          <a href={routeHash('ui-hooks', c.id)} className="text-[12px] text-primary-text underline focus-ring">
            {copy.openPage}
          </a>
        )}
      </div>
      <p className="mb-4 max-w-3xl text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
        {c.description}
      </p>
      <CodeBlock code={`import { ${covered.join(', ')} } from '@gntik-ai/ui/hooks'`} open />
      <Sub className="mb-2 mt-6 text-[13px] font-semibold text-foreground">{copy.signature}</Sub>
      <CodeBlock code={c.signature} open />
      <Sub className="mb-2 mt-6 text-[13px] font-semibold text-foreground">{copy.server}</Sub>
      <p className="max-w-3xl text-[13px] leading-6 text-muted-foreground" style={{ textWrap: 'pretty' }}>
        {c.server}
      </p>
      <Sub className="mb-2 mt-6 text-[13px] font-semibold text-foreground">{copy.example}</Sub>
      {c.examples.map(({ key, Comp, code }) => (
        <Fragment key={key}>
          <div data-component-preview="" className="mb-2 rounded-lg border border-border bg-card p-6 sm:p-8">
            <PreviewScope>
              <Comp />
            </PreviewScope>
          </div>
          <CodeBlock code={code} />
        </Fragment>
      ))}
      <ApiReference folder={c.folder} kind="hooks" level={page ? 2 : 3} page={page} />
    </section>
  );
}

function HooksSection({ itemId }) {
  const { SectionHead } = window;
  const { locale } = useI18n();
  const copy = hooksMessages[locale.split('-')[0]] ?? hooksMessages.en;
  const hook = ENTRIES.find((c) => c.id === itemId);
  if (hook) return <HookEntry c={hook} page />;
  return (
    <div>
      <SectionHead
        kicker={copy.kicker}
        title={HOOKS_META.name}
        status="done"
        intro={`${copy.count(ENTRIES.length)} ${HOOKS_META.description}`}
      />
      {ENTRIES.map((c) => (
        <HookEntry key={c.id} c={c} />
      ))}
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['ui-hooks'] = HooksSection;

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
