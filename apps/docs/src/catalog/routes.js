export const itemSections = ['ui-components', 'blocks', 'layouts', 'templates'];

export const routeHash = (section, id) => `#${section}${id ? `/${encodeURIComponent(id)}` : ''}`;

/** Pure hash parsing, shared by direct loads, hashchange and programmatic navigation. */
export function parseRoute(hash, sections, items) {
  const fallback = { section: 'overview', id: null, item: null };
  let value;
  try {
    value = decodeURIComponent(hash.replace(/^#/, ''));
  } catch {
    return fallback;
  }
  if (value.startsWith('ui-')) {
    const legacy = items.find((i) => i.section === 'ui-components' && i.folder === value.slice(3));
    if (legacy) return { section: legacy.section, id: legacy.id, item: legacy };
  }
  const [section, id, extra] = value.split('/');
  if (!sections.includes(section) || extra !== undefined || (id !== undefined && !/^[\w-]+$/.test(id))) return fallback;
  if (id && !itemSections.includes(section)) return fallback;
  return { section, id: id ?? null, item: items.find((i) => i.section === section && i.id === id) ?? null };
}
