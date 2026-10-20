import { expectTypeOf } from 'vitest';
import { formatBytes as publicFormatBytes, type FormatBytesOptions } from '../index';
import { formatBytes, createFormatters } from './format';
import { en } from './messages/en';

describe('formatBytes', () => {
  it('exports the formatter once with both public call shapes', () => {
    expectTypeOf(publicFormatBytes).toEqualTypeOf<(value: number, options?: string | FormatBytesOptions) => string>();
    expect(publicFormatBytes(1536, 'en')).toBe('1.5 kB');
    expect(publicFormatBytes(1536, { locale: 'es' })).toBe('1,5 kB');
  });

  it.each([
    [0, '0 B'],
    [512, '512 B'],
    [999, '999 B'],
    [1536, '1.5 kB'],
    [999_999, '1 MB'],
    [1_840_000, '1.8 MB'],
    [2_540_000_000, '2.5 GB'],
    [-2048, '-2 kB'],
    [NaN, '—'],
    [Infinity, '—'],
    [-Infinity, '—'],
  ])('formats %s as %s', (value, expected) => {
    expect(formatBytes(value)).toBe(expected);
  });

  it('localizes decimal labels and numbers through Intl', () => {
    expect(formatBytes(1536, 'es')).toBe('1,5 kB');
    for (const locale of ['en', 'es']) {
      expect(formatBytes(25_000_000, { locale, unitDisplay: 'long' })).toBe('25 megabytes');
      expect(formatBytes(25_000_000, { locale, unitDisplay: 'narrow' })).toBe('25MB');
      expect(formatBytes(512, { locale })).toBe('512 B');
    }
    expect(formatBytes(1, { unitDisplay: 'long' })).toBe('1 byte');
    expect(formatBytes(512, { unitDisplay: 'narrow' })).toBe('512B');
  });

  it('uses fixed IEC symbols for binary multiples in every display', () => {
    expect(formatBytes(26_214_400, { base: 1024 })).toBe('25 MiB');
    expect(formatBytes(1536, { base: 1024, locale: 'es' })).toBe('1,5 KiB');
    for (const unitDisplay of ['short', 'long', 'narrow'] as const) {
      expect(formatBytes(1024 ** 3, { base: 1024, unitDisplay })).toBe('1 GiB');
    }
    expect(formatBytes(1024 ** 2 - 1, { base: 1024 })).toBe('1 MiB');
  });

  it('reads bits directly, ignores binary base and clamps at terabit', () => {
    expect(formatBytes(1500, { unit: 'bit', base: 1024 })).toBe('1.5 kb');
    expect(formatBytes(100_000_000, { unit: 'bit', unitDisplay: 'long' })).toBe('100 megabits');
    expect(formatBytes(1e15, { unit: 'bit' })).toBe('1,000 Tb');
    expect(formatBytes(1e15, { unit: 'bit', locale: 'es', unitDisplay: 'long' })).toBe('1000 terabits');
  });

  it('respects precision, drops trailing zeros and promotes after rounding', () => {
    expect(formatBytes(1536, { maximumFractionDigits: 2 })).toBe('1.54 kB');
    expect(formatBytes(1536, { maximumFractionDigits: 0 })).toBe('2 kB');
    expect(formatBytes(999_950, { maximumFractionDigits: 2 })).toBe('999.95 kB');
    expect(formatBytes(999_999.9994999999, { maximumFractionDigits: 6 })).toBe('1 MB');
    expect(formatBytes(999.9)).toBe('1 kB');
    expect(formatBytes(25_000_000, { maximumFractionDigits: 3 })).toBe('25 MB');
    expect(formatBytes(1e18)).toBe('1,000 PB');
  });

  it('binds provider locale and allows an explicit locale override', () => {
    const f = createFormatters('es', en);
    expect(f.formatBytes(1536)).toBe('1,5 kB');
    expect(f.formatBytes(1536, { locale: 'en' })).toBe('1.5 kB');
    expect(f.formatBytes(1536, { base: 1024 })).toBe('1,5 KiB');
  });
});
