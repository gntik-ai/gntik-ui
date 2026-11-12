import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'QrCode',
  group: 'Display',
  status: 'beta',
  description:
    'Scannable QR code for an otpauth URI, a pairing link or a share link. `value` is encoded as UTF-8 bytes at `errorLevel` (L, M, Q or H; default M) with a quiet zone of `margin` modules (default 4) and drawn as one `<svg role="img">` with a single `<path>` for every dark module, scaled to `size` px (default 160). The modules are always the dark colour of the `qr-module` / `qr-surface` token pair on a light square, in light, dark and high_contrast, because scanners are not required to read reversed codes; the light square is deliberate and stays inside the code\'s own box. The accessible name is `label` or the catalog "QR code". `status="loading"` sets `aria-busy` and shows a Spinner in place of the code; `status="expired"` removes every module from the DOM (an expired code can never be scanned), shows "QR code expired" and, only when `onRefresh` is set, a Refresh button that calls it once per activation. A value that does not fit a version 40 code at the chosen level renders a bordered "Too much content for a QR code" placeholder instead of an image and never throws; lower `errorLevel` to fit more. `qrCodeSvg(value, options?)` returns the same code as a standalone SVG string (no class names; `moduleColor` and `surfaceColor` are used when given, otherwise the live tokens are read with `tokenColor`; it throws a `RangeError` for an oversized value). Security: an otpauth URI carries the TOTP secret. The MFA example offers no download, and exporting such a code with `qrCodeSvg` writes the secret to disk: do not offer a download for it. Keep the text secret as the manual fallback next to the code. Fixed-size: the expired state needs about 140 px to fit its text and button.',
  pattern: 'img',
  anatomy: '<QrCode value="otpauth://totp/Example:ana@example.com?secret=…" label="Authenticator setup code" />',
  keyboard: [
    ['Enter', 'On Refresh (expired state): calls onRefresh once'],
    ['Space', 'On Refresh (expired state): calls onRefresh once'],
    ['Tab', 'Moves focus to Refresh when it shows; the code itself is not focusable'],
  ],
  tokens: ['qr-module', 'qr-surface', 'border', 'card', 'muted-foreground'],
};
