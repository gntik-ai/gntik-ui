import registry from '../../../../kit-registry.json';

const docs = import.meta.glob(
  '../../../../packages/ui/src/{components/*,forms,forms/schema-form,utils,theme,csp,kit,navigation}/*.doc.ts',
  {
    eager: true,
    import: 'doc',
  },
);
export const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// Registry ids win. Flat documentation entries (forms, utilities) also get a page.
export const UI_PAGES = Object.entries(docs).map(([path, doc]) => {
  const docPath = path.slice(path.indexOf('packages/'));
  const item = registry.items.find((i) => i.docs === docPath);
  const folder = path.split('/').at(-1).replace('.doc.ts', '');
  return { section: 'ui-components', id: item?.id ?? kebab(folder), name: doc.name, folder, docPath };
});

// The hooks entry (@gntik-ai/ui/hooks) has its own Library page, one sub-page per HookDoc.
const hookDocs = import.meta.glob('../../../../packages/ui/src/hooks/*.doc.ts', { eager: true, import: 'doc' });
export const HOOK_PAGES = Object.entries(hookDocs).map(([path, doc]) => {
  const folder = path.split('/').at(-1).replace('.doc.ts', '');
  return {
    section: 'ui-hooks',
    id: kebab(folder),
    name: doc.name,
    folder,
    docPath: path.slice(path.indexOf('packages/')),
  };
});

const sectionByKind = { block: 'blocks', layout: 'layouts', template: 'templates' };
export const ITEM_PAGES = [
  ...UI_PAGES,
  ...HOOK_PAGES,
  ...registry.items
    .filter((i) => sectionByKind[i.kind])
    .map((i) => ({
      section: sectionByKind[i.kind],
      id: i.id,
      name: i.name,
    })),
];
