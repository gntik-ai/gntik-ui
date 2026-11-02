# Add KitProvider and useApp

## Why

Products compose theme, locale, density, links, tooltips, toasts and announcements by hand.
Missing providers fail at runtime, and embedded hosts have to pass a container to every overlay.

## What changes

- Add KitProvider with typed pass-through settings and useApp() for toast, confirm and announce.
- Compose CSP, Theme, I18n, Density, Link, Tooltip, Toast, Dialogs and LiveAnnouncer in that order;
  children and the single Toaster live inside them. Optional providers render only when configured.
- Reuse app-level singletons in nested KitProviders and inherit settings that are not supplied.
- Route every overlay, including full-screen Dropzone, through the portal context, preserving
  explicit overlay container precedence and the document.body fallback.
- Scope theme, locale and density to a wrapper and portal host when scoped is enabled.
- Scaffold KitProvider in Vite and Next.js, update MCP setup guidance and adopt it in the apps.
- Include catalog examples, the prop-to-provider table, tests, changesets and generated registries.

## Scope and risk

- Change id: add-ui-kit-provider. Capability: ui/kit-provider (all requirements ADDED).
- Depends on add-ui-use-dialogs (#135) and add-ui-csp-provider.
- R2: the portal context crosses overlay boundaries; each listed overlay has a container test.
- Apps retaining their own ToastProvider or Toaster must pass toast={false}.
- Scoped mode supplies subtree context, not CSS isolation. Tokens on :root and preflight remain
  global; hosts must scope their own --primary and --background variables.
- Form-scoped defaults and empty-state defaults remain on Fieldset and EmptyState.
- Per-component defaults, CSS prefixes/shadow roots, actions outside React, changes to individual
  provider APIs, unrelated flaky tests, publishing and deployment are out of scope.
- Roll back by reverting the change or pinning the previous @gntik-ai/ui minor release.
