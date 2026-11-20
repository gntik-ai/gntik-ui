# DataTable opt-in sticky header for non-virtual tables

## Why

- The header is sticky only for virtualized or autoPageSize tables, so a 60-row page of runs or audit events loses its column headers as soon as the page scrolls.
- Making the header sticky is not enough: the card is `overflow-hidden` and the Table container `overflow-auto`, both scroll containers that trap `position: sticky`, and wide tables keep their horizontal scrollbar at the far end of a long table.

## What Changes

- New props `stickyHeader` (default false), `stickyHeaderOffset` (default 0; a number means px, a string reaches `--data-table-sticky-top` unchanged) and `maxHeight` (a number means px).
- Page mode (`stickyHeader`, table fits its container): the card clips with `overflow-clip isolate`, the Table container is `overflow-visible`, and header cells pin to the nearest scrolling ancestor below the offset with opaque `bg-card` cells that keep the head tint.
- Wide tables switch to a bounded body (`data-sticky-header="bounded"`): a focusable region named by the caption whose `max-height` is the scroller's visible height minus the offset. A 1 px tolerance and a ResizeObserver measured before paint keep the switch stable, and widening the container returns to page mode.
- `maxHeight` bounds a non-virtual body in a focusable region with the header pinned at its top and every row mounted; it takes precedence over page mode and overrides `virtualContainerClassName` on virtualized tables. `autoPageSize` ignores both props.
- Body rows get `scroll-margin-top` equal to the offset plus the measured header height, so keyboard focus is never hidden under the pinned header (WCAG 2.4.11); scroll-to-row lifts a row out from under a page-pinned header.
- Examples `examples/sticky-header.tsx` (SidebarLayout and `maxHeight`) and `examples/sticky-header-stacked.tsx` (offset 60, wide table), en and es catalog entries, a Playwright a11y spec and a minor blocks changeset (patch for the UI catalog).

## Impact

- Capability: blocks/data-table (ADDED; no baseline spec).
- Risk R1: opt-in props on one block; without them the DOM and baselines are unchanged, and a revert or kit pin rolls it back.
- No change to the ui Table primitive, ComparisonTable, SidebarLayout or StackedLayout, and no sticky toolbar, footer or totals row.

## Decisions

- ConsoleShell list templates do not enable `stickyHeader` by default; each page opts in.
- `maxHeight` does not bound `autoPageSize` tables, which keep filling their parent.
- The bounded `max-height` is applied to the Table container element (inline style), because Table exposes no container style prop and is out of scope.
