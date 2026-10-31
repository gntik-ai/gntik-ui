# ToolCallCard approval state

## Why

Tool calls need a kit-level way to request a human decision before execution, with consistent wording, optional denial reasons and a record of the decision.

## What changes

Add awaiting-approval and denied to ToolCallStatus, optional approval callbacks, a denial reason step, asynchronous busy controls, destructive wording, a controlled decision record and a polite announcement without moving focus. Preserve the original status DOM. Add English and Spanish catalogs, live documentation and a minor changeset for chat and ui.

## Impact

R1: additive optional API, with a widened exported union that requires consumers with exhaustive maps or switches to update them. Backend enforcement is required; the card is not a security boundary. Runtime adapters, policies, audit fields and template mock flows are out of scope. No dependencies, deployment or publishing. Roll back by reverting or pinning the previous package version.
