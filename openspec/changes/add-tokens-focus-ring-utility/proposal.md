# Change: Add shared keyboard focus utilities

## Why

The same three focus-visible outline classes are repeated across component sources. A shared utility prevents drift and gives flush rows and clipped viewports an inside outline.

## What Changes

- Add focus-ring and focus-ring-inset: token-coloured solid 2px outlines on :focus-visible with offsets of 2px and -2px.
- Mechanically migrate matching package classes and class expectations, preserving state-keyed outlines and nonstandard offsets.
- Reject the repeated three-class string in brand lint; document both utilities and provide a live keyboard preview.
- Regenerate registry artifacts and add a minor tokens changeset plus patches for changed public packages.

## Impact

- Affected specs: tokens/focus-ring (all requirements ADDED).
- Affected public packages: tokens, ui, blocks, templates, chat, charts.
- MCP guidance names the utilities; the MCP package is private and gets no public changeset.
- Registry consumers must upgrade tokens to the minor release introducing these utilities before copying migrated source.
- Frozen brand and pairing values, third-party focus styles, forced-colours rules and visual baselines stay unchanged.
- Human maintainers must update AGENTS.md and the add-component and brand-review skills; agent configuration is outside this change's permitted edits.
- The delivery contract requires one local commit for the bounded ChangeSet, including its mechanical migration.
