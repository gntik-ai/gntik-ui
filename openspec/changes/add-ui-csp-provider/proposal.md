# Change: Add CSPProvider and useCSP

## Why

Base UI's scrollbar styles and prehydration scripts need its CSP context to receive an app nonce. Kit-only consumers cannot import that provider directly. PrintLayout's own page style and the Next.js example's theme script also need nonce support under a strict policy.

## What changes

- Export CSPProvider and useCSP from @gntik-ai/ui, forwarding nonce and disableStyleElements to Base UI and kit-owned inline elements.
- Add static native-scrollbar hiding to ScrollArea's viewport and Select's popup/list, leaving the shared Combobox surface unchanged.
- Make PrintLayout's page rule honor the nonce and disableStyleElements.
- Document strict CSP with Next.js 16 proxy.ts, Vite and static hosting; demonstrate the APIs in the catalog.
- Wire a per-response nonce into the production Next.js example and add HTTP-boundary and Playwright checks.
- Add one UI minor changeset and regenerate registry output.

## Scope and risk

Issue #130, risk R2. The app server owns nonce generation and policy headers; the kit does neither. Existing consumers keep the same elements without a provider, apart from additive static scrollbar classes. Style attributes still need style-src-attr 'unsafe-inline'. Monaco, Recharts, a root UI provider and a themeScriptHash API are outside this change. Rollback is a revert or a previous UI version pin. No deployment, publication or dependency changes.
