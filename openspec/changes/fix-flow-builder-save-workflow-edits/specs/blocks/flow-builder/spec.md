## Purpose

FlowBuilder block: a visual flow editor with a node palette, a React Flow canvas, an inspector for the selected node and a run console, in resizable panels.

## ADDED Requirements

### Requirement: Each committed graph edit is reported once with the full graph

FlowBuilder SHALL call `onGraphChange` exactly once after each committed edit (node added, nodes or edges deleted, move ended, connection accepted, inspector value changed) with the complete next graph and a `FlowGraphChange` naming the affected node and edge ids. Selection, measurement and in-progress drag changes, rejected connections and run mode MUST NOT call it.

#### Scenario: Backspace deletes a node and its edges in one call

- **GIVEN** the sample graph with node `route` selected
- **WHEN** the user presses Backspace on the canvas
- **THEN** `onGraphChange` is called once with type `delete`, node id `route` and edge ids `e-validate-route`, `e-route-notify` and `e-route-store`
- **AND** the reported graph has 4 nodes and 1 edge

#### Scenario: A drag commits once on drop

- **WHEN** the user drags node `notify` 64 px to the right and releases it
- **THEN** `onGraphChange` is called once with type `move` and node id `notify`
- **AND** no call happens while the pointer moves

#### Scenario: Selection alone is not an edit

- **WHEN** the user clicks node `validate` and then node `store`
- **THEN** `onGraphChange` is not called

### Requirement: Controlled graph renders the parent value and leaves edits to it

When `graph` is set, FlowBuilder SHALL render `graph.nodes` and `graph.edges`, report edits only through `onGraphChange` and MUST NOT apply them to what it renders. Selection and measured sizes SHALL be kept for node ids that still exist when a new `graph` arrives.

#### Scenario: Parent does not apply the edit

- **GIVEN** `graph` set to the 5-node sample and `onGraphChange` a spy that does nothing
- **WHEN** the user clicks Add Step
- **THEN** the spy receives a 6-node graph
- **AND** the canvas still shows 5 nodes and the header reads `5 nodes · 4 edges`

#### Scenario: Parent applies the edit

- **WHEN** the host passes the reported 6-node graph back as `graph`
- **THEN** the canvas shows 6 nodes
- **AND** the new node stays selected in the inspector

### Requirement: Reported graphs omit transient canvas fields

Nodes in a graph passed to `onGraphChange` or to the template's `onSave` MUST NOT carry the `selected`, `dragging` or `measured` fields; ids, types, positions, sizes, data and edges SHALL be kept unchanged.

#### Scenario: Selected node is reported without selection

- **GIVEN** node `validate` is selected
- **WHEN** the user edits its title in the inspector
- **THEN** the reported `validate` node has no `selected` property
- **AND** its `data.title` is the typed value

### Requirement: Palette ids never collide with ids already in the graph

When a node is added from the palette, FlowBuilder SHALL give it the first `<kind>-<n>` id that is not already used by a node in the current graph.

#### Scenario: Reloaded graph already holds step-1

- **GIVEN** `nodes` that include a node with id `step-1`
- **WHEN** the user clicks Add Step
- **THEN** the new node's id is `step-2`
