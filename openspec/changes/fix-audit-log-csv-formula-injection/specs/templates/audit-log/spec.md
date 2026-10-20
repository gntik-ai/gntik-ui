## Purpose

Audit-log template: a filterable list of audit events with a diff drawer and a CSV export of the filtered events.

## ADDED Requirements

### Requirement: CSV export neutralises formula triggers

The audit-log CSV export SHALL prefix a single quote to every cell whose first character is `=`, `+`, `-`, `@`, a tab (U+0009) or a carriage return (U+000D), before applying CSV quoting. It SHALL NOT trim whitespace or strip characters.

#### Scenario: Formula in an actor name

- **GIVEN** an audit event whose actor name is `=HYPERLINK("https://example.test","x")`
- **WHEN** the events are exported with `auditEventsToCsv`
- **THEN** the actor cell is `"'=HYPERLINK(""https://example.test"",""x"")"`

#### Scenario: Tab-led target

- **WHEN** an event target starts with a tab character
- **THEN** the target cell starts with an apostrophe followed by the tab

#### Scenario: Other formula triggers

- **WHEN** a cell starts with `+`, `-`, `@` or a carriage return
- **THEN** it receives an apostrophe prefix before the existing quoting rule
- **AND** a carriage-return-led value without commas, quotes or newlines remains unquoted

### Requirement: CSV export leaves safe cells unchanged

Cells that do not start with a formula trigger MUST be written exactly as before: quoted only when they contain a comma, a double quote or a newline, with inner quotes doubled. The header, ISO time cells, column order, comma separators and newline row joins SHALL remain unchanged.

#### Scenario: Plain values

- **WHEN** an event has actor `Ana López` and IP `10.0.0.4`
- **THEN** both cells are written unquoted and unchanged

#### Scenario: Value with a comma

- **WHEN** a target is `projects/a,b`
- **THEN** the cell is `"projects/a,b"` with no apostrophe

#### Scenario: Embedded trigger or leading space

- **WHEN** a cell is `a=b`, `x-1` or ` =1+1`
- **THEN** it is written unchanged with no apostrophe
