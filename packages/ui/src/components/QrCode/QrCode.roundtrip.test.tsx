import jsQR from 'jsqr';
import { render, screen } from '@testing-library/react';
import { QrCode } from './QrCode';
import { byteCapacity, encodeQr, type QrErrorLevel, type QrMatrix } from './qr-encoder';

const OTPAUTH = 'otpauth://totp/Example:ana@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example';
const FIXTURES = ['HELLO', OTPAUTH, 'Configuración ñ'];
const LEVELS: QrErrorLevel[] = ['L', 'M', 'Q', 'H'];
const SCALE = 4;
const QUIET = 4;

/** Dark modules to an RGBA raster (dark on white) with a quiet zone, as a camera would see it. */
function raster(isDark: (x: number, y: number) => boolean, size: number) {
  const side = (size + QUIET * 2) * SCALE;
  const pixels = new Uint8ClampedArray(side * side * 4).fill(255);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      if (!isDark(x, y)) continue;
      for (let dy = 0; dy < SCALE; dy++)
        for (let dx = 0; dx < SCALE; dx++) {
          const offset = ((y + QUIET) * SCALE + dy) * side * 4 + ((x + QUIET) * SCALE + dx) * 4;
          pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = 0;
        }
    }
  return { pixels, side };
}

function decode(isDark: (x: number, y: number) => boolean, size: number): string | null {
  const { pixels, side } = raster(isDark, size);
  const result = jsQR(pixels, side, side);
  return result ? new TextDecoder().decode(Uint8Array.from(result.binaryData)) : null;
}

const decodeMatrix = (matrix: QrMatrix) => decode((x, y) => matrix.modules[y]![x]!, matrix.size);

describe('QrCode round trip', () => {
  describe.each(FIXTURES)('%s', (value) => {
    it.each(LEVELS)('decodes back to the exact input at level %s', (level) => {
      expect(decodeMatrix(encodeQr(value, level))).toBe(value);
    });

    it('has at least as many modules at level H as at level L', () => {
      expect(encodeQr(value, 'H').size).toBeGreaterThanOrEqual(encodeQr(value, 'L').size);
    });
  });

  it('decodes the path that the component renders', () => {
    const { container } = render(<QrCode value={OTPAUTH} errorLevel="Q" />);
    const [, , total] = screen.getByRole('img').getAttribute('viewBox')!.split(' ').map(Number);
    const size = total! - QUIET * 2;
    const dark = new Set<string>();
    for (const [, x, y, length] of container
      .querySelector('path')!
      .getAttribute('d')!
      .matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g))
      for (let i = 0; i < Number(length); i++) dark.add(`${Number(x) - QUIET + i},${Number(y) - QUIET}`);
    expect(decode((x, y) => dark.has(`${x},${y}`), size)).toBe(OTPAUTH);
  });

  it.each(LEVELS)(
    'decodes a value that fills the largest version of each size class at level %s',
    (level) => {
      for (const version of [2, 7, 10, 14, 21, 28, 35, 40]) {
        const value = Array.from({ length: byteCapacity(version, level) }, (_, i) =>
          String.fromCharCode(33 + ((i * 7) % 90)),
        ).join('');
        const matrix = encodeQr(value, level);
        expect(matrix.version).toBe(version);
        expect(decodeMatrix(matrix)).toBe(value);
      }
    },
    120_000,
  );
});
