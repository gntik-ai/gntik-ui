---
"@gntik-ai/charts": minor
---

Charts default to the colour-blind-safe series order (`primary, violet, cyan, rose, amber`): every adjacent pair differs in luminance by ≥ 1.5:1 in all three themes. `SAFE_CHART_COLORS` is now an alias of `CHART_COLORS`. Pass `colors` to keep the previous order.
