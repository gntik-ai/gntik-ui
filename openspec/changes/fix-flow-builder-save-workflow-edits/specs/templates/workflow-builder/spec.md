## Purpose

Workflow-builder template: a full-screen flow editor page (CanvasLayout, title, status, Save and Publish) around the FlowBuilder block, with an optional code panel.

## ADDED Requirements

### Requirement: Save receives the graph shown on screen

WorkflowBuilderPage SHALL call `onSave` with the graph on screen: the controlled `graph` when set, otherwise the latest graph reported by FlowBuilder, otherwise the initial `nodes` and `edges`. Handlers declared without parameters MUST keep type-checking.

#### Scenario: Edited title reaches the save handler

- **GIVEN** the template with the sample graph and an `onSave` spy
- **WHEN** the user renames node `validate` to `Check order` and presses Save
- **THEN** `onSave` is called once
- **AND** its graph argument contains node `validate` with title `Check order`

#### Scenario: Save without edits

- **WHEN** the user presses Save before editing
- **THEN** `onSave` receives the initial 5-node graph

### Requirement: Saved note tracks unsaved edits

After any committed edit the header note SHALL read the `actionBar.unsaved` message until an `onSave` call resolves, then the `actionBar.saved` message; a rejected `onSave` MUST leave the unsaved message in place.

#### Scenario: Edit, then save

- **WHEN** the user adds a node and then presses Save, and `onSave` resolves
- **THEN** the note reads `You have unsaved changes` after the edit
- **AND** it reads `All changes saved` after the save

#### Scenario: Save fails

- **GIVEN** an unsaved edit
- **WHEN** `onSave` rejects
- **THEN** the note still reads `You have unsaved changes`
- **AND** the Save button leaves its loading state
