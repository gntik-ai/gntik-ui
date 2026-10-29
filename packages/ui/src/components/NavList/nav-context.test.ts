import { matchesNavPath, matchesNavPattern, resolveCurrentNavItem, isNavItemCurrent, type NavItem } from './index';

describe('matchesNavPath', () => {
  it.each([
    ['/functions', '/functions/abc', true],
    ['/functions', '/functions-v2', false],
    ['/functions/', '/functions/?tab=a#logs', true],
    ['/', '/', true],
    ['/', '/?tab=a', true],
    ['/', '/functions', false],
  ])('prefix %s at %s is %s', (href, location, expected) => {
    expect(matchesNavPath(href, location, 'prefix')).toBe(expected);
  });

  it('keeps exact matching strict by default', () => {
    expect(matchesNavPath('/audit', '/audit')).toBe(true);
    expect(matchesNavPath('/audit', '/audit?page=2')).toBe(false);
    expect(matchesNavPath('/audit', '/audit/')).toBe(false);
    expect(matchesNavPath('/audit', '/audit#logs', 'exact')).toBe(false);
  });
});

describe('matchesNavPattern', () => {
  it.each([
    ['/projects/:id', '/projects/42', true],
    ['/projects/:id', '/projects/42/?tab=runs#logs', true],
    ['/projects/:id', '/projects', false],
    ['/projects/:id', '/projects/42/runs', false],
    ['/projects/:id', '/projects//', false],
    ['/projects/:id/*', '/projects/42/runs/7', true],
    ['/projects/:id/*', '/projects/42', true],
    ['/projects/:id/*', '/projects', false],
    ['/projects/*/runs', '/projects/42/runs', false],
    ['/projects/*/runs', '/projects/*/runs', true],
    ['/projects/[id]', '/projects/42', false],
    ['/projects/.*', '/projects/42', false],
    ['/projects/templates', '/projects/templates-v2', false],
    ['/', '/?tab=a', true],
    ['/', '/projects', false],
  ])('%s at %s is %s', (pattern, location, expected) => {
    expect(matchesNavPattern(pattern, location)).toBe(expected);
  });
});

describe('resolveCurrentNavItem', () => {
  const projects: NavItem = { label: 'Projects', href: '/projects', match: 'prefix' };
  const templates: NavItem = { label: 'Templates', href: '/projects/templates', match: 'prefix' };

  it('selects the longest prefix across groups and nested items', () => {
    const groups = [{ items: [projects] }, { items: [{ label: 'Library', items: [templates] }] }];
    expect(resolveCurrentNavItem(groups, '/projects/templates/7')).toBe(templates);
  });

  it('ranks an exact href before a longer pattern and keeps document order for ties', () => {
    const pattern = { label: 'Pattern', pattern: '/projects/:id/*' };
    const sameLength = { label: 'Other', pattern: '/projects/*' };
    expect(resolveCurrentNavItem([{ items: [pattern, templates] }], '/projects/templates')).toBe(templates);
    expect(resolveCurrentNavItem([{ items: [projects, sameLength] }], '/projects/42')).toBe(sameLength);
    const first = { label: 'Nested first', pattern: '/projects/:id' };
    const groups = [{ items: [{ label: 'Section', items: [first] }] }, { items: [sameLength] }];
    expect(resolveCurrentNavItem(groups, '/projects/42')).toBe(first);
  });

  it('uses only matching array entries to rank patterns', () => {
    const array = { label: 'Array', pattern: ['/unmatched/deep/path/*', '/projects/*'] };
    const specific = { label: 'Specific', pattern: '/projects/:id/*' };
    expect(resolveCurrentNavItem([{ items: [array] }], '/projects/42')).toBe(array);
    expect(resolveCurrentNavItem([{ items: [array, specific] }], '/projects/42/runs')).toBe(specific);
  });

  it('inherits the list match while respecting an exact item override', () => {
    const inherited = { label: 'Inherited', href: '/settings' };
    const exact: NavItem = { label: 'Exact', href: '/audit', match: 'exact' };
    const groups = [{ items: [inherited, exact] }];
    expect(resolveCurrentNavItem(groups, '/settings/general', 'prefix')).toBe(inherited);
    expect(resolveCurrentNavItem(groups, '/audit/42', 'prefix')).toBeUndefined();
    expect(resolveCurrentNavItem(groups, '/audit', 'prefix')).toBe(exact);
    expect(resolveCurrentNavItem(groups, '/settings/general')).toBeUndefined();
    expect(resolveCurrentNavItem(groups)).toBeUndefined();
  });

  it('excludes explicit flags and suppresses computation for any explicit current item', () => {
    const off = { ...templates, current: false };
    const on = { label: 'Overview', current: true };
    expect(resolveCurrentNavItem([{ items: [projects, off] }], '/projects/templates')).toBe(projects);
    expect(
      resolveCurrentNavItem([{ items: [projects] }, { items: [{ label: 'More', items: [on] }] }], '/projects/42'),
    ).toBeUndefined();
    expect(isNavItemCurrent(on, '/elsewhere')).toBe(true);
    expect(isNavItemCurrent(off, '/projects/templates')).toBe(false);
  });

  it('keeps isNavItemCurrent compatible while allowing patterns and a match default', () => {
    expect(isNavItemCurrent({ label: 'Audit', href: '/audit' }, '/audit?page=2')).toBe(false);
    expect(isNavItemCurrent({ label: 'Audit', href: '/audit' }, '/audit/42', 'prefix')).toBe(true);
    expect(isNavItemCurrent({ label: 'Project', pattern: ['/other/:id', '/projects/:id'] }, '/projects/42')).toBe(true);
    expect(isNavItemCurrent({ label: 'Off', pattern: '/*', current: false }, '/projects/42')).toBe(false);
  });
});

it('keeps the first exact href match even when a later exact item has a longer matching pattern', () => {
  const first = { label: 'First', href: '/projects/42' };
  const second = { label: 'Second', href: '/projects/42', pattern: '/projects/:id/*' };
  expect(resolveCurrentNavItem([{ items: [first] }, { items: [second] }], '/projects/42')).toBe(first);
});
