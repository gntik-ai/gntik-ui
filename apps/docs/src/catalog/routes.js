// Pure hash routing shared by the shell and Node tests. Registry ids stay case-sensitive.
export const SECTION_BY_KIND = {
  component: 'ui-components',
  block: 'blocks',
  layout: 'layouts',
  template: 'templates',
};
const kinds = Object.fromEntries(Object.entries(SECTION_BY_KIND).map(([kind, section]) => [section, kind]));
export function parseRoute(hash, sections) {
  const [section, id] = hash.replace(/^#/, '').split('/');
  return sections.includes(section) ? { section, id: id || null } : { section: 'overview', id: null };
}
export function resolveRoute(route, items) {
  const kind = kinds[route.section];
  const item =
    route.id && kind
      ? (items.find(
          (i) =>
            i.id === route.id && i.kind === kind && (kind !== 'component' || (i.package === '@gntik-ai/ui' && i.docs)),
        ) ?? null)
      : null;
  return { ...route, item, notice: route.id && !item ? `No ${kind ?? 'item'} named ${route.id}` : null };
}
export function itemForDoc(path, items) {
  return items.find((i) => i.docs === path.replace(/^(?:\.\.\/)+/, ''));
}

// Flat docs (forms, hooks, utilities and theme parts) also need pages, but are
// not separate installables. Keep these records local to the docs catalog.
export function componentItemForDoc(path, doc, items) {
  return (
    itemForDoc(path, items) ?? {
      id: path
        .split('/')
        .pop()
        .replace(/\.doc\.ts$/, '')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase(),
      kind: 'component',
      package: '@gntik-ai/ui',
      docs: path.replace(/^(?:\.\.\/)+/, ''),
      ...doc,
    }
  );
}
