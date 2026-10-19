import { describe, expect, it } from 'vitest';
import { getPointer, setPointer } from './pointer';

describe('surface JSON Pointer bindings', () => {
  it('reads and immutably writes model values, escaped keys and array indices', () => {
    const original = { user: { name: 'Ana' }, 'a/b': { '~key': ['first'] } };
    const changed = setPointer(original, '/user/name', 'Ana López');
    expect(getPointer(changed, '/user/name')).toBe('Ana López');
    expect(original.user.name).toBe('Ana');
    expect(getPointer(original, '/a~1b/~0key/0')).toBe('first');
    expect(getPointer(original, '/missing')).toBeUndefined();
    expect(getPointer(setPointer(original, '/a~1b/~0key/1', 'second'), '/a~1b/~0key')).toEqual(['first', 'second']);
    expect(setPointer({}, '/new/name', 'Ana')).toEqual({ new: { name: 'Ana' } });
    expect(getPointer(original, '')).toBe(original);
    expect(setPointer(original, '', { replaced: true })).toEqual({ replaced: true });
  });
  it('rejects prototype keys, malformed escapes, excessive depth and inherited reads', () => {
    for (const path of [
      '/__proto__/polluted',
      '/constructor/prototype/polluted',
      '/prototype',
      '/a~2b',
      'name',
      '/' + Array(66).fill('a').join('/'),
    ]) {
      expect(() => getPointer({}, path)).toThrow();
      expect(() => setPointer({}, path, true)).toThrow();
    }
    expect(getPointer(Object.create({ secret: 'inherited' }), '/secret')).toBeUndefined();
    expect(Object.hasOwn(Object.prototype, 'polluted')).toBe(false);
    expect(() => setPointer([], '/999999999', 'large')).toThrow();
  });
});
