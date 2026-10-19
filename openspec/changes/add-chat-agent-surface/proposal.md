# Add AgentSurface to the chat pack

## Why

Agent output currently renders as Markdown or tool-call JSON. Consumers need an opt-in way to render small interactive forms and cards while keeping agent JSON outside the host's trusted markup and styling boundary.

## What changes

Add AgentSurface, defineAgentCatalog, defaultAgentCatalog and protocol types to the main @gntik-ai/chat entry. Pin A2UI_VERSION to v0.9. Apply runtime-checked createSurface, updateComponents, updateDataModel and deleteSurface envelopes to placement-neutral surfaces with a fixed root component id of root. Component records use id, component, children and flat catalog properties.

The default catalog contains Text, Heading, Card, Stack, Button, Input, Select, Checkbox, Alert and Badge. Validate known props, render text as React text nodes, reuse Markdown safeUrl, reject unsafe JSON Pointers and bound graph traversal. Bind inputs to an immutable data model and emit resolved actions. Label every surface visibly and accessibly as agent content and restore focus on deletion.

Provide translated English/Spanish strings, live docs covering every entry, regression and accessibility tests, regenerated registries, and one changeset (chat minor; ui patch for translations).

## Scope and decisions

- R2: untrusted agent JSON becomes UI; allow-list, prop validation, URL policy, origin labels and pointer guards are security controls.
- Support v0.9 only. No v0.8 adapter.
- Export from the existing main entry; consumers place the component and supply transport.
- Exclude Markdown integration, blocks, templates, charts, flow editor, passwords, payments and uploads.
- A custom catalog is trusted executable host code; documentation must warn that it can reintroduce phishing and injection risks.
- No new runtime dependencies, infrastructure changes, publication or deployment.

## Rollback

Revert this additive change or pin @gntik-ai/chat to its preceding release.
