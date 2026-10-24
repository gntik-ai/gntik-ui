# Shared media-query and breakpoint hooks

## Why

Responsive behaviour currently relies on private hooks and repeated browser media-query reads. Consumers need SSR-safe public hooks and the same breakpoint values as CSS.

## What changes

- Export useMediaQuery and usePrefersReducedMotion from @gntik-ai/ui with one shared MediaQueryList and listener per query, server and hydration fallbacks, and legacy listener support.
- Export useBreakpoint, useBreakpointValue and their types, using breakpointQuery from @gntik-ai/tokens/runtime.
- Export the Tailwind default breakpoint constants from the plain-JavaScript tokens runtime and state their matching CSS theme values explicitly.
- Adopt the hooks in InspectorLayout, Carousel, Tour, DocsLayout Outline, FlowBuilder and useChatScroll. Preserve the true server fallbacks in InspectorLayout and FlowBuilder.
- Add public-seam tests, live catalog examples, generated registry output and one changeset with minor UI/tokens and patch blocks/chat bumps.

## Scope and risk

Risk is R2. The APIs are additive; FlowBuilder changes its query from 768px to 48rem to follow CSS when the browser font size changes. JavaScript behaviour can shift after hydration; use CSS for layout. Rollback is a revert or a previous package pin. The hooks subpath, responsive props, element/container queries, ThemeProvider system queries, charts' independent hook and existing token values are outside this change. No dependencies or deployment changes are required.
