## Purpose

PageToolbar block: a list or table toolbar with a search input, filters, a view toggle and the primary action, reached as one toolbar tab stop.

## ADDED Requirements

### Requirement: PageToolbar search debounce calls onSearchChange once typing pauses

With `searchDebounceMs` greater than 0, PageToolbar SHALL update its search input on every keystroke and SHALL call `onSearchChange` once with the latest text after the delay or at once on Enter; with the prop unset it MUST keep calling `onSearchChange` on every change.

#### Scenario: Enter before the delay ends

- **GIVEN** `searchDebounceMs={250}`
- **WHEN** the user types `api` and presses Enter within 250 ms
- **THEN** `onSearchChange` is called once, with `api`, on Enter
- **AND** no further call follows when the delay would have ended
