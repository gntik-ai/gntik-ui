## Purpose

Per-breakpoint prop values for kit components: one breakpoint list and helpers that turn
`{ base, sm, md, lg, xl, 2xl }` objects into static Tailwind classes, CSS variables or a resolved value.

## ADDED Requirements

### Requirement: Responsive objects map to static classes in breakpoint order

`responsiveClasses(value, table)` SHALL map a scalar through the `base` entry and an object to one
class per defined breakpoint, in `BREAKPOINTS` order whatever the key order, and SHALL return nothing
for unknown keys, `undefined` values or missing table entries. Tables SHALL contain full literal
strings. The function form SHALL be called once per defined breakpoint in order.

#### Scenario: Column counts

- **WHEN** `responsiveClasses({ xl: 4, base: 1, md: 2 }, GRID_COLS)` is called
- **THEN** it returns `['grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-4']`

#### Scenario: Scalar or undefined

- **WHEN** scalar `3` or `undefined` is mapped through GRID_COLS
- **THEN** the results are `['grid-cols-3']` and `[]`, respectively

#### Scenario: Boolean toggle

- **GIVEN** a table with `'true'` and `'false'` entries per breakpoint
- **WHEN** `responsiveClasses({ base: true, md: false }, table)` is called
- **THEN** it returns the base `true` class followed by the `md:` `false` class

### Requirement: Continuous values map to breakpoint CSS variables

`responsiveVars(name, value)` SHALL return `--{name}` for the `base` or scalar value and
`--{name}-{breakpoint}` for every other defined breakpoint, with numbers converted to strings,
and SHALL return an empty object for `undefined`.

#### Scenario: Dialog width

- **WHEN** `responsiveVars('dialog-width', { base: '100%', md: '32rem' })` is called
- **THEN** it returns `{ '--dialog-width': '100%', '--dialog-width-md': '32rem' }`

### Requirement: Mobile-first resolution for JavaScript consumers

`resolveResponsive(value, breakpoint)` SHALL return the value of the largest defined breakpoint
at or below `breakpoint`, the scalar itself for a non-object value, and `undefined` when no defined
breakpoint applies. Breakpoint and Responsive SHALL each have one canonical definition, re-exported
through existing entry points. Breakpoint hooks SHALL retain their signatures and behaviour.

#### Scenario: Sheet on phones, dialog from md

- **WHEN** `resolveResponsive({ base: 'sheet', md: 'dialog' }, bp)` is called with `sm` and with `lg`
- **THEN** it returns `sheet` for `sm`
- **AND** it returns `dialog` for `lg`

#### Scenario: Below the first value

- **WHEN** `resolveResponsive({ md: 'dialog' }, 'base')` is called
- **THEN** it returns `undefined`

### Requirement: Grid and Section accept responsive values and keep scalar output

Grid `cols`, GridItem `span`, all three Grid gaps and Section `padding` SHALL accept Responsive
values including `2xl`. Existing scalar and responsive Grid output and scalar Section output MUST
remain identical. Grid's default gap SHALL remain 4 and Section's default padding SHALL remain none.

#### Scenario: Responsive section padding

- **WHEN** a Section renders with `padding={{ base: 'sm', md: 'lg' }}`
- **THEN** the root has `p-4 md:p-8`
- **AND** the header has `mb-3 md:mb-5` and the body has `gap-3 md:gap-5`
- **AND** with divided the header additionally has `pb-3 md:pb-5`

#### Scenario: Unchanged scalar

- **WHEN** a Section renders with `padding="lg"`
- **THEN** the root has `p-6 sm:p-8` as before

#### Scenario: Explicit small breakpoint override

- **WHEN** a Section renders with `padding={{ base: 'lg', sm: 'sm' }}`
- **THEN** the root has `p-6 sm:p-4` without `sm:p-8`

#### Scenario: Responsive Grid gaps and wide columns

- **WHEN** Grid renders with `cols={{ base: 1, '2xl': 6 }}` and `gap={{ base: 2, lg: 6 }}`
- **THEN** it includes `grid-cols-1 2xl:grid-cols-6 gap-2 lg:gap-6`
- **AND** responsive rowGap and columnGap emit gap-y and gap-x classes at their specified breakpoints

### Requirement: Responsive APIs are documented and styled

The public helpers SHALL have TSDoc and a live catalog example. Grid and Section SHALL show the new
props. All new preview copy SHALL use the English and Spanish i18n catalogs and all examples SHALL
be axe-clean in dark, light and high_contrast. The docs CSS compiler SHALL generate the shipped
literal table classes. A minor @gntik-ai/ui changeset SHALL describe the GridBreakpoint extension.

#### Scenario: Compiled responsive classes

- **WHEN** Tailwind compiles candidates scanned from packages/ui/src
- **THEN** CSS contains `2xl:grid-cols-6`, `2xl:col-span-full`, `lg:gap-6` and `md:p-8`
