# Blocks reflow by container width

## Why

Viewport breakpoints keep wide layouts inside narrow InspectorLayout panels and
split panes. The five reused blocks need to measure their own slot instead.

## What changes

- Give KpiRow and ResourceCardGrid a full-width inline-size container wrapper,
  preserving list semantics, labels and className; add optional containerClassName.
- Switch KpiRow columns and internal strip dividers to container thresholds.
- Make PageHeader, FormSection and ChartCard roots full-width query containers.
  Move FormSection's grid inside its section and update default sample fields.
- Add five docked InspectorLayout examples, browser measurements, React API
  regressions, contribution guidance and a minor blocks changeset.

## Impact

Capability: blocks/container-queries. All requirements are ADDED; no baseline exists.
Only @gntik-ai/blocks runtime behavior changes. No UI layout containers or i18n
catalog additions. Runtime copy stays unchanged; English demo copy follows existing
examples. ResourceCardGrid columns=4 uses @xl / @3xl / @4xl so four columns remain
reachable in the default 980px Page frame; other thresholds follow the approved plan.

List placement/visibility belongs on containerClassName. Viewport overrides no
longer merge with internal container variants and may depend on CSS order.
Full-width roots prevent zero-width flex items; shrink-to-fit parents still need
explicit width. Narrower pages intentionally show fewer columns and 12px chart
padding. The theme-builder narrow strip preview may change theme-builder--dark;
operator-managed visual refresh and browser CI remain required.

No deployment, publication, new dependencies or changes to UI layouts are included.
