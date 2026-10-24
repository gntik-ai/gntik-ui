---
'@gntik-ai/chat': patch
'@gntik-ai/blocks': patch
---

Report failed clipboard writes in chat, DescriptionListCard and LogViewer; onCopy and onCopyLine now fire only after successful writes, so click-based analytics may record fewer events.
