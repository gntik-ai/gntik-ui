## Purpose

Subscribe to CSS media queries from React, with a fixed fallback on the server and during hydration.

## ADDED Requirements

### Requirement: useMediaQuery follows the query and falls back on the server

`useMediaQuery(query, fallback)` SHALL return whether the query matches and SHALL update when it changes. On the server, during initial hydration and without matchMedia it MUST return fallback (default false).

#### Scenario: Window resized

- **GIVEN** useMediaQuery('(min-width: 64rem)') at 1280px
- **WHEN** the window narrows to 800px
- **THEN** the hook returns false

#### Scenario: Server render and hydration

- **WHEN** the hook renders with renderToString and fallback true
- **THEN** it returns true without reading window
- **AND** hydration uses the fallback before the client snapshot, without mismatch warnings

### Requirement: Consumers share browser subscriptions

Consumers of one query string SHALL share one MediaQueryList and one change listener. The listener MUST be removed when the last consumer unmounts.

#### Scenario: Ten consumers

- **WHEN** ten consumers mount with the same query
- **THEN** one browser query result and one change listener are in use
- **AND** the listener is removed after all ten unmount

### Requirement: Reduced motion preference is read through one shared hook

`usePrefersReducedMotion()` SHALL follow '(prefers-reduced-motion: reduce)' and return false on the server. Kit consumers in UI, blocks and chat SHALL use the shared hooks instead of hand-rolled matchMedia calls, except ThemeProvider and theme-script.

#### Scenario: User asks for less motion

- **GIVEN** the reduced-motion query matches
- **WHEN** an autoplaying Carousel renders and the user advances a slide
- **THEN** autoplay starts paused
- **AND** scrolling uses auto instead of smooth
