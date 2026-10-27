# Adding a component to @gntik-ai/ui

Each component lives in `src/components/<Name>/`:

| File                 | Purpose                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `<Name>.tsx`         | The component(s). Built on a Base UI primitive when one exists (`@base-ui/react/<part>`).                        |
| `<name>.variants.ts` | `tv()` styles from `../../utils/tv` (tailwind-variants). Slots for compound parts.                               |
| `<Name>.doc.ts`      | `export const doc: ComponentDoc` — name, group, status, description, primitive, pattern, keyboard table, tokens. |
| `examples/*.tsx`     | Real, default-exported usage examples (the docs show and copy these files).                                      |
| `<Name>.test.tsx`    | Keyboard contract (every `doc.keyboard` row) + `expectNoAxeViolations()` on the examples.                        |
| `index.ts`           | Re-exports the components, the variants and `doc as <name>Doc`.                                                  |

Rules:

- Token classes only (`bg-primary`, `text-muted-foreground`, `border-border`…). No hex/rgb, no
  Tailwind palette colours, no gradients, no glow, no `dark:` variants (themes swap the tokens).
- A state shown only by background, tint or shadow needs a `forced-colors:` fallback using CSS
  system colours. Borders, outlines, text and `currentColor` icons survive forced colours; use
  `Highlight` / `HighlightText` for selection and keep tone meaning in text labels. Scope every
  fallback to `forced-colors:` so normal themes stay unchanged.
- Text in brand colours uses the contrast-safe aliases: `text-primary-text`, `text-success-text`,
  `text-warning-text`, `text-destructive-text`. Focus: `focus-ring` (keyboard focus only).
  Use `focus-ring-inset` for flush rows and clipped containers. These utilities require the
  tokens minor release that introduces them; registry consumers must upgrade `@gntik-ai/tokens`
  before copying migrated sources. Keep state-keyed outlines and nonstandard offsets explicit.
- Base UI state attributes drive styling (`data-checked:`, `data-open:`, `data-disabled:`,
  `data-highlighted:`, `data-starting-style:`, `data-ending-style:`…).
- Wrappers take `className?: string` (not Base UI's function form) and merge with `cn()`.
- Icons come from `lucide-react` with `aria-hidden`.
- Content is product-agnostic and in English.

## Responsive props

Import `BREAKPOINTS`, `Breakpoint`, `Responsive<T>`, `responsiveClasses`, `responsiveVars`,
`resolveResponsive` and `isResponsiveObject` from `@gntik-ai/ui`. The one breakpoint order is
`base`, `sm`, `md`, `lg`, `xl`, `2xl`; `base` applies below `sm`. Existing `GridBreakpoint` and
Grid's `Responsive` exports refer to these same types.

Use `responsiveClasses(value, table)` for discrete values. A scalar uses `table.base`; an object
emits defined entries in breakpoint order, regardless of insertion order. Unknown breakpoint keys,
undefined values and missing table entries emit nothing. Keys are `String(value)`, including
`'true'` and `'false'`. The callback form `(breakpoint, value) => className | undefined` is called
once per defined breakpoint, in order.

Every class in a `ResponsiveClassTable` or returned by a callback must be a **full literal string**
visible in source. Never construct classes with interpolation or concatenation: Tailwind cannot
scan them. Follow `Grid/grid.variants.ts` and `Grid/grid-gap.variants.ts`. Pass the returned array
to `cn()` so explicit later breakpoint entries win when classes conflict.

`responsiveVars('dialog-width', { base: '100%', md: '32rem' })` creates `--dialog-width` and
`--dialog-width-md`; numbers become strings. Static consuming classes must read these variables
with fallbacks to smaller breakpoints. `resolveResponsive({ base: 'sheet', md: 'dialog' }, 'lg')`
returns `'dialog'`; below the first defined breakpoint it returns `undefined`. Use CSS for layout
and resolution for JavaScript behaviour.

Grid accepts responsive `cols`, GridItem `span` (including `'full'`), `gap`, `rowGap` and `columnGap`.
Its default gap remains 4. Section accepts responsive `padding` steps `none`, `sm`, `md`, `lg`,
updating root padding, header margin, body gap and divided-header bottom padding together. Scalar
`lg` stays `p-6 sm:p-8`; at a named breakpoint `lg` uses that breakpoint's `p-8`. An explicit
`sm` entry overrides the `sm:p-8` emitted by base `lg`. Section's default padding remains `none`.
