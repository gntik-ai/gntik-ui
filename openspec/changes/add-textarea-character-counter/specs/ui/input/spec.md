## Purpose

Input: a single-line text input on Base UI Input with sizes, leading and trailing icons or addons and an invalid state, working inside Field.

## ADDED Requirements

### Requirement: Input counter sits in the trailing addon area

With `showCount`, Input SHALL render the counter inside the field frame before `trailingAddon` and `trailingIcon`, with the same counting, limit styling, description and announcements as Textarea.

#### Scenario: Resource name

- **GIVEN** `showCount`, `maxLength={63}` and `trailingAddon` .svc
- **WHEN** the user types api
- **THEN** the counter reads 3 / 63 inside the frame before .svc
- **AND** the input's accessible description includes 3 of 63 characters
