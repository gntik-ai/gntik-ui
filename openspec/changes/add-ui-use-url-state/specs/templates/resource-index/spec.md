## Purpose

Resource index with opt-in query, filter and sort URL state.

## ADDED Requirements

### Requirement: Resource index can keep search filters and sort in the URL

syncUrl SHALL default to false. When enabled it SHALL bind q using replace, repeated f=field:value using push, and sort=column:asc|desc using replace. Filters SHALL split on the first colon, ignore unknown fields/values, and match options case-insensitively while preserving option casing. Sorting SHALL ignore unknown or unsortable columns and map asc/desc to ascending/descending. Invalid input SHALL NOT rewrite the URL. Disabling syncUrl SHALL preserve local state, uncontrolled DataTable sorting, and no history or popstate access. The hook SHALL be called unconditionally with an inert adapter when disabled. Documentation SHALL demonstrate syncUrl and explain the saved-view Select limitation.

#### Scenario: Deep link

- **GIVEN** syncUrl and q=api&f=status:failed&sort=name:desc
- **WHEN** the page loads
- **THEN** the search holds api, Failed is active and checked in the menu, and rows sort by name descending

#### Scenario: Change filters and navigate Back

- **WHEN** a filter is added
- **THEN** one push updates f
- **AND** Back restores the preceding filters

#### Scenario: Existing behavior

- **GIVEN** syncUrl is omitted
- **WHEN** search, filters or sort change
- **THEN** no history call or popstate listener occurs
- **AND** existing template behavior is preserved
