// Pure hash routing shared by the shell and Node tests. Registry ids stay case-sensitive.
const kinds = { 'ui-components': 'component', blocks: 'block', layouts: 'layout', templates: 'template' };
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
