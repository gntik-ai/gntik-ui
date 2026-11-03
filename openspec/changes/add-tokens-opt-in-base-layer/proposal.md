# Change: Add an opt-in base layer

## Why

`@gntik-ai/ui/styles.css` only imports the token bridge and adds `@source`: nothing styles `<body>`, `::selection` or scrollbars. Apps put `bg-background text-foreground font-sans antialiased` on `<body>` by hand, while kit-only apps cannot write their own CSS. Brand selection and themed scrollbars exist only in the docs app. Base UI asks for root isolation and absolute backdrops over a relative body on iOS 26+ Safari.

## What Changes

- Add `packages/tokens/src/base.css`, exported as `@gntik-ai/tokens/base.css`. It is opt-in: neither `tailwind.css` nor `@gntik-ai/ui/styles.css` imports it. Every rule sits in `@layer base` and reuses existing tokens.
- Apply body background, foreground, font and smoothing; selection from `--primary` at 0.28 alpha; and scrollbar colours from `--border` with a transparent track. Reserve a stable gutter only on `html[data-scroll-gutter='stable']`.
- Isolate `#root`, `#__next` and `[data-app-root]` below body-level portals. Next.js App Router consumers wrap their tree in an element with `data-app-root`.
- Under `@supports (-webkit-touch-callout: none)`, set `position: relative` and `--backdrop-position: absolute` on body. Change only the backdrop slots of Dialog (shared by AlertDialog), Drawer, BottomSheet, CommandPalette and Lightbox to `[position:var(--backdrop-position,fixed)] min-h-dvh`; viewport and popup positioning stays fixed.
- Adopt the import in docs, example-vite, sandbox, musematic and falcone; remove handwritten body classes and the docs selection and WebKit scrollbar rules.
- Have `gntik-ui init` add the import exactly once after the kit styles, preserve move-not-duplicate patching, and remove body classes from its Next.js snippet.
- Add token, CLI, variant, compiled CSS and browser contract tests; document the opt-in baseline; regenerate registry output; release a minor of `@gntik-ai/tokens`, `@gntik-ai/ui` and `@gntik-ai/cli` with one changeset.

## Impact

- Capabilities: `tokens/base-layer`, `ui/overlay-backdrops`, `cli/init-command`. All requirements are ADDED because no baseline specs exist. There are no dependencies on other changes.
- Risk is R1: the stylesheet is additive and opt-in. Rollback is a revert or a pin to the previous package releases. Existing token values and frozen brand colours remain unchanged.
- Chromium 121+ uses standard scrollbars when `scrollbar-color` applies. Docs visual baselines require operator review in CI. The docs `preview-without-base.html` page is a browser contract page for overlay behaviour without the optional baseline.
- The iOS backdrop rule relies on body being the containing block and Base UI scroll locking. A transformed or positioned portal ancestor can break it. iOS 26 Safari toolbar coverage requires a manual check recorded in the PR.
- Root isolation matches only conventional roots, and body colours now show behind short pages and in overscroll areas.
- Named z-index layers, per-container scrollbar utilities, scoped or shadow-root baselines, resets beyond Tailwind preflight, native form control styling and automatic imports from templates styles are out of scope.
- The base layer remains opt-in everywhere. Docs remove their fallback body classes. No kit i18n strings change; docs guidance uses the existing English and Spanish catalog pattern.
