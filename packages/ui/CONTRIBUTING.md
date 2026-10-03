# Adding a component to @gntik-ai/ui

Each component lives in `src/components/<Name>/`:

| File | Purpose |
| --- | --- |
| `<Name>.tsx` | The component(s). Built on a Base UI primitive when one exists (`@base-ui/react/<part>`). |
| `<name>.variants.ts` | `tv()` styles from `../../utils/tv` (tailwind-variants). Slots for compound parts. |
| `<Name>.doc.ts` | `export const doc: ComponentDoc` — name, group, status, description, primitive, pattern, keyboard table, tokens. |
| `examples/*.tsx` | Real, default-exported usage examples (the docs show and copy these files). |
| `<Name>.test.tsx` | Keyboard contract (every `doc.keyboard` row) + `expectNoAxeViolations()` on the examples. |
| `index.ts` | Re-exports the components, the variants and `doc as <name>Doc`. |

Rules:
- Token classes only (`bg-primary`, `text-muted-foreground`, `border-border`…). No hex/rgb, no
  Tailwind palette colours, no gradients, no glow, no `dark:` variants (themes swap the tokens).
- Text in brand colours uses the contrast-safe aliases: `text-primary-text`, `text-success-text`,
  `text-warning-text`, `text-destructive-text`. Focus: `focus-visible:outline-2
  focus-visible:outline-offset-2 focus-visible:outline-focus-ring`.
- Base UI state attributes drive styling (`data-checked:`, `data-open:`, `data-disabled:`,
  `data-highlighted:`, `data-starting-style:`, `data-ending-style:`…).
- Wrappers take `className?: string` (not Base UI's function form) and merge with `cn()`.
- Icons come from `lucide-react` with `aria-hidden`.
- Content is product-agnostic and in English.
