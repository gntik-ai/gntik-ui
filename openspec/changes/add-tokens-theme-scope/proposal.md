# Scoped theme tokens and themed portals

## Why

Light tokens currently live on `:root`, and overlays portal to the page body. A light preview inside a dark or high-contrast page therefore needs inline token overrides and loses its theme when an overlay opens.

## What changes

- Generate `packages/tokens/src/scope.css` from the unchanged `brand.css` and `pairing.css`. The `.light` selector repeats the root keys redeclared by dark or high-contrast themes, including shadows, plus root pairing aliases. Each theme selector declares its color-scheme. Import it after pairing.css and export `./scope.css`.
- Add the optional `ThemeScope` wrapper with Base UI `useRender`, a required `ResolvedTheme`, children, className and render. It applies the theme class and data attribute and overrides only `useTheme().resolved`; mode and setMode continue to control the page.
- Provide a body-level themed portal container, created in an effect and held in state, removed on unmount and safe during SSR. All 19 Base UI Portal consumers use it unless an explicit container is supplied. Outside a scope the context remains undefined.
- Add optional `ThemeProvider.forcedMode`, which overrides the applied theme while preserving stored preferences and setMode behavior until the override is removed.
- Replace theme-builder inline preview variables with ThemeScope, document nested scopes, a light card with an open Select and forced mode, and translate new labels into English and Spanish.
- Add regression, portal coverage and browser computed-style/axe tests; regenerate the registry and llms output; release a minor of `@gntik-ai/tokens` and `@gntik-ai/ui` with one changeset.

## Scope and risk

Risk is R2: all overlays read the new context, and existing application or third-party `.light` classes now receive the light tokens. Explicit containers and the undefined context default preserve existing overlay behavior. Frozen token values, brand.css and pairing.css remain unchanged. Scope-aware chart, flow and editor runtime colors, brand overrides, transition suppression, cookie storage and Shadow DOM are outside this change. No dependencies or deployment changes are required.

Capabilities are `tokens/theme-scope`, `ui/theme-scope` and `ui/theme-provider`. All requirements are ADDED because no baseline specs exist. There are no dependencies on other OpenSpec changes. Rollback consists of pinning the previous package releases or reverting this change.
