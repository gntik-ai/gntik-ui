## Purpose

Calendar: an accessible month grid for picking a day or a range, with keyboard navigation, locale-aware names, bounds and disabled dates, used inline and inside date pickers.

## ADDED Requirements

### Requirement: Date predicates receive the in-progress range start

Calendar SHALL call `isDateDisabled(date, context)` with a required second parameter containing `rangeStart`, the picked start only while a range end is pending, and null otherwise. One-argument predicates SHALL remain supported.

#### Scenario: End pending

- **GIVEN** range mode with 2026-03-10 picked as the start
- **WHEN** the grid renders
- **THEN** the predicate receives `{ rangeStart: 2026-03-10 }`
- **AND** a same-month predicate can prevent selection in April

#### Scenario: Range complete or single mode

- **GIVEN** a complete range or single mode
- **WHEN** the grid renders
- **THEN** the predicate receives `{ rangeStart: null }`

### Requirement: Range length limits disable days while the end is pending

With `maxRange` or `minRange`, Calendar SHALL disable endpoints that form an inclusive calendar-day span outside those limits, on both sides of the start, only while an end is pending. Day counting SHALL use calendar date parts rather than local elapsed milliseconds. Disabled days SHALL remain focusable with aria-disabled; selection SHALL do nothing and hover or keyboard preview SHALL NOT extend to them.

#### Scenario: Seven-day maximum

- **GIVEN** maxRange 7 and start 2026-03-10
- **WHEN** the user clicks 2026-03-17
- **THEN** 03-17 and later and 03-03 and earlier are aria-disabled and the range stays incomplete
- **AND** 03-16 and 03-04 are enabled
- **AND** Enter on 03-16 completes 03-10 through 03-16

#### Scenario: Three-day minimum

- **GIVEN** minRange 3 and start 2026-03-10
- **WHEN** the grid renders
- **THEN** 03-09, 03-10 and 03-11 cannot complete the range
- **AND** 03-08 and 03-12 can complete it

#### Scenario: Limits do not apply to a new start

- **GIVEN** no start or a complete range
- **WHEN** the grid renders
- **THEN** no day is disabled by a range limit

#### Scenario: Daylight saving change

- **GIVEN** TZ=Europe/Madrid, maxRange 7 and start 2026-03-26
- **WHEN** the grid renders
- **THEN** 2026-04-01 is enabled and 2026-04-02 is aria-disabled

#### Scenario: Invalid limits

- **GIVEN** a non-positive or non-integer limit
- **WHEN** the grid renders
- **THEN** that limit is ignored
- **AND** valid minRange greater than valid maxRange leaves no selectable end without throwing
