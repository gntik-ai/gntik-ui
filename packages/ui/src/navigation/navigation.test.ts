import { getActivePage, navFromRoutes, type NavRoute } from './route-tree';

const routes: NavRoute[] = [
  {
    path: '/functions',
    title: 'Functions',
    group: 'Build',
    hideChildrenInMenu: true,
    children: [{ path: '/functions/:id', title: (p) => p.id ?? '', hideInMenu: true }],
  },
  { path: '/workflows', title: 'Workflows', group: 'Build' },
  { path: '/logs', title: 'Logs', group: 'Operate' },
];

describe('navFromRoutes', () => {
  it('returns one NavGroup per top-level group, in route order, with hrefs equal to the paths', () => {
    const groups = navFromRoutes(routes);
    expect(groups.map((g) => g.label)).toEqual(['Build', 'Operate']);
    expect(groups[0]!.items.map((i) => [i.label, i.href])).toEqual([
      ['Functions', '/functions'],
      ['Workflows', '/workflows'],
    ]);
    expect(groups[1]!.items.map((i) => [i.label, i.href])).toEqual([['Logs', '/logs']]);
  });

  it('leaves out hideInMenu routes and the children of hideChildrenInMenu routes', () => {
    const groups = navFromRoutes([...routes, { path: '/secret', title: 'Secret', group: 'Operate', hideInMenu: true }]);
    const labels = groups.flatMap((g) => g.items.map((i) => i.label));
    expect(labels).toEqual(['Functions', 'Workflows', 'Logs']);
    expect(groups[0]!.items[0]!.items).toBeUndefined();
  });

  it('nests visible children under their parent', () => {
    const [group] = navFromRoutes([
      {
        path: '/observe',
        title: 'Observe',
        children: [
          { path: '/observe/logs', title: 'Logs' },
          { path: '/observe/traces', title: 'Traces' },
        ],
      },
    ]);
    expect(group!.label).toBeUndefined();
    expect(group!.items[0]!.items!.map((i) => i.label)).toEqual(['Logs', 'Traces']);
  });

  it('lifts flatMenu children to the parent level without the parent', () => {
    const [group] = navFromRoutes([
      { path: '/home', title: 'Home', group: 'Main' },
      {
        path: '/observe',
        title: 'Observe',
        group: 'Main',
        flatMenu: true,
        children: [
          { path: '/observe/logs', title: 'Logs' },
          { path: '/observe/traces', title: 'Traces' },
        ],
      },
    ]);
    expect(group!.items.map((i) => i.label)).toEqual(['Home', 'Logs', 'Traces']);
  });

  it('leaves out a flatMenu parent whatever is left of its children', () => {
    const items = (tree: NavRoute[]) => navFromRoutes(tree).flatMap((g) => g.items.map((i) => i.label));
    expect(
      items([
        { path: '/a', title: 'A', flatMenu: true },
        { path: '/b', title: 'B' },
      ]),
    ).toEqual(['B']);
    expect(
      items([
        { path: '/a', title: 'A', flatMenu: true, hideChildrenInMenu: true, children: [{ path: '/a/x', title: 'X' }] },
        { path: '/b', title: 'B' },
      ]),
    ).toEqual(['B']);
    expect(
      items([
        { path: '/a', title: 'A', flatMenu: true, children: [{ path: '/a/x', title: 'X', hideInMenu: true }] },
        { path: '/b', title: 'B' },
      ]),
    ).toEqual(['B']);
  });

  it('carries icon, badge and match onto the item, and uses the path as pattern for dynamic paths', () => {
    const icon = () => null;
    const [group] = navFromRoutes([
      { path: '/runs', title: 'Runs', icon, badge: 3, match: 'prefix' },
      { path: '/projects/:id/*', title: 'Project' },
    ]);
    expect(group!.items[0]).toMatchObject({ label: 'Runs', href: '/runs', icon, badge: 3, match: 'prefix' });
    expect(group!.items[1]).toMatchObject({ href: '/projects/:id/*', pattern: '/projects/:id/*' });
  });
});

