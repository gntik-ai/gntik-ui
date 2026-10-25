---
'@gntik-ai/tokens': minor
'@gntik-ai/ui': minor
'@gntik-ai/templates': patch
---

Add eleven named typography roles, Tailwind utilities and design-tool exports, and adopt them in Text and Heading.

Font-size overrides through Text or Heading className now replace the entire role, including its weight, tracking and leading defaults. Add explicit utilities to keep those styles, for example `text-[32px] font-bold tracking-tight` for display text or `text-[12px] font-medium leading-tight` for labels. Preserve the sign-in brand headline's bold weight and tight tracking at its custom size.
