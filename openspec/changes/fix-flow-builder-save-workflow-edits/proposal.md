# Fix FlowBuilder workflow saves

## Why

Committed edits never reach WorkflowBuilderPage onSave, and its saved note becomes stale. Reloaded palette ids can collide.

## What Changes

- Add FlowGraph, FlowGraphChange, controlled graph and committed onGraphChange reporting.
- Pass the graph on screen to onSave and track unsaved/saved status using existing translations.
- Keep transient canvas fields out of persistence payloads and allocate unique palette ids.
- Add regression tests, live docs examples and patch changesets for blocks and templates.

## Impact

- Affected specs: blocks/flow-builder, templates/workflow-builder.
- Affected code: FlowBuilder block and workflow-builder template.
- Existing uncontrolled rendering and zero-argument save handlers remain compatible.
- No history, autosave, deployment or release operations.
