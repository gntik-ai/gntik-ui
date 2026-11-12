import { tokenColor } from '@gntik-ai/tokens/runtime';
import { encodeQr, type QrErrorLevel, type QrMatrix } from './qr-encoder';

export const QR_DEFAULT_SIZE = 160;
export const QR_DEFAULT_MARGIN = 4;
export const QR_DEFAULT_LEVEL: QrErrorLevel = 'M';

/** Normalises a quiet zone to a whole, non-negative number of modules. */
export function qrMargin(margin: number | undefined): number {
  return Number.isFinite(margin) ? Math.max(0, Math.floor(margin!)) : QR_DEFAULT_MARGIN;
}

/**
 * One path for every dark module: each horizontal run of dark modules is a single closed rectangle,
 * offset by the quiet zone, so a code is one DOM node rather than one node per module.
 */
export function qrModulePath(matrix: QrMatrix, margin: number): string {
  const parts: string[] = [];
  matrix.modules.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      if (!row[x]) {
        x++;
        continue;
      }
      let end = x;
      while (end < row.length && row[end]) end++;
      parts.push(`M${x + margin} ${y + margin}h${end - x}v1h${x - end}z`);
      x = end;
    }
  });
  return parts.join('');
}

export interface QrCodeSvgOptions {
  /** Rendered width and height in px. Default 160. */
  size?: number;
  /** Error correction level. Default `M`. */
  errorLevel?: QrErrorLevel;
  /** Quiet zone in modules. Default 4. */
  margin?: number;
  /** CSS colour of the dark modules. Default: the `qr-module` token read from the page. */
  moduleColor?: string;
  /** CSS colour behind the modules. Default: the `qr-surface` token read from the page. */
  surfaceColor?: string;
  /** Accessible name. Without it the SVG carries no role or name. */
  label?: string;
}

const escapeAttribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A token colour, or undefined where the page has no tokens (server, detached document). */
function tokenOrUndefined(name: string): string | undefined {
  const color = tokenColor(name);
  return color === 'hsl()' ? undefined : color;
}

/**
 * Standalone SVG markup of a QR code: no class names, no external styles, so it can be saved or
 * embedded as is. Colours are the two given ones or the live `qr-module` / `qr-surface` tokens.
 * Throws `QrCapacityError` (a `RangeError`) when `value` does not fit a version 40 code.
 *
 * A code that carries a secret (an otpauth URI) writes that secret to disk when it is saved.
 */
export function qrCodeSvg(value: string, options: QrCodeSvgOptions = {}): string {
  const { size = QR_DEFAULT_SIZE, errorLevel = QR_DEFAULT_LEVEL, label } = options;
  const margin = qrMargin(options.margin);
  const matrix = encodeQr(value, errorLevel);
  const total = matrix.size + margin * 2;
  const moduleColor = options.moduleColor ?? tokenOrUndefined('qr-module') ?? 'currentColor';
  const surfaceColor = options.surfaceColor ?? tokenOrUndefined('qr-surface');
  const name = label === undefined ? '' : ` role="img" aria-label="${escapeAttribute(label)}"`;
  const background = surfaceColor
    ? `<rect width="${total}" height="${total}" fill="${escapeAttribute(surfaceColor)}"/>`
    : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${total} ${total}" ` +
    `shape-rendering="crispEdges"${name}>${background}` +
    `<path fill="${escapeAttribute(moduleColor)}" d="${qrModulePath(matrix, margin)}"/></svg>`
  );
}
