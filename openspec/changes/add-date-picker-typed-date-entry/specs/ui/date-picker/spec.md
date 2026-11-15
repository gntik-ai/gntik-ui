## Purpose

DatePicker and DateRangePicker optionally accept typed dates using the existing segment fields.

## ADDED Requirements

### Requirement: Locale-ordered editable triggers

With editable enabled, the picker SHALL render a Field-labelled segment group and a separate Choose date button with dialog popup semantics. The read-only default SHALL retain its existing DOM.

#### Scenario: Locale ordering

- **GIVEN** editable and locale en-US or es-ES
- **WHEN** the trigger renders
- **THEN** its spinbuttons follow month/day/year or day/month/year respectively
- **AND** range endpoints are named Start date and End date from the catalog

### Requirement: Complete entry and validation

The picker SHALL emit complete typed or pasted dates once. Incomplete or reversed ranges MUST NOT emit; only a full clear SHALL emit null endpoints. Bounds and disabled-date rejections SHALL emit complete values with invalid styling.

#### Scenario: Typing and paste

- **WHEN** the user types 10012026 or pastes 2026-10-01 in en-US
- **THEN** the picker emits October 1, 2026 once
- **AND** clearing a filled single-date segment emits null

#### Scenario: Range end validation

- **GIVEN** a typed start date
- **WHEN** a complete end is entered
- **THEN** isDateDisabled receives that start as rangeStart
- **AND** reversed or partial ranges do not emit

### Requirement: Calendar synchronization without remounts

Typing SHALL update the calendar month and focused day. Calendar picks SHALL update segments, close the popup and restore Choose date focus. Draft resets MUST preserve trigger and field DOM identities and focused segments, including rejected controlled edits.

#### Scenario: Opening after a pending segment

- **WHEN** Alt+ArrowDown flushes a newly typed month
- **THEN** the calendar opens on that committed month
- **AND** defaultMonth is not reapplied after edits or popup remounts

#### Scenario: Controlled updates

- **WHEN** the parent rejects an edit or externally updates to a previously typed value
- **THEN** fields, hidden inputs and calendar reflect the controlled value in place
- **AND** controlled range fields receive no defaultValue

### Requirement: Explicit periods and zone-safe dates

Editable date-time entry SHALL wait for an explicit 12-hour period. Paste SHALL supply a parsed or default period. Zoned wall times MUST avoid host-local Date normalization. DateField and DateRangeField SHALL format hidden inputs in UTC when utc is enabled.

#### Scenario: Complete 12-hour entry

- **WHEN** the user types 100120260230p
- **THEN** the only emission is October 1, 2026 at 14:30

#### Scenario: UTC during a host DST gap

- **GIVEN** host America/New_York and timeZone UTC
- **WHEN** March 8, 2026 at 02:30 is typed
- **THEN** it emits 02:30 UTC
- **AND** a timezone change rebuilds drafts in place

### Requirement: Year-safe calendar arithmetic

Typed, pasted and picked years below 100 SHALL remain literal throughout calendar previews, comparisons, time edits and inclusive range limits.

#### Scenario: Century boundary

- **GIVEN** maxRange 2
- **WHEN** 0099-12-31 to 0100-01-01 is entered
- **THEN** the pair is valid

### Requirement: Inherited Field state and accessibility

Editable pickers SHALL inherit Field disabled and invalid states on first render and after edits. Disabled pickers MUST disable segments, Choose date and popup Clear without calling onClear. New strings SHALL come from English and Spanish catalogs. Examples SHALL demonstrate editable behavior and pass accessibility checks in all themes.

#### Scenario: Disabled Field

- **GIVEN** an enclosing disabled Field
- **WHEN** segments, Choose date or popup Clear are used
- **THEN** no value or clear callback occurs
