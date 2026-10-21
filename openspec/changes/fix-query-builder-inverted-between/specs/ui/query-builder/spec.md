## Purpose

QueryBuilder is a visual editor for nested AND/OR conditions with helpers that print and evaluate the query tree.

## ADDED Requirements

### Requirement: Inverted between ranges are invalid and skipped

A complete `between` condition whose first value is after its second SHALL be invalid according to `isConditionValid`. Two numbers SHALL compare numerically; two date strings with day keys SHALL compare by day using the existing comparison helpers. Other pairs SHALL remain valid. `isConditionComplete` SHALL retain its current behavior. `evaluateQuery` SHALL ignore invalid conditions like incomplete conditions, including within nested AND/OR groups. Groups with only ignored conditions SHALL match every record.

#### Scenario: Numbers in the wrong order

- **GIVEN** records with amount 3, 7 and 12
- **WHEN** the query is amount between [10, 5]
- **THEN** isConditionValid returns false
- **AND** evaluateQuery keeps all three records

#### Scenario: Ordered and equal number ranges

- **WHEN** a numeric range is [5, 10]
- **THEN** it is valid and matches only amount 7 of records with amount 3, 7 and 12
- **AND** [5, 5] is also valid

#### Scenario: Date ranges compare by day

- **WHEN** a date range is ['2026-03-10', '2026-03-01']
- **THEN** it is invalid
- **AND** ['2026-03-01', '2026-03-01'] is valid and matches only records on 1 March 2026, including datetime strings on that day

#### Scenario: Incomplete and other conditions

- **WHEN** a between pair is [1, null]
- **THEN** it remains incomplete and validation does not throw
- **AND** complete non-between conditions remain valid

#### Scenario: Invalid ranges within groups

- **WHEN** an inverted range is a child of an AND or OR group alongside amount equal to 7
- **THEN** evaluation ignores the range and matches only amount 7
- **AND** a group holding only the inverted range matches every record

### Requirement: Pair editor flags an inverted range

When both ends of a numeric or date `between` range are set and inverted, both controls SHALL expose aria-invalid and aria-describedby referencing one stable message id. The error SHALL use token classes and the catalog key queryBuilder.rangeInverted with English and Spanish entries. Input values SHALL remain unchanged. The docs SHALL demonstrate the state and advise checking isConditionValid before backend submission.

#### Scenario: User enters 10 then 5

- **WHEN** From is 10 and To is 5
- **THEN** both inputs have aria-invalid="true"
- **AND** both accessible descriptions are 'From' must not be after 'To'.

#### Scenario: User fixes the range

- **WHEN** To changes to 20
- **THEN** the message, aria-invalid and aria-describedby disappear from both controls
- **AND** the same behavior applies to date ranges

#### Scenario: Only one end is set

- **WHEN** only one range end is filled
- **THEN** neither control is marked invalid and no range message appears
