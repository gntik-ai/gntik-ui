## Purpose

Optional compound anatomy and state-attribute documentation for @gntik-ai/ui.

## ADDED Requirements

### Requirement: Component docs can declare anatomy and state attributes

ComponentDoc SHALL accept optional anatomy JSX skeleton text and dataAttributes rows of
attribute, part and meaning. Every listed attribute SHALL occur in its variants or source.

#### Scenario: Existing documentation

- **GIVEN** a doc without anatomy or dataAttributes
- **WHEN** the UI package type-checks
- **THEN** it compiles unchanged

#### Scenario: Attribute drift

- **GIVEN** a doc lists data-expanded absent from its component's variants and source
- **WHEN** the Node drift test runs
- **THEN** validation fails naming the component and data-expanded
