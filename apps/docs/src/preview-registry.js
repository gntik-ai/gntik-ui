// Lazy loaders for everything the viewers can preview, keyed by kind → id (the ids of
// kit-registry.json). Blocks render with their built-in fixtures; templates and layout
// examples are default exports.
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const blockModules = import.meta.glob('../../../packages/blocks/src/*/*/*.tsx');
const blockMetas = import.meta.glob('../../../packages/blocks/src/*/*/block.meta.ts', { eager: true, import: 'meta' });
const templateModules = import.meta.glob('../../../packages/templates/src/*/Page.tsx');
const templateMetas = import.meta.glob('../../../packages/templates/src/*/template.meta.ts', { eager: true, import: 'meta' });
const layoutExamples = import.meta.glob('../../../packages/ui/src/layouts/*/examples/*.tsx');
const layoutDocs = import.meta.glob('../../../packages/ui/src/layouts/*/*.doc.ts', { eager: true, import: 'doc' });
const sourcesRaw = {
  ...import.meta.glob('../../../packages/blocks/src/*/*/*.tsx', { query: '?raw', import: 'default' }),
  ...import.meta.glob('../../../packages/templates/src/*/Page.tsx', { query: '?raw', import: 'default' }),
  ...import.meta.glob('../../../packages/ui/src/layouts/*/examples/*.tsx', { query: '?raw', import: 'default' }),
};

const BLOCKS = Object.entries(blockMetas).map(([metaPath, meta]) => {
  const dir = metaPath.slice(0, metaPath.lastIndexOf('/'));
  const name = dir.slice(dir.lastIndexOf('/') + 1);
  const family = dir.split('/').at(-2);
  const file = `${dir}/${name}.tsx`;
  return { id: kebab(name), name, family, meta, file, load: blockModules[file] };
}).filter((b) => b.load).sort((a, b) => a.family.localeCompare(b.family) || a.name.localeCompare(b.name));

const TEMPLATES = Object.entries(templateMetas).map(([metaPath, meta]) => {
  const dir = metaPath.slice(0, metaPath.lastIndexOf('/'));
  const id = dir.slice(dir.lastIndexOf('/') + 1);
  const file = `${dir}/Page.tsx`;
  return { id, meta, file, load: templateModules[file] };
}).filter((t) => t.load);

const LAYOUTS = Object.entries(layoutDocs).flatMap(([docPath, doc]) => {
  const dir = docPath.slice(0, docPath.lastIndexOf('/'));
  const folder = dir.slice(dir.lastIndexOf('/') + 1);
  return Object.keys(layoutExamples).filter((p) => p.startsWith(dir + '/examples/')).sort().map((file) => {
    const example = file.slice(file.lastIndexOf('/') + 1, -4);
    return { id: `${kebab(folder)}--${kebab(example)}`, layout: folder, example, doc, file, load: layoutExamples[file] };
  });
});

const named = (b) => () => b.load().then((m) => ({ default: m[b.name] ?? m.default }));

export const PREVIEW_LOADERS = {
  block: {
    ...Object.fromEntries(BLOCKS.map((b) => [b.id, named(b)])),
    'status-timeline--empty': () => import('../../../packages/blocks/src/data-display/StatusTimeline/examples/Empty'),
    'sign-in-form--username': () => import('../../../packages/blocks/src/auth/SignInForm/examples/Username'),
    'forgot-password-form--username-or-email': () => import('../../../packages/blocks/src/auth/ForgotPasswordForm/examples/UsernameOrEmail'),
  },
  template: {
    ...Object.fromEntries(TEMPLATES.map((t) => [t.id, t.load])),
    'sign-in-card--username': () => import('../../../packages/templates/src/sign-in-card/examples/Username'),
    'forgot-password--username-or-email': () => import('../../../packages/templates/src/forgot-password/examples/UsernameOrEmail'),
    'public-hub--full': () => import('../../../packages/templates/src/public-hub/examples/Full'),
    'public-hub--minimal': () => import('../../../packages/templates/src/public-hub/examples/Minimal'),
    'public-hub--loading': () => import('../../../packages/templates/src/public-hub/examples/Loading'),
    'public-hub--minimal-loading': () => import('../../../packages/templates/src/public-hub/examples/MinimalLoading'),
  },
  layout: Object.fromEntries(LAYOUTS.map((l) => [l.id, l.load])),
};
export const CATALOG = { blocks: BLOCKS, templates: TEMPLATES, layouts: LAYOUTS };
export const loadSource = (file) => (sourcesRaw[file] ? sourcesRaw[file]() : Promise.resolve(''));
