## Purpose

Textarea: a multi-line text input rendered through Base UI Field.Control, in two sizes, with optional autosize and vertical resize, working inside Field.

## ADDED Requirements

### Requirement: Textarea counter shows the count against the limit

With `showCount`, Textarea SHALL show `n / max` under the field using `countStrategy`, where max is `maxCount` or else `maxLength`, SHALL switch the counter to the destructive text alias past the maximum, and MUST NOT block typing when only `maxCount` is set.

#### Scenario: Within a hard limit

- **GIVEN** `showCount`, `maxLength={280}` and the value hello
- **WHEN** the Textarea renders
- **THEN** the counter reads 5 / 280

#### Scenario: Past a soft limit

- **GIVEN** `showCount` and `maxCount={10}`
- **WHEN** the user types twelve characters
- **THEN** the field holds all twelve characters
- **AND** the counter reads 12 / 10 in the destructive text colour

### Requirement: Counter announcements are polite and rare

The counter SHALL expose the count through the control's accessible description, and its polite live region SHALL speak only after typing pauses for 500 milliseconds, once 80 percent of the maximum or the maximum itself has just been crossed.

#### Scenario: Near the limit

- **GIVEN** `maxCount={10}`
- **WHEN** the user types the eighth character and pauses
- **THEN** 2 characters left is announced once

#### Scenario: Far from the limit

- **WHEN** the user types the third character and pauses
- **THEN** nothing is announced
- **AND** the description reads 3 of 10 characters
