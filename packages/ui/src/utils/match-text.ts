/** Options for accent- and case-insensitive text matching. */
export interface MatchTextOptions {
  mode?: 'contains' | 'startsWith' | 'endsWith';
  locale?: string;
}

const LATIN: Readonly<Record<string, string>> = {
  ł: 'l',
  ø: 'o',
  đ: 'd',
  ı: 'i',
  ß: 'ss',
  æ: 'ae',
  œ: 'oe',
};

/** Folds common Latin accents and case, without trimming the input. No transliteration of other scripts. */
export function foldText(text: string, locale?: string): string {
  return text
    .normalize('NFD')
    .toLocaleLowerCase(locale)
    .replace(/\p{M}/gu, '')
    .replace(/[łøđıßæœ]/g, (letter) => LATIN[letter]!);
}

/** Matches a trimmed query; an empty query matches every string. */
export function matchText(text: string, query: string, options: MatchTextOptions = {}): boolean {
  const needle = foldText(query.trim(), options.locale);
  if (!needle) return true;
  const haystack = foldText(text, options.locale);
  const at = options.mode === 'endsWith' ? haystack.lastIndexOf(needle) : haystack.indexOf(needle);
  return (
    at >= 0 &&
    (options.mode === 'startsWith'
      ? at === 0
      : options.mode === 'endsWith'
        ? at + needle.length === haystack.length
        : true)
  );
}

/**
 * Returns non-overlapping UTF-16 ranges in the original text, including combining marks.
 * Empty queries return no ranges. Expanded letters (such as ß → ss) are marked once.
 */
export function matchRanges(
  text: string,
  query: string,
  options: MatchTextOptions = {},
): Array<[start: number, end: number]> {
  const needle = foldText(query.trim(), options.locale);
  if (!needle) return [];
  const folded = foldText(text, options.locale);
  const starts: number[] = [];
  const ends: number[] = [];
  // Keep a base and its combining marks together, including locale-sensitive dotted I.
  for (const part of text.matchAll(/[^\p{M}]\p{M}*|\p{M}+/gu)) {
    const start = part.index;
    const end = start + part[0].length;
    const length = foldText(part[0], options.locale).length;
    for (let i = 0; i < length; i++) {
      starts.push(start);
      ends.push(end);
    }
  }
  const ranges: Array<[number, number]> = [];
  let from = 0;
  while (from <= folded.length - needle.length) {
    const at = options.mode === 'endsWith' ? folded.lastIndexOf(needle) : folded.indexOf(needle, from);
    if (
      at < from ||
      (options.mode === 'startsWith' && at !== 0) ||
      (options.mode === 'endsWith' && at + needle.length !== folded.length)
    )
      break;
    const start = starts[at]!;
    const end = ends[at + needle.length - 1]!;
    if (!ranges.length || start >= ranges[ranges.length - 1]![1]) ranges.push([start, end]);
    from = at + needle.length;
    if (options.mode && options.mode !== 'contains') break;
  }
  return ranges;
}
