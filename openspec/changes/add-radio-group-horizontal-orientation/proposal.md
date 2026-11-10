# Add a horizontal orientation to RadioGroup

## Why

RadioGroup fixes its group slot to a single column and takes no layout prop, so two or three short options (Yes / No, Monthly / Annual, 7 / 30 / 90 days) always stack. Consumer apps cannot fix this with `className` because the kit-only gate rejects it, so the kit has to provide the layout.

## What changes

- Add `orientation?: 'vertical' | 'horizontal'` (default `'vertical'`) to `RadioGroupProps` as a `tv()` variant. A horizontal group also gets `data-orientation="horizontal"`; vertical groups get no new attribute.
- `plain` + `horizontal`: a wrapping row (`flex flex-row flex-wrap items-start gap-x-6 gap-y-2.5`).
- `card` + `horizontal`: equal-width auto-fit columns (`grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))]`), one column at phone width; the checked card keeps its border and ring.
- `list` keeps its vertical divided rows whatever the orientation.
- Keyboard and semantics do not change; no `aria-orientation` is added.
- Add a RadioGroupInline example with en and es catalog entries, docs, tests, a changeset and regenerated registry output.

## Scope and risk

- Change id: add-radio-group-horizontal-orientation. Capability: ui/radio-group. All requirements are ADDED; no baseline exists. No dependencies.
- R1, additive. Without `orientation` the DOM and classes are unchanged.
- Long labels make a ragged wrapped row, so the docs limit horizontal groups to two to four short options. Wrapped options can be missed under magnification; wrapping is still preferred to sideways scroll. The 12rem card minimum can make trailing content wrap.
- Out of scope: CheckboxGroup orientation, a segmented variant, size or label-position variants, a `columns` prop, a real horizontal list layout, replacing the PricingTable and PlanCard ToggleGroups, `aria-orientation`.
- Roll back by pinning the previous @gntik-ai/ui release or reverting.
