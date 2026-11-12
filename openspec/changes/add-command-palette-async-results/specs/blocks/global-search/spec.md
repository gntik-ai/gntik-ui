## Purpose

GlobalSearch shell block: the topbar ⌘K search, a CommandPalette pre-wired with recent items and Pages, Records and Actions groups that reports the group of the chosen item.

## ADDED Requirements

### Requirement: Server-backed search reports loaded items as records

GlobalSearch SHALL forward `loadItems`, `debounceMs`, `minQueryLength`, `onQueryChange` and `store` to its CommandPalette, and SHALL report a chosen loaded item to `onSelect` with the group `records`, including when a static item that is not visible shares its id. A chosen visible static item SHALL keep the group of its static source.

#### Scenario: Choosing a loaded record

- **GIVEN** GlobalSearch has `loadItems` resolving an item `run-42`
- **WHEN** the user types `run` and chooses `run-42`
- **THEN** `onSelect` is called with that item and `records`

#### Scenario: Loaded item shares an id with a hidden static item

- **GIVEN** a static page `settings` that the query does not match and a loaded item with the id `settings`
- **WHEN** the user chooses the loaded item
- **THEN** `onSelect` is called with the loaded item and `records`
