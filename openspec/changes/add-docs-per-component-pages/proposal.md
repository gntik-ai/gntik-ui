# Deep-linkable catalog pages

## Why

The UI library renders all live examples together, and catalog hashes identify only sections.
Readers need shareable pages for components, blocks, layouts and templates and documentation
of compound parts and styled state attributes.

## What Changes

- Add registry-backed hash item routes, navigation history, heading focus and document titles.
- Make the UI library a grouped index and reuse its renderer for individual component pages.
- Add optional anatomy and dataAttributes to ComponentDoc and display anatomy and styling hooks.
- Support gallery item routes while preserving the chat section and bare section links.
- Generate registry identities for flat documented UI entry points so every index row has a kit ID.

## Impact

- Capabilities: docs/per-component-pages and ui/component-doc (ADDED; no baseline).
- Risk R1: additive documentation API, no runtime component or token changes.
- The index derives its count from documentation (112 entries at implementation time).
- Minor @gntik-ai/ui changeset. Rollback by revert or pinning the preceding UI version.
