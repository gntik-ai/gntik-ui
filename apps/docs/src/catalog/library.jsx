/* ============================================================================
   Gntik UI · library.jsx — @gntik-ai/ui package components, rendered live.
   Reads every component folder in packages/ui: its *.doc.ts (name, group,
   keyboard contract, tokens) and its examples/*.tsx, which are both the
   preview and the copyable code (one file, no drift). Also reads the optional
   @gntik-ai/ui/forms entry (packages/ui/src/forms: FieldArray and its examples).
   Below the examples, the generated API reference (props, keyboard,
   accessibility: api-reference.jsx). Previews follow the topbar density and
   direction (PreviewScope). The page itself is shared with chat.jsx (package-docs.jsx).
   ============================================================================ */
import { buildEntries, sortEntries, PackageDocs } from './package-docs.jsx';

const hooksDocs = import.meta.glob('../../../../packages/ui/src/hooks/*.doc.ts', { eager: true, import: 'doc' });
const hooksExamples = import.meta.glob('../../../../packages/ui/src/hooks/examples/*.tsx', { eager: true });
const hooksSources = import.meta.glob('../../../../packages/ui/src/hooks/examples/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const docs = import.meta.glob('../../../../packages/ui/src/components/*/*.doc.ts', {
  eager: true,
  import: 'doc',
});
// Whole modules: helper files in examples/ (fixtures, demo routers) have no default export.
const exampleModules = import.meta.glob('../../../../packages/ui/src/components/*/examples/*.tsx', { eager: true });
const sources = import.meta.glob('../../../../packages/ui/src/components/*/examples/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const formsDocs = import.meta.glob('../../../../packages/ui/src/forms/*.doc.ts', { eager: true, import: 'doc' });
const formsExampleModules = import.meta.glob('../../../../packages/ui/src/forms/examples/*.tsx', { eager: true });
const formsSources = import.meta.glob('../../../../packages/ui/src/forms/examples/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const utilsDocs = import.meta.glob('../../../../packages/ui/src/utils/*.doc.ts', { eager: true, import: 'doc' });
const utilsExamples = import.meta.glob('../../../../packages/ui/src/utils/examples/*.tsx', { eager: true });
const utilsSources = import.meta.glob('../../../../packages/ui/src/utils/examples/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const themeDocs = import.meta.glob('../../../../packages/ui/src/{theme,csp}/*.doc.ts', { eager: true, import: 'doc' });
const themeExamples = import.meta.glob('../../../../packages/ui/src/{theme,csp}/examples/*.tsx', { eager: true });
const themeSources = import.meta.glob('../../../../packages/ui/src/{theme,csp}/examples/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const withDefault = (modules) =>
  Object.fromEntries(
    Object.entries(modules)
      .filter(([, m]) => typeof m.default === 'function')
      .map(([p, m]) => [p, m.default]),
  );

// Examples import from '../Name'; in a product they import from the package.
const forProduct = (code) =>
  code
    .replace(/from '\.\.\/\.\.\/\.\.\/code-highlight-shiki'/g, "from '@gntik-ai/ui/code-highlight-shiki'")
    .replace(/from '\.\.\/\.\.\/\.\.\/i18n(?:\/(?:I18nProvider|format|time-zone))?'/g, "from '@gntik-ai/ui'")
    .replace(/from '\.\.\/\.\.\/\.\.\/hooks\/useOs'/g, "from '@gntik-ai/ui'")
    .replace(/from '\.\.\/(\.\.\/)?[A-Za-z]+(\/[A-Za-z.]+)?'/g, "from '@gntik-ai/ui'");
// The forms entry is its own import path (react-hook-form and zod are optional peers); its examples
// import the entry as '..' or by file, and the kit components from ../../components/*.
const forFormsProduct = (code) =>
  forProduct(
    code
      .replace(/from '\.\.'/g, "from '@gntik-ai/ui/forms'")
      .replace(/from '\.\.\/(FieldArray|FormField|useFieldProps|schemaResolver)'/g, "from '@gntik-ai/ui/forms'"),
  );

// Form and its bindings share FormField.doc.ts; FieldArray owns its prefixed examples.
const docNameOf = (path) =>
  path
    .split('/')
    .pop()
    .replace(/\.doc\.ts$/, '');
const exampleOwnerOf = (path, folders) => {
  const base = path.split('/').pop();
  if (base.startsWith('Form') && folders.includes('FormField')) return 'FormField';
  const named = folders.filter((f) => base.startsWith(f)).sort((a, b) => b.length - a.length);
  return named[0] ?? [...folders].sort()[0];
};

const COMPONENTS = sortEntries([
  ...buildEntries({
    docs: hooksDocs,
    examples: withDefault(hooksExamples),
    sources: hooksSources,
    folderOf: docNameOf,
    ownerOf: exampleOwnerOf,
    forProduct,
    apiKind: 'hooks',
  }),
  ...buildEntries({
    docs: themeDocs,
    examples: withDefault(themeExamples),
    sources: themeSources,
    folderOf: docNameOf,
    ownerOf: exampleOwnerOf,
    forProduct: (code) => code.replace(/from '[.][^']+'/g, "from '@gntik-ai/ui'"),
    apiKind: 'theme',
  }),
  ...buildEntries({
    docs: utilsDocs,
    examples: withDefault(utilsExamples),
    sources: utilsSources,
    folderOf: (path) =>
      path
        .split('/')
        .pop()
        .replace(/\.doc\.ts$/, ''),
    ownerOf: (path) => (path.split('/').pop().startsWith('responsive') ? 'responsive' : 'match-text'),
    forProduct: (code) =>
      code.replace(
        /from '[^']*(?:responsive|cn|grid.variants|match-text|I18nProvider|components\/Input)'/g,
        "from '@gntik-ai/ui'",
      ),
    apiKind: 'utils',
  }),
  ...buildEntries({
    docs,
    examples: withDefault(exampleModules),
    sources,
    folderOf: (path) => path.split('/components/')[1].split('/')[0],
    forProduct,
    apiKind: 'component',
  }),
  ...buildEntries({
    docs: formsDocs,
    examples: withDefault(formsExampleModules),
    sources: formsSources,
    folderOf: docNameOf,
    ownerOf: exampleOwnerOf,
    forProduct: forFormsProduct,
    apiKind: 'forms',
  }),
]);

function LibrarySection() {
  return (
    <PackageDocs
      kicker="Library"
      title="@gntik-ai/ui"
      idPrefix="ui"
      entries={COMPONENTS}
      intro={`${COMPONENTS.length} components on Base UI, styled only with brand tokens. Each example below is the real file from the package — the preview and the code are the same source. Every keyboard row is covered by a test, and every example passes axe.`}
    />
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['ui-components'] = LibrarySection;

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
