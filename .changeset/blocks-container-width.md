---
'@gntik-ai/blocks': minor
---

Reflow KpiRow, ResourceCardGrid, PageHeader, FormSection and ChartCard by container width; use the new containerClassName for KpiRow/ResourceCardGrid wrapper placement or visibility, keep className on the list, and replace viewport overrides such as lg:grid-cols-2 with container variants because they no longer merge with the internal classes and may compete by CSS order.
