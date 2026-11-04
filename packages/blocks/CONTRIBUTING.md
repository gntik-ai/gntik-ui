# Contributing blocks

Blocks compose kit components and respond to their own container width. KpiRow,
ResourceCardGrid, PageHeader, FormSection and ChartCard establish an inline-size
container; place responsive classes on their descendants. Do not add a nested
`@container` to their inner grids: variants must measure the block's slot.
Keep Tailwind classes as complete literal strings, including column maps.

| Block                      | Container thresholds                                                        |
| -------------------------- | --------------------------------------------------------------------------- |
| KpiRow                     | One column, two at `@lg` (512px), item count (up to five) at `@4xl` (896px) |
| ResourceCardGrid           | One column, two at `@xl` (576px), three at `@4xl` (896px) by default        |
| ResourceCardGrid columns=4 | Two at `@xl`, three at `@3xl` (768px), four at `@4xl`                       |
| PageHeader                 | Full action row at `@xl`; primary action and MoreMenu below it              |
| FormSection                | Title beside fields and sample field columns at `@2xl` (672px)              |
| ChartCard                  | Chart horizontal padding 12px, then 16px at `@sm` (384px)                   |

`columns={2}` caps ResourceCardGrid at two columns. The four-column threshold is
`@4xl`, rather than `@6xl`, so it is reachable in a default Page (980px of content
in a SidebarLayout at a 1280px viewport).

KpiRow and ResourceCardGrid keep `className` on their `dl` and `ul`. Pass placement
and visibility classes for the outer block, such as `col-span-2` or `hidden`, in
`containerClassName`. Existing viewport overrides such as `lg:grid-cols-2` no
longer merge with the internal container variants; competing declarations depend
on CSS order. Prefer container variants for responsive list styling.
FormSection keeps `className`, landmark attributes and `divided` on its section;
its layout grid now lives in an inner element, so grid utilities such as `gap-x-*`
or `grid-cols-*` passed through `className` no longer style that grid.
PageHeader and ChartCard keep `className` on their roots.

Inline-size containment removes intrinsic width. Containers use `w-full min-w-0`
to keep a non-zero width as flex-row items with no basis. Shrink-to-fit parents
(`w-fit` or `inline-block`) still need an explicit width. The roots of PageHeader,
FormSection and ChartCard now fill their available width, including in flex rows.

Each block has a `--container-panel` live example. InspectorLayout examples need
a fixed-height wrapper and `dockedQuery="(min-width: 0px)"` so their panel stays
docked in narrow docs iframes. Use `PageHeader as="div"` in the panel.
Measure container layouts in a browser; jsdom does not evaluate container queries.

At narrower page widths, fewer columns and smaller chart padding are intentional.
The theme-builder narrow KPI preview can change its dark visual baseline; visual
baseline refreshes are performed by the operator in CI.
