## Purpose

How blocks adapt to the inline size of their own slot rather than the viewport.

## ADDED Requirements

### Requirement: Grid blocks pick columns from their container width

KpiRow and ResourceCardGrid SHALL choose columns from their own container width.
KpiRow SHALL use one, two and four columns for four items at 320, 640 and 960px.
ResourceCardGrid SHALL use one, two and three columns at these widths by default;
columns=2 SHALL cap at two and columns=4 SHALL reach four at 960px.

#### Scenario: KPIs in a side panel

- **GIVEN** a 1440px viewport and four KPIs inside a 320px InspectorLayout panel
- **WHEN** the block renders
- **THEN** it shows one column and the strip has horizontal dividers only

#### Scenario: Grid blocks in wider slots

- **GIVEN** a 1440px viewport
- **WHEN** slot width changes to 640px then 960px
- **THEN** KpiRow shows two then four columns and ResourceCardGrid shows two then three
- **AND** strip dividers are vertical only, with no outer-edge or doubled border

### Requirement: PageHeader folds actions by its own width

PageHeader SHALL show the primary action and More actions menu below @xl, and the
full action row at @xl, without changing runtime copy.

#### Scenario: Narrow and wide panes

- **GIVEN** three actions on a 1440px viewport
- **WHEN** the slot is 360px wide
- **THEN** only the primary action and menu are visible, with other actions in the menu
- **WHEN** the slot grows to 900px
- **THEN** the full action row shows and the menu is not exposed

### Requirement: FormSection stacks in narrow containers

FormSection SHALL stack the title above full-width default fields at 400px and
place the title beside fields at 900px, independently of the viewport.

#### Scenario: Inspector panel form

- **GIVEN** a 1440px viewport
- **WHEN** a default FormSection renders at 400px
- **THEN** the title is above the full-width Project name and Description fields
- **WHEN** the slot grows to 900px
- **THEN** the title sits beside the fields

### Requirement: ChartCard padding follows container width

ChartCard SHALL use 12px horizontal chart padding below @sm and 16px at @sm.

#### Scenario: Narrow chart slot

- **GIVEN** a 1440px viewport
- **WHEN** ChartCard renders at 320px then 480px
- **THEN** chart padding is 12px then 16px

### Requirement: Container wrappers preserve the public styling contract

KpiRow and ResourceCardGrid SHALL preserve dl/ul semantics and aria-label.
className SHALL style the list and containerClassName SHALL style the wrapper.
FormSection SHALL retain className, attributes and divided on its section with an
inner layout grid. PageHeader and ChartCard SHALL retain className on the root.

#### Scenario: Existing className

- **WHEN** ResourceCardGrid receives className="gap-6" and containerClassName="col-span-2"
- **THEN** the ul has gap-6 and its container wrapper has col-span-2

### Requirement: Blocks retain standard frame and flex sizing

At 1280x900, SidebarLayout and default Page SHALL retain 980px content, four KPI
columns, three default resource columns, four columns with columns=4, full header
actions, side-by-side form fields and 16px chart padding. Each block SHALL remain
non-zero width as a direct flex-row item with no basis.

#### Scenario: Default frame

- **WHEN** all five blocks render in the standard frame
- **THEN** their full-width layouts match the specified standard values
- **AND** narrow slots on a wide viewport never inherit the wide layout

### Requirement: Panel examples are accessible across themes

All five blocks SHALL have docked InspectorLayout live examples and no axe
violations in dark, light and high_contrast. Runtime strings and token rules SHALL
remain unchanged. Shrink-to-fit parent limitations SHALL be documented.

#### Scenario: Narrow docs iframe

- **WHEN** any panel example renders below the default InspectorLayout docked breakpoint
- **THEN** its panel stays docked and the example remains axe-clean in all three themes
