## Purpose

FilterBar block: a search landmark with a query input, saved views, an Add filter menu and removable filter chips for list and table pages.

## ADDED Requirements

### Requirement: FilterBar query debounce calls onQueryChange once typing pauses

With `queryDebounceMs` greater than 0, FilterBar SHALL show every keystroke in its search input at once and SHALL call `onQueryChange` once with the latest text after the delay, or at once on Enter, on clearing and on unmount; with the prop unset it MUST call `onQueryChange` on every change as today.

#### Scenario: Typing a word

- **GIVEN** `queryDebounceMs={250}`
- **WHEN** the user types `run` within 250 ms
- **THEN** the input shows each character as it is typed
- **AND** `onQueryChange` is called once, with `run`

#### Scenario: Clear all with a pending value

- **GIVEN** `queryDebounceMs={250}` and `ru` typed 100 ms ago
- **WHEN** Clear all is activated
- **THEN** `onQueryChange` receives `''` at once
- **AND** the pending `ru` is never reported
