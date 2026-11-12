import {
  byteCapacity,
  encodeQr,
  formatBits,
  QrCapacityError,
  rsRemainder,
  versionBits,
  type QrErrorLevel,
} from './qr-encoder';

const LEVELS: QrErrorLevel[] = ['L', 'M', 'Q', 'H'];

describe('qr-encoder', () => {
  it('computes the Reed–Solomon codewords of the ISO worked example (HELLO WORLD, version 1-M)', () => {
    const data = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17];
    expect(rsRemainder(data, 10)).toEqual([196, 35, 39, 119, 235, 215, 231, 226, 93, 23]);
  });

  it.each([
    ['M', 0, 0b101010000010010],
    ['L', 0, 0b111011111000100],
    ['Q', 0, 0b011010101011111],
    ['H', 0, 0b001011010001001],
  ] as const)('codes the format bits of level %s and mask %i', (level, mask, expected) => {
    expect(formatBits(level, mask)).toBe(expected);
  });

  it('codes the version bits for versions 7 and 40', () => {
    expect(versionBits(7)).toBe(0b000111110010010100);
    expect(versionBits(40)).toBe(0b101000110001101001);
  });

  it.each([
    [1, { L: 17, M: 14, Q: 11, H: 7 }],
    [5, { L: 106, M: 84, Q: 60, H: 44 }],
    [10, { L: 271, M: 213, Q: 151, H: 119 }],
    [40, { L: 2953, M: 2331, Q: 1663, H: 1273 }],
  ] as const)('holds the published byte capacity of version %i', (version, expected) => {
    for (const level of LEVELS) expect(byteCapacity(version, level)).toBe(expected[level]);
  });

  it('picks the smallest version that holds the value', () => {
    expect(encodeQr('HELLO', 'L')).toMatchObject({ version: 1, size: 21 });
    expect(encodeQr('a'.repeat(17), 'L').version).toBe(1);
    expect(encodeQr('a'.repeat(18), 'L')).toMatchObject({ version: 2, size: 25 });
  });

  it('counts UTF-8 bytes, not characters', () => {
    // 9 two-byte characters = 18 bytes, one more than version 1-L holds.
    expect(encodeQr('ñ'.repeat(9), 'L').version).toBe(2);
  });

  it('draws the three finder patterns, the timing pattern and the dark module', () => {
    const { size, modules } = encodeQr('HELLO', 'M');
    for (const [x, y] of [
      [0, 0],
      [size - 7, 0],
      [0, size - 7],
    ] as const) {
      expect(modules[y]![x]).toBe(true);
      expect(modules[y + 1]![x + 1]).toBe(false);
      expect(modules[y + 3]![x + 3]).toBe(true);
    }
    for (let i = 8; i < size - 8; i++) expect(modules[6]![i]).toBe(i % 2 === 0);
    expect(modules[size - 8]![8]).toBe(true);
  });

  it('is deterministic', () => {
    expect(encodeQr('otpauth://totp/x?secret=ABC', 'Q')).toEqual(encodeQr('otpauth://totp/x?secret=ABC', 'Q'));
  });

  it('encodes up to the version 40 capacity and rejects one byte more', () => {
    expect(encodeQr('a'.repeat(2953), 'L')).toMatchObject({ version: 40, size: 177 });
    expect(() => encodeQr('a'.repeat(2954), 'L')).toThrow(QrCapacityError);
    expect(() => encodeQr('a'.repeat(3000), 'H')).toThrow(RangeError);
  });
});
