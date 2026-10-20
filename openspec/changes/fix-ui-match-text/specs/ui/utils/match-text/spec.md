## Purpose

Locale-aware text matching shared by kit filters, search boxes and highlighters, ignoring case and common Latin accents.

## ADDED Requirements

### Requirement: Matching ignores accents and case

`foldText(text, locale?)` SHALL apply NFD, locale lower-case, combining-mark removal and the mappings ł→l, ø→o, đ→d, ı→i, ß→ss, æ→ae and œ→oe. `matchText(text, query, options?)` SHALL compare folded text and a trimmed query. Empty and whitespace-only queries SHALL match everything. The implementation SHALL be dependency-free and SHALL NOT use React or per-window Intl.Collator comparisons.

#### Scenario: Spanish query without accents

- **WHEN** `matchText('Función', 'funcion')` is called
- **THEN** it returns `true`

#### Scenario: Letters without a decomposition

- **WHEN** `matchText('Łódź', 'LODZ')` and `matchText('Øresund', 'oresund')` are called
- **THEN** both return `true`

#### Scenario: Longer query

- **WHEN** `matchText('Función', 'funciones')` is called
- **THEN** it returns `false`

### Requirement: Match mode selects contains, startsWith or endsWith

The `mode` option SHALL select substring (`contains`, the default), prefix (`startsWith`) or suffix (`endsWith`) matching on folded strings.

#### Scenario: Prefix and suffix

- **WHEN** `matchText('Función', 'cion')` is called with mode `endsWith` and then `startsWith`
- **THEN** the first call returns `true`
- **AND** the second call returns `false`

### Requirement: Match ranges are offsets in the original text

`matchRanges(text, query, options?)` SHALL return every non-overlapping match as `[start, end]` UTF-16 offsets into the original text through a folded-to-original index map, including when folding changes the string length. Empty queries SHALL return no ranges.

#### Scenario: Dotted capital I

- **WHEN** `matchRanges('İstanbul', 'stan')` is called
- **THEN** it returns `[[1, 5]]`

#### Scenario: Two accented matches

- **WHEN** `matchRanges('Función de función', 'FUNCION')` is called
- **THEN** it returns `[[0, 7], [11, 18]]`

### Requirement: Kit filters and highlighters use the shared matcher

CommandPalette, MultiSelect, TransferList, WorkspaceSearch, PowerSearch suggestions and text terms, QueryBuilder text operators, JsonViewer, LogViewer and the eight approved template filters SHALL use the shared matching utility. Highlighters SHALL mark original text using matchRanges. Components SHALL pass their provider locale; pure helpers SHALL accept optional locales defaulting to undefined. LogViewer and JsonViewer SHALL memoise folded search text. ASCII behavior SHALL remain compatible.

#### Scenario: Log line highlight

- **GIVEN** a LogViewer line `Función desplegada`
- **WHEN** the user types `funcion` in the search field
- **THEN** the line stays visible
- **AND** `<mark>` wraps exactly `Función`

#### Scenario: Palette ranking

- **WHEN** the CommandPalette query is `funcion` and an item is labelled `Función de prueba`
- **THEN** the item is listed with the same prefix-match score as for `función`

### Requirement: Equality and ordering comparisons are unchanged

PowerSearch equality and range operators, QueryBuilder equality and set membership, and template facet values and sorting MUST retain their existing accent-sensitive comparison. Combobox SHALL retain Base UI useFilter.

#### Scenario: QueryBuilder equality

- **GIVEN** a record whose name is `Función`
- **WHEN** evaluateQuery runs contains `funcion` and then eq `funcion`
- **THEN** contains matches
- **AND** eq does not match
