## Purpose

Opt-in global stylesheet of @gntik-ai/tokens: page background, text colour and font from the theme tokens, text selection, scrollbars and overlay setup for apps that cannot write their own CSS.

## ADDED Requirements

### Requirement: Base layer applies only when imported

The base layer SHALL ship as `@gntik-ai/tokens/base.css` and MUST NOT be imported by `tailwind.css` or `@gntik-ai/ui/styles.css`; all of its rules SHALL sit in `@layer base` and use only references to existing tokens.

#### Scenario: App without the import

- **GIVEN** an app that imports only `@gntik-ai/ui/styles.css`
- **WHEN** its CSS is compiled
- **THEN** the output contains no `::selection` rule and no body background from the kit
- **AND** the output equals the origin/main output

#### Scenario: Utility overrides the base layer

- **GIVEN** base.css is imported
- **WHEN** `<body>` has the class `bg-card`
- **THEN** the body background is the card colour

### Requirement: Body colours and font follow the active theme

With base.css imported, `<body>` SHALL use the `--background` colour, the `--foreground` text colour, the `--font-sans` stack and font smoothing, and SHALL follow the theme class on `<html>` without a reload.

#### Scenario: Switch to high contrast

- **GIVEN** base.css is imported and `<html>` has the class `dark`
- **WHEN** the theme changes to `high_contrast`
- **THEN** the body background becomes the `.high_contrast` `--background` colour
- **AND** the body text colour becomes the `.high_contrast` `--foreground` colour

### Requirement: Selection and scrollbar colours reuse existing tokens

base.css SHALL colour `::selection` with `--primary` at 0.28 alpha and set `scrollbar-color` on `html` from `--border` with a transparent track; it MUST NOT introduce a colour value of its own.

#### Scenario: Selected text in light

- **GIVEN** base.css is imported and no theme class is set
- **WHEN** the user selects a paragraph
- **THEN** the selection background is `hsl(var(--primary) / 0.28)`

### Requirement: Scrollbar gutter is reserved only on request

base.css SHALL set `scrollbar-gutter: stable` on `html` only when it has `data-scroll-gutter="stable"`; otherwise the gutter MUST stay `auto`.

#### Scenario: Full-height shell

- **GIVEN** base.css is imported
- **AND** a SidebarLayout with `fullScreen` fills the viewport
- **WHEN** the page renders with classic scrollbars
- **THEN** `html` computes `scrollbar-gutter: auto`
- **AND** no empty gutter is shown

#### Scenario: Content page opts in

- **WHEN** `<html>` has `data-scroll-gutter="stable"`
- **THEN** `html` computes `scrollbar-gutter: stable`

### Requirement: App root is isolated below portalled popups

base.css SHALL give `#root`, `#__next` and any element with `data-app-root` `isolation: isolate`, so a z-index inside the app MUST NOT paint above a popup portalled to `<body>`.

#### Scenario: High z-index inside the app

- **GIVEN** base.css is imported
- **AND** an element with `z-index: 9999` inside `<div id="root">`
- **WHEN** a Popover is opened
- **THEN** the Popover paints above that element
