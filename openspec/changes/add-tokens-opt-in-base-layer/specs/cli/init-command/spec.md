## Purpose

The gntik-ui init command: wires an existing project with the kit's CSS imports, gntik-ui.json, packages and the theme snippet for its framework.

## ADDED Requirements

### Requirement: init adds the base layer import once

`gntik-ui init` SHALL add `@import "@gntik-ai/tokens/base.css";` to the CSS entry exactly once, after the kit styles, and the Next.js layout it prints MUST NOT carry body classes.

#### Scenario: Second run

- **GIVEN** a Vite project
- **WHEN** `gntik-ui init` runs twice
- **THEN** the CSS entry has the base.css import once, after `@gntik-ai/ui/styles.css`
- **AND** the second run reports the CSS file `unchanged`
