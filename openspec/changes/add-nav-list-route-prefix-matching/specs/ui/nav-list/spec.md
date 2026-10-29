## Purpose

NavList: sidebar navigation with labelled groups, nested collapsible sections, an icon-rail mode and aria-current marking of the item for the current location.

## ADDED Requirements

### Requirement: Prefix matching marks the section of a nested route

When an item's effective `match` is `prefix`, NavList SHALL mark it current if the path of `currentHref` (without query string, hash or trailing slash) equals the item's `href` or continues it after a `/` boundary. An `href` of `/` SHALL only match the root path.

#### Scenario: Detail route under a section

- **GIVEN** an item Functions with `href` `/functions` and `match` `prefix`
- **WHEN** `currentHref` is `/functions/abc`
- **THEN** Functions has `aria-current="page"`
- **AND** its accent indicator is rendered

#### Scenario: Sibling path sharing characters

- **GIVEN** an item Functions with `href` `/functions` and `match` `prefix`
- **WHEN** `currentHref` is `/functions-v2`
- **THEN** Functions has no `aria-current`

#### Scenario: Root item under prefix matching

- **GIVEN** an item Home with `href` `/` and `match` `prefix`
- **WHEN** `currentHref` is `/functions`
- **THEN** Home is not current

### Requirement: Route patterns mark items for dynamic segments

An item's `pattern` SHALL mark it current when the location path matches any of its patterns, where `:name` matches exactly one non-empty segment and a final `*` matches zero or more remaining segments.

#### Scenario: One dynamic segment

- **GIVEN** an item Project with `pattern` `/projects/:id`
- **WHEN** `currentHref` is `/projects/42?tab=runs`
- **THEN** Project is current

#### Scenario: Path deeper than the pattern

- **GIVEN** an item Project with `pattern` `/projects/:id`
- **WHEN** `currentHref` is `/projects/42/runs`
- **THEN** Project is not current

#### Scenario: Wildcard tail

- **GIVEN** an item Project with `pattern` `/projects/:id/*`
- **WHEN** `currentHref` is `/projects/42/runs/7`
- **THEN** Project is current

### Requirement: At most one computed current item per list

NavList SHALL give `aria-current="page"` to at most one item chosen by matching: an exact `href` match first, then the longest matching `href` or pattern. An explicit `current` value on an item MUST override matching for that item.

#### Scenario: Longest prefix wins

- **GIVEN** prefix items `/projects` and `/projects/templates`
- **WHEN** `currentHref` is `/projects/templates/7`
- **THEN** only `/projects/templates` has `aria-current="page"`
- **AND** `/projects` has no indicator

#### Scenario: Explicit flag wins over matching

- **GIVEN** an item Overview with `current: true`
- **AND** a prefix item `/functions`
- **WHEN** `currentHref` is `/functions/abc`
- **THEN** Overview is current
- **AND** the `/functions` item is not current

### Requirement: Exact href matching stays the default

Without a `match` on NavList or the item and without a `pattern`, NavList MUST mark an item current only when its `href` strictly equals `currentHref`, exactly as before this change.

#### Scenario: Query string under exact matching

- **GIVEN** an item Audit with `href` `/audit` and no `match`
- **WHEN** `currentHref` is `/audit?page=2`
- **THEN** Audit is not current

### Requirement: Sections open around a matched descendant

A nested section SHALL start open, and in the collapsed rail its flyout trigger SHALL show the active state, when the item resolved by matching is one of its descendants.

#### Scenario: Expanded sidebar

- **GIVEN** a section Storage with a prefix child `/storage/buckets`
- **WHEN** NavList renders with `currentHref` `/storage/buckets/logs`
- **THEN** the Storage section is expanded
- **AND** the child has `aria-current="page"`

#### Scenario: Collapsed rail

- **GIVEN** the same section in a NavList with `collapsed`
- **WHEN** NavList renders with `currentHref` `/storage/buckets/logs`
- **THEN** the Storage flyout trigger shows the active indicator
