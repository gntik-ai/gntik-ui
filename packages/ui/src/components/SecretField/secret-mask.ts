/** Character used to draw a masked secret. */
export const MASK_CHAR = '•';

export interface MaskOptions {
  /** Characters shown at the start (e.g. a key prefix like "sk_live_"). Default 0. */
  visiblePrefix?: number;
  /** Characters shown at the end (the last four, say). Default 0. */
  visibleSuffix?: number;
  /** Number of mask characters. Fixed by default so the mask does not reveal the length. */
  maskLength?: number;
}

/**
 * The masked form of a secret: optional visible prefix / suffix around a fixed run of `•`.
 * Prefix and suffix are only shown while they leave at least half of the value hidden.
 */
export function maskSecret(value: string, { visiblePrefix = 0, visibleSuffix = 0, maskLength = 16 }: MaskOptions = {}): string {
  if (!value) return '';
  const shown = visiblePrefix + visibleSuffix;
  const safe = shown > 0 && shown * 2 <= value.length;
  const head = safe ? value.slice(0, visiblePrefix) : '';
  const tail = safe && visibleSuffix > 0 ? value.slice(-visibleSuffix) : '';
  return `${head}${MASK_CHAR.repeat(Math.max(1, maskLength))}${tail}`;
}
