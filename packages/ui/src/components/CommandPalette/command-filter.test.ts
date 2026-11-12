import { filterCommandGroups, filterCommandGroupsWithTotal, type CommandGroup } from './command-filter';

const item = (id: string, label = id) => ({ id, label });
const ids = (groups: ReturnType<typeof filterCommandGroups>) => groups.map((g) => g.items.map((e) => e.item.id));

const groups: CommandGroup[] = [
  { label: 'A', items: [item('run-a'), item('beta'), item('run-b')] },
  { label: 'B', items: [item('rerun'), item('run-c')] },
];

describe('filterCommandGroups with a custom scorer', () => {
  it('replaces scoreCommand: below 0 hides, higher ranks first', () => {
    const score = (i: { id: string }, q: string) => (i.id.startsWith(q) ? (i.id === 'run-b' ? 2 : 1) : -1);
    expect(ids(filterCommandGroups(groups, 'run', [], 'Recent', undefined, { score }))).toEqual([
      ['run-b', 'run-a'],
      ['run-c'],
    ]);
  });

  it('keeps the given order for ties, and for a scorer that always returns 0', () => {
    expect(ids(filterCommandGroups(groups, 'zzz', [], 'Recent', undefined, { score: () => 0 }))).toEqual([
      ['run-a', 'beta', 'run-b'],
      ['rerun', 'run-c'],
    ]);
  });

  it('passes the trimmed query to the scorer', () => {
    const score = vi.fn(() => 0);
    filterCommandGroups(groups, '  run ', [], 'Recent', undefined, { score });
    expect(score).toHaveBeenCalledWith(expect.objectContaining({ id: 'run-a' }), 'run');
  });

  it('applies the scorer to the empty query too: below 0 hides, recent stays first', () => {
    const score = vi.fn((i: { id: string }) => (i.id === 'beta' ? -1 : i.id === 'run-b' ? 2 : 1));
    const out = filterCommandGroups(groups, '', [item('r1')], 'Recent', undefined, { score });
    expect(ids(out)).toEqual([['r1'], ['run-b', 'run-a'], ['rerun', 'run-c']]);
    expect(score).toHaveBeenCalledWith(expect.objectContaining({ id: 'run-a' }), '');
  });

  it('hides every group item when the scorer rejects the empty query', () => {
    expect(ids(filterCommandGroups(groups, '', [], 'Recent', undefined, { score: () => -1 }))).toEqual([]);
  });

  it('without a scorer an empty query lists recent items and every group as given', () => {
    expect(ids(filterCommandGroups(groups, '  ', [item('r1')]))).toEqual([
      ['r1'],
      ['run-a', 'beta', 'run-b'],
      ['rerun', 'run-c'],
    ]);
  });
});

describe('filterCommandGroupsWithTotal limit', () => {
  it('cuts rows in display order across groups, recent included, and reports the total', () => {
    const out = filterCommandGroupsWithTotal(groups, '', [item('r1'), item('r2')], 'Recent', undefined, { limit: 4 });
    expect(ids(out.groups)).toEqual([
      ['r1', 'r2'],
      ['run-a', 'beta'],
    ]);
    expect(out.total).toBe(7);
  });

  it('drops groups that the limit empties', () => {
    const out = filterCommandGroupsWithTotal(groups, '', [], 'Recent', undefined, { limit: 3 });
    expect(ids(out.groups)).toEqual([['run-a', 'beta', 'run-b']]);
  });

  it('reports the total without a limit and leaves every row', () => {
    const out = filterCommandGroupsWithTotal(groups, '', [], 'Recent');
    expect(out.total).toBe(5);
    expect(ids(out.groups)).toEqual([
      ['run-a', 'beta', 'run-b'],
      ['rerun', 'run-c'],
    ]);
  });
});
