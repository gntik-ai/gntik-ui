---
'@gntik-ai/ui': patch
'@gntik-ai/blocks': patch
---

Follow provider or runtime week starts and clocks in scheduling blocks, add weekend attributes and overrides, and export localeWeekStart; without a provider, en-US runtimes now use Sunday-first weeks and 12-hour times (pass weekStartsOn={1} and hourCycle="h23" to retain the previous layout).
