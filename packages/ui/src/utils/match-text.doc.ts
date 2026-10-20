import type { ComponentDoc } from '../doc';

export const doc: ComponentDoc = {
  name: 'Text matching',
  group: 'Forms',
  status: 'stable',
  description:
    'foldText(text, locale?) normalizes NFD, lowercases for the locale, removes combining marks and folds common Latin letters (ł, ø, đ, ı, ß, æ, œ). matchText(text, query, { mode?, locale? }) trims the query and supports contains (default), startsWith and endsWith; empty queries match everything. matchRanges returns non-overlapping UTF-16 offsets in the original string for safe highlighting; empty queries return no ranges. Equality, ordering and set membership remain accent-sensitive. The example searches accented fixture data and preserves the original text in marks.',
  keyboard: [['Typing', 'Filters and highlights the sample names without requiring accents']],
  tokens: ['foreground', 'warning', 'warning-chip-text'],
};
