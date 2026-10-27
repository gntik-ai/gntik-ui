## Purpose

Shareable item pages with examples, generated API reference, anatomy and styling hooks.

## ADDED Requirements

### Requirement: Item routes open one component, block, layout or template

The catalog SHALL resolve #ui-components/<id>, #blocks/<id>, #layouts/<id> and #templates/<id>
on first load, hashchange and Back/Forward using case-sensitive kit registry IDs. Bare section
hashes and existing __goto(section) callers SHALL continue to work.

#### Scenario: Direct component link

- **WHEN** a reader opens /#ui-components/select
- **THEN** only Select renders and the topbar reads Library › Select

#### Scenario: Unknown component

- **WHEN** a reader opens #ui-components/unknown
- **THEN** the index renders with the notice No component named unknown

#### Scenario: Gallery item

- **WHEN** a reader opens #blocks/flow-builder, #templates/workflow-builder or #layouts/canvas-layout
- **THEN** only that item's examples render with a link back to the gallery
- **AND** layout pages include every example frame and the generated API reference

### Requirement: Navigation manages heading focus and document title

The catalog SHALL focus the page h1 with tabIndex -1 on navigation and set the title to
<Name> · Gntik UI. Theme and density changes SHALL preserve the user's current focus.

#### Scenario: Navigate from index

- **WHEN** a reader activates Select in the index
- **THEN** the Select h1 has focus and the title is Select · Gntik UI
- **AND** Back returns to the index

### Requirement: Component index links all documented UI entries

The index SHALL list every COMPONENTS entry, grouped and filterable by group, with name,
first description sentence and status, and SHALL render no live example previews.

#### Scenario: Index content

- **WHEN** a reader opens #ui-components
- **THEN** the link count equals the documentation-derived entry count
- **AND** no live examples render

### Requirement: Styling hooks describe the state attributes used by variants

Component pages SHALL show data-* and group-data-* variant prefixes per part with meanings
from dataAttributes when present, and SHALL omit the table when there are no state hooks.

#### Scenario: Select hooks

- **WHEN** a reader opens the Select page
- **THEN** the table includes data-popup-open for trigger and data-highlighted, data-selected and data-disabled for item

#### Scenario: No styled states

- **GIVEN** a component whose variants use no state attribute prefix
- **WHEN** its page renders
- **THEN** no Styling hooks table renders
