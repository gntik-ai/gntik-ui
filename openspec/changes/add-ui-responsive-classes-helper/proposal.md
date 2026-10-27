# Shared responsive values

## Why

Grid's private mapper stops at xl. Components and consumers need a shared mobile-first mapping
API whose literal class tables remain visible to Tailwind.

## What Changes

- Add BREAKPOINTS, Breakpoint, Responsive, ResponsiveClassTable, isResponsiveObject,
  responsiveClasses, responsiveVars and resolveResponsive to @gntik-ai/ui.
- Keep existing breakpoint and Grid type imports referring to the canonical types.
- Extend Grid columns and spans to 2xl, make gap and rowGap responsive, and add columnGap.
- Accept responsive Section padding while preserving every existing scalar class string.
- Document and preview the new APIs, verify compiled CSS, regenerate registries and add a minor changeset.

## Impact

- Capability: ui/utils/responsive-classes (ADDED; no baseline).
- Risk: R1. GridBreakpoint gains 2xl, so exhaustive consumer Record literals must include it.
- No dependency changes. No adoption in Stack, Button, Dialog or Drawer.
- Rollback: revert this change or pin the preceding UI minor. No deployment step.