describe('getActivePage', () => {
  it('passes the route params to every functional title, without evaluating unrelated menu labels', () => {
    const tree: NavRoute[] = [
      { path: '/logs', title: 'Logs' },
      {
        path: '/projects/:id',
        title: (p) => p.id!.toUpperCase(),
        children: [
          { path: '/projects/:id/settings', title: (p) => `${p.id!.toUpperCase()} settings`, hideInMenu: true },
        ],
      },
    ];
    const page = getActivePage(tree, '/logs');
    expect(page?.title).toBe('Logs');
    const settings = getActivePage(tree, '/projects/abc/settings');
    expect(settings?.title).toBe('ABC settings');
    expect(settings?.menuHref).toBe('/projects/abc');
    expect(settings?.breadcrumbs).toEqual([{ label: 'ABC', href: '/projects/abc' }, { label: 'ABC settings' }]);
  });

  it('fills ancestor paths and titles from the pathname when a static child sits under a dynamic route', () => {
    const tree: NavRoute[] = [
      {
        path: '/projects/:id/*',
        title: (p) => `Project ${p.id}`,
        children: [
          {
            path: '/projects/acme/settings',
            title: 'Settings',
            hideInMenu: true,
            children: [{ path: '/projects/acme/settings/details', title: 'Details', hideInMenu: true }],
          },
        ],
      },
    ];
    const page = getActivePage(tree, '/projects/acme/settings/details');
    expect(page?.menuHref).toBe('/projects/acme');
    expect(page?.breadcrumbs).toEqual([
      { label: 'Project acme', href: '/projects/acme' },
      { label: 'Settings', href: '/projects/acme/settings' },
      { label: 'Details' },
    ]);
  });

  it('resolves a hidden detail route with params, menuHref and breadcrumbs, ignoring query and hash', () => {
    const page = getActivePage(routes, '/functions/fn-42?tab=logs#top');
    expect(page).toMatchObject({
      title: 'fn-42',
      path: '/functions/fn-42',
      params: { id: 'fn-42' },
      menuHref: '/functions',
      breadcrumbs: [{ label: 'Functions', href: '/functions' }, { label: 'fn-42' }],
    });
    expect(page!.breadcrumbs[1]).not.toHaveProperty('href');
    expect(page!.route.path).toBe('/functions/:id');
  });

  it('matches an exact static route with itself as menuHref', () => {
    const page = getActivePage(routes, '/functions');
    expect(page).toMatchObject({ title: 'Functions', params: {}, menuHref: '/functions' });
    expect(page!.breadcrumbs).toEqual([{ label: 'Functions' }]);
  });

  it('keeps the segment boundary and returns null for unknown paths', () => {
    expect(getActivePage(routes, '/functions-v2')).toBeNull();
    expect(getActivePage(routes, '/nope')).toBeNull();
  });

  it('prefers an exact path over a pattern, and the longest prefix over a shorter one', () => {
    const tree: NavRoute[] = [
      { path: '/files', title: 'Files', match: 'prefix' },
      { path: '/files/shared', title: 'Shared', match: 'prefix' },
      { path: '/files/new', title: 'New file' },
      { path: '/files/:id', title: (p) => `File ${p.id}` },
    ];
    expect(getActivePage(tree, '/files/new')!.title).toBe('New file');
    expect(getActivePage(tree, '/files/abc')!.title).toBe('File abc');
    expect(getActivePage(tree, '/files/shared/deep/path')!.title).toBe('Shared');
    expect(getActivePage(tree, '/files/a/b')!.title).toBe('Files');
  });

  it('decodes params and fills ancestor paths with them', () => {
    const tree: NavRoute[] = [
      {
        path: '/projects/:project',
        title: (p) => `Project ${p.project}`,
        children: [{ path: '/projects/:project/runs/:run', title: (p) => `Run ${p.run}` }],
      },
    ];
    const page = getActivePage(tree, '/projects/my%20app/runs/7');
    expect(page!.params).toEqual({ project: 'my app', run: '7' });
    expect(page!.breadcrumbs).toEqual([{ label: 'Project my app', href: '/projects/my%20app' }, { label: 'Run 7' }]);
  });

  it('never activates external routes', () => {
    const tree: NavRoute[] = [{ path: '/docs', title: 'Docs', target: '_blank' }];
    expect(getActivePage(tree, '/docs')).toBeNull();
  });

  it('skips hideInBreadcrumb levels and prepends home', () => {
    const tree: NavRoute[] = [
      {
        path: '/settings',
        title: 'Settings',
        hideInBreadcrumb: true,
        children: [{ path: '/settings/profile', title: 'Profile' }],
      },
    ];
    const page = getActivePage(tree, '/settings/profile', { home: { label: 'Home', href: '/' } });
    expect(page!.breadcrumbs).toEqual([{ label: 'Home', href: '/' }, { label: 'Profile' }]);
  });

  it('selects the nearest ancestor visible in the menu, skipping a flatMenu parent', () => {
    const tree: NavRoute[] = [
      { path: '/a', title: 'A', hideInMenu: true, children: [{ path: '/a/b', title: 'B', hideInMenu: true }] },
      {
        path: '/observe',
        title: 'Observe',
        flatMenu: true,
        children: [
          {
            path: '/observe/logs',
            title: 'Logs',
            children: [{ path: '/observe/logs/:id', title: 'Log', hideInMenu: true }],
          },
        ],
      },
    ];
    expect(getActivePage(tree, '/a/b')!.menuHref).toBeUndefined();
    expect(getActivePage(tree, '/observe/logs/9')!.menuHref).toBe('/observe/logs');
    expect(getActivePage(tree, '/observe')!.menuHref).toBeUndefined();
  });
});
