## Purpose

⌘K command palette: a modal dialog with a search input over grouped commands, with ranking, recent items, keyboard navigation, an empty state and footer hints.

## ADDED Requirements

### Requirement: Loaded results are debounced and abortable

When `loadItems` is set, the palette SHALL call it with the query and an AbortSignal `debounceMs` after the last change, only while open and only when the trimmed query has at least `minQueryLength` characters. It MUST abort the signal of a request whose query changed or whose palette closed, and MUST ignore that request's result. Loaded groups from an earlier session or query MUST be hidden while the trimmed query is below `minQueryLength`.

#### Scenario: Quick typing loads once

- **GIVEN** `loadItems` is set and `debounceMs` is 250
- **WHEN** the user types `r`, `u` and `n` 100 ms apart
- **THEN** `loadItems` is called once, with `run`
- **AND** the call happens 250 ms after the last key

#### Scenario: Closing aborts the request

- **GIVEN** a request for `run` is pending
- **WHEN** the user presses Escape
- **THEN** the request's signal is aborted
- **AND** no loaded group renders when the request later resolves

#### Scenario: Opening does not load

- **WHEN** the palette opens with an empty query
- **THEN** `loadItems` is not called
- **AND** recent items and static groups render

### Requirement: Loading and error states with a Retry option

While a load is pending the palette SHALL expose a status with the loading text and set `aria-busy` on the list, keeping static matches usable. When the load rejects with anything other than an AbortError, it SHALL show the error text and a last Retry option that loads the same query again without closing the palette.

#### Scenario: Pending load

- **WHEN** a request for `agent` is pending
- **THEN** the status reads `Loading…`
- **AND** the list has `aria-busy="true"`
- **AND** a matching static command still runs on Enter

#### Scenario: Retry after an error

- **GIVEN** the request for `agent` rejected
- **WHEN** the user moves to the Retry option and presses Enter
- **THEN** `loadItems` is called again with `agent`
- **AND** the palette stays open with the query `agent`

### Requirement: Loaded groups follow static matches in returned order

Loaded groups SHALL render after the matching static groups, with headings and items in the order returned and without local ranking. A loaded item whose id is already visible MUST be skipped. The empty text SHALL show only when no load is pending and neither static nor loaded items match. Choosing an item SHALL call its `onSelect`, then the palette's `onSelect`, and only then close the palette.

#### Scenario: Server order is kept

- **GIVEN** `loadItems` resolves `[{ label: 'Agents', items: [a2, a1] }]`
- **WHEN** the results render
- **THEN** an Agents group follows the static groups
- **AND** `a2` is listed before `a1`

#### Scenario: Duplicate id

- **GIVEN** a static command and a loaded item share the id `settings`
- **WHEN** both match the query
- **THEN** one option with that id renders, in the static group

#### Scenario: Selection order

- **GIVEN** the palette is controlled by a store
- **WHEN** the user chooses a loaded item
- **THEN** the item's `onSelect` and then the palette's `onSelect` run while `store.isOpen()` is true
- **AND** the palette then closes

### Requirement: Query changes are reported to onQueryChange

The palette SHALL call `onQueryChange` with every typed change of the query and with an empty string when opening resets it. Choosing an item MUST NOT call it.

#### Scenario: Typing and reopening

- **WHEN** the user types `ru`, closes the palette and opens it again
- **THEN** `onQueryChange` was called with `r`, `ru` and then an empty string

### Requirement: Custom filter and limit shape the static matches

When `filter` is set, the palette SHALL rank static items with it instead of `scoreCommand`, for the empty query as well: a score below 0 hides the item, higher scores come first and ties keep the given order. Without `filter`, the empty query SHALL list recent items and every group as given. When `limit` is set, it SHALL render at most `limit` static rows in display order and report the shown and total counts in the footer when rows were cut.

#### Scenario: Prefix-only filter

- **GIVEN** `filter` returns 1 when the id starts with the query and -1 otherwise
- **WHEN** the user types `ru`
- **THEN** only commands whose id starts with `ru` are listed

#### Scenario: Filter rejecting the empty query

- **GIVEN** `filter` always returns -1
- **WHEN** the palette opens
- **THEN** no static option renders

#### Scenario: Limited list

- **GIVEN** 120 static commands and `limit` 50
- **WHEN** the palette opens
- **THEN** 50 options render
- **AND** the footer reads `Showing 50 of 120`

### Requirement: Custom row content keeps option semantics

When `renderItem` is set, the palette SHALL render its result inside the kit's option element, which MUST keep the option role, the highlight state, disabled handling and running the item on Enter or click.

#### Scenario: Custom row runs on Enter

- **GIVEN** `renderItem` renders the label and a status tag
- **WHEN** the user presses ArrowDown and Enter
- **THEN** the first option has `data-highlighted`
- **AND** its item's `onSelect` runs and the palette closes

### Requirement: Store opens and closes the palette from code

A store from `createCommandPaletteStore` passed as `store` SHALL control the palette: `open()` opens it with an empty query and focus in the input, `close()` and `toggle()` act likewise, and the shortcut and trigger MUST update the store. `onOpenChange` SHALL fire for every change. When both `store` and `open` are set, the store SHALL win and a development-only warning SHALL be emitted.

#### Scenario: Open from an external button

- **GIVEN** a button outside the palette calls `store.open()`
- **WHEN** the user clicks it
- **THEN** the palette opens with an empty query
- **AND** focus is in the search input
- **AND** `store.isOpen()` returns true

#### Scenario: Shortcut updates the store

- **GIVEN** the palette is open through the store
- **WHEN** the user presses Ctrl+K
- **THEN** the palette closes
- **AND** `store.isOpen()` returns false
