## Purpose

Motion tokens, CSS variants and JavaScript behavior follow OS reduced motion and an additive in-app scope.

## ADDED Requirements

### Requirement: Motion scope attribute collapses durations

An element with data-motion="reduce" SHALL set --duration-fast, --duration-normal and --duration-slow to 0ms for itself and descendants without changing existing values or easings.

#### Scenario: Whole app

- **GIVEN** the OS motion preference is no-preference
- **WHEN** html has data-motion="reduce" and a Dialog opens
- **THEN** --duration-normal computes to 0ms and the Dialog transition duration is 0s

### Requirement: Reduced-motion variants honour the scope

The motion-reduce variant SHALL apply for OS reduce or a data-motion="reduce" scope, and motion-safe MUST NOT apply inside that scope. Scope selectors SHALL have zero specificity.

#### Scenario: Scoped skeleton

- **GIVEN** OS no-preference and a scoped Skeleton and StatusDot
- **WHEN** the components render
- **THEN** the Skeleton animation is none and the StatusDot ping is hidden
- **AND** unscoped siblings still animate

### Requirement: ThemeProvider stores and applies the motion choice

ThemeProvider SHALL expose motion and setMotion, with optional defaultMotion and motionStorageKey. Reduce SHALL set data-motion="reduce" on target() and persist reduce. System SHALL remove both the attribute and stored value. Null storage SHALL disable persistence. themeScript SHALL restore motion before hydration while preserving positional theme arguments.

#### Scenario: Turn on and restore

- **WHEN** setMotion('reduce') is called and the page reloads with themeScript
- **THEN** html has data-motion="reduce" before hydration

#### Scenario: Back to system

- **WHEN** setMotion('system') is called
- **THEN** the attribute and stored value are removed and OS reduce still applies

### Requirement: Script-driven motion follows the scope

Runtime helpers SHALL read an element and its ancestors or html by default, and observe data-motion and OS changes. UI hook aliases SHALL share one implementation. Hooks SHALL return false on the server and during hydration. Carousel, Tour, Outline, chat scrolling and live charts SHALL follow html reduced motion.

#### Scenario: Carousel autoplay

- **GIVEN** html has data-motion="reduce"
- **WHEN** an autoplay Carousel mounts
- **THEN** it does not advance automatically and shows the stopped state
