import { matchesCombo, parseHotkey } from './parse-hotkey';

describe('hotkey syntax', () => {
  it('parses combos, sequences, alternatives and display keys', () => {
    const alternatives = parseHotkey('mod+k, g d');
    expect(alternatives.map(({ keys, then }) => ({ keys, then }))).toEqual([
      { keys: ['mod', 'K'], then: undefined },
      { keys: ['G'], then: ['D'] },
    ]);
    expect(parseHotkey('shift+alt+p')[0]?.keys).toEqual(['⇧', 'Alt', 'P']);
  });

  it.each([
    ['escape', 'Escape'],
    ['enter', 'Enter'],
    ['space', ' '],
    ['plus', '+'],
    ['arrowup', 'ArrowUp'],
  ])('matches the named key %s', (binding, key) => {
    const combo = parseHotkey(binding)[0]!.steps[0]!;
    expect(matchesCombo(combo, new KeyboardEvent('keydown', { key, shiftKey: key === '+' }))).toBe(true);
  });

  it('ignores Shift for symbols but matches other modifiers exactly', () => {
    expect(
      matchesCombo(parseHotkey('?')[0]!.steps[0]!, new KeyboardEvent('keydown', { key: '?', shiftKey: true })),
    ).toBe(true);
    expect(
      matchesCombo(
        parseHotkey('ctrl+k')[0]!.steps[0]!,
        new KeyboardEvent('keydown', { key: 'K', ctrlKey: true, shiftKey: true }),
      ),
    ).toBe(false);
  });

  it('uses physical letters and digits for non-Latin layouts and Option', () => {
    expect(matchesCombo(parseHotkey('g')[0]!.steps[0]!, new KeyboardEvent('keydown', { key: 'п', code: 'KeyG' }))).toBe(
      true,
    );
    expect(
      matchesCombo(
        parseHotkey('alt+p')[0]!.steps[0]!,
        new KeyboardEvent('keydown', { key: 'π', code: 'KeyP', altKey: true }),
      ),
    ).toBe(true);
    expect(
      matchesCombo(parseHotkey('1')[0]!.steps[0]!, new KeyboardEvent('keydown', { key: '١', code: 'Digit1' })),
    ).toBe(true);
    expect(matchesCombo(parseHotkey('g')[0]!.steps[0]!, new KeyboardEvent('keydown', { key: 'x', code: 'KeyG' }))).toBe(
      false,
    );
  });
});
