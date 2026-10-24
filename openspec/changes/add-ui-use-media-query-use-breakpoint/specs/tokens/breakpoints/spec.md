## Purpose

Share responsive breakpoint values between JavaScript behaviour and Tailwind utilities.

## ADDED Requirements

### Requirement: Breakpoint constants match CSS breakpoints

The tokens runtime SHALL export breakpoints with sm 40rem, md 48rem, lg 64rem, xl 80rem and 2xl 96rem, and breakpointQuery(name) SHALL return the corresponding min-width query. The Tailwind bridge MUST state the same values without changing existing token values or the built docs media queries.

#### Scenario: Parity test

- **WHEN** the token test parses the Tailwind bridge's --breakpoint-* values
- **THEN** they deep-equal the runtime breakpoints
- **AND** breakpointQuery('lg') equals '(min-width: 64rem)'
