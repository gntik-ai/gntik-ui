/* ============================================================================
   Gntik UI · library.jsx — @gntik-ai/ui package components, rendered live.
   Reads every component folder in packages/ui: its *.doc.ts (name, group,
   keyboard contract, tokens; hooks have their own page, hooks.jsx) and its examples/*.tsx, which are both the
   preview and the copyable code (one file, no drift). Also reads the optional
   @gntik-ai/ui/forms entry (packages/ui/src/forms: FieldArray and its examples).
   Below the examples, the generated API reference (props, keyboard,
   accessibility: api-reference.jsx). Previews follow the topbar density and
   direction (PreviewScope). The page itself is shared with chat.jsx (package-docs.jsx).
   ============================================================================ */
import { buildEntries, sortEntries, ComponentEntry } from './package-docs.jsx';
import { ComponentIndex } from './component-index.jsx';
import { UI_PAGES } from './item-inventory.js';

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

const themeDocs = import.meta.glob('../../../../packages/ui/src/{theme,csp,kit,navigation}/*.doc.ts', {
  eager: true,
  import: 'doc',
});
const themeExamples = import.meta.glob('../../../../packages/ui/src/{theme,csp,kit,navigation}/examples/*.tsx', {
  eager: true,
});
const themeSources = import.meta.glob('../../../../packages/ui/src/{theme,csp,kit,navigation}/examples/*.tsx', {
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

// Form bindings share FormField.doc.ts; actions and FieldArray own their examples.
const docNameOf = (path) =>
  path
    .split('/')
    .pop()
    .replace(/\.doc\.ts$/, '');
const exampleOwnerOf = (path, folders) => {
  const base = path.split('/').pop();
  if (base === 'FormEditSettings.tsx' && folders.includes('FormActions')) return 'FormActions';
  if (base.startsWith('Form') && folders.includes('FormField')) return 'FormField';
  const named = folders.filter((f) => base.startsWith(f)).sort((a, b) => b.length - a.length);
  return named[0] ?? [...folders].sort()[0];
};

const COMPONENTS = sortEntries([
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

const entryImports = {
  FormActions: 'FormSubmit, FormReset, useFormActions',
  ChoiceCard: 'ClickableCard, SelectableCardGroup, SelectableCard',
  Resizable: 'ResizablePanelGroup, ResizablePanel, ResizeHandle',
  Toast: 'ToastProvider, Toaster, useToast',
  responsive: 'responsiveClasses',
  'match-text': 'matchText',
};
const entries = COMPONENTS.map((c) => ({
  ...c,
  id: UI_PAGES.find((p) => p.folder === c.folder).id,
  importName: entryImports[c.folder] ?? c.name,
}));

function LibrarySection({ itemId }) {
  const component = entries.find((c) => c.id === itemId);
  return component ? <ComponentEntry c={component} idPrefix="ui" page /> : <ComponentIndex entries={entries} />;
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['ui-components'] = LibrarySection;

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
