import { chartFmt } from '@gntik-ai/charts';
import { formatBytes } from '@gntik-ai/ui';

describe('byte formatter parity', () => {
  it.each([0, 512, 999, 1536, 999_999, 1_840_000, 2_540_000_000])('agrees with chart sizes for %s bytes', (size) => {
    expect(formatBytes(size, 'en')).toBe(chartFmt.bytes(size));
  });
});
