import { measureJsonDisplay } from './json-model';

describe('measureJsonDisplay', () => {
  it('measures strings as-is and other values as two-space JSON', () => {
    expect(measureJsonDisplay('"hi"', 4)).toEqual({
      text: '"hi"',
      displayText: '"hi"',
      truncated: false,
      empty: false,
    });
    expect(measureJsonDisplay({ a: 1 }, 20)).toEqual({
      text: '{\n  "a": 1\n}',
      displayText: '{\n  "a": 1\n}',
      truncated: false,
      empty: false,
    });
    expect(measureJsonDisplay('abcde', 4)).toEqual({
      text: 'abcde',
      displayText: 'abcd…',
      truncated: true,
      empty: false,
    });
  });

  it('keeps complete supplementary characters and drops a trailing high surrogate at the cut', () => {
    const exact = 'a'.repeat(4094) + '😀';
    expect(measureJsonDisplay(exact, 4096)?.displayText).toBe(exact);
    expect(measureJsonDisplay(exact, 4096)?.truncated).toBe(false);
    const split = measureJsonDisplay('a'.repeat(4095) + '😀', 4096);
    expect(split?.displayText).toBe('a'.repeat(4095) + '…');
    expect(split?.truncated).toBe(true);
    expect(split?.displayText).not.toMatch(/[\uD800-\uDFFF]/);
    // The pretty-JSON prefix takes ten units; the high surrogate lands at unit 4096.
    expect(measureJsonDisplay({ a: 'a'.repeat(4085) + '😀' }, 4096)?.displayText).toBe(
      '{\n  "a": "' + 'a'.repeat(4085) + '…',
    );
  });

  it.each([null, undefined, ''])('treats %s as empty in capped mode', (value) => {
    expect(measureJsonDisplay(value, 4096)).toEqual({
      text: '',
      displayText: '',
      truncated: false,
      empty: true,
    });
  });

  it.each([undefined, 0, -1, 1.5, NaN, Infinity])('ignores invalid or unset caps (%s) without measuring', (cap) => {
    const value = {
      toJSON: () => {
        throw new Error('must not serialize');
      },
    };
    expect(measureJsonDisplay(value, cap)).toBeUndefined();
  });
});
