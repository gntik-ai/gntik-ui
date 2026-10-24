## Purpose

Expose current kit breakpoints and mobile-first values from the same tokens as CSS.

## ADDED Requirements

### Requirement: useBreakpoint returns the largest matching kit breakpoint

`useBreakpoint()` SHALL return the largest matching sm, md, lg, xl or 2xl min-width breakpoint, or base when none matches. It MUST return the fallback option (default base) on the server and during initial hydration.

#### Scenario: Viewport widths

- **WHEN** the viewport is 500px, 800px, 1100px or 1600px wide
- **THEN** useBreakpoint returns base, md, lg or 2xl respectively

### Requirement: useBreakpointValue resolves mobile-first

`useBreakpointValue(values, options)` SHALL return the value of the largest defined key at or below the current breakpoint, or undefined when none is defined.

#### Scenario: Drawer or inline panel

- **GIVEN** values with base drawer and lg inline
- **WHEN** the breakpoint changes from md to xl
- **THEN** the value changes from drawer to inline

#### Scenario: No base value

- **GIVEN** values with md 2
- **WHEN** the breakpoint is base
- **THEN** the value is undefined
