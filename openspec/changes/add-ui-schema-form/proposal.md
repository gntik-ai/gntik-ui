# Change: Add schema-driven forms

## Why

Consumers currently hand-write a control for every schema property. The optional forms entry can compose the existing kit controls and react-hook-form without growing the root entry's dependency graph.

## What Changes

- Add SchemaForm and SchemaFields in @gntik-ai/ui/forms, a typed JSON Schema subset, defaults/coercion and a widget registry.
- Validate supported constraints through SchemaIssue[] and issuesToErrors with English and Spanish messages. Harden the existing mapper so untrusted field paths create own properties without mutating prototypes.
- Resolve local $defs references; show unsupported keywords as plain-text JSON fields with a development warning.
- Document all controls, customization, nesting, dialog composition and subset limitations with live examples.

## Impact

- Affected specs: ui/schema-form (ADDED only).
- Affected code: optional forms entry, i18n, docs discovery and generated registry assets.
- Minor @gntik-ai/ui release; no runtime dependencies or root exports added.
- No full JSON Schema, remote references, wizard, read-only mode or server validation.
- Dependencies add-ui-field-array and add-ui-forms-kit-control-bindings already exist.
