---
name: brand-review
description: Review a diff or files against the gntik-ui brand rules — token classes only, contrast aliases for brand text and tinted chips, underlined inline links, no palette colours / dark: / gradients / glow / hex, frozen token values, agnostic English copy and accessibility. Use before committing UI changes in gntik-ui or in a product built on it, or when asked for a brand/design-system review.
---

# Brand review

Review the changed lines (default: `git diff` against the merge base, plus staged and untracked
UI files). Report findings as `path:line — rule — fix`, most severe first. Fix them if asked.

## 1. Automatic checks

- `npx eslint <changed files>` — the brand `no-restricted-syntax` rules (palette, `dark:`,
  gradients, hex in class strings).
- MCP `validate_page` on each changed TSX/HTML file, if the gntik-ui server is connected.
- Token values: `git diff -- packages/tokens/src/brand.css` must not change any HSL value
  (`packages/tokens/test/frozen-values.json` is the guard). New tokens need an explicit owner decision.

## 2. Manual checklist (what lint cannot see)

**Colour and tokens**
- Every colour is a token class (`bg-card`, `text-muted-foreground`, `border-border`, `fill-primary`…)
  or `@gntik-ai/tokens/runtime` in JS (charts/canvas). No `style={{ color: … }}`, `rgb()`, `hsl()` literals,
  arbitrary values like `bg-[…]` with colours, or SVG `fill="#…"` (official logo artwork in a preset is the only exception).
- Brand-coloured text uses the contrast aliases: `text-primary-text`, `text-success-text`,
  `text-warning-text`, `text-destructive-text` — not `text-primary` / `text-success` on page backgrounds.
- Text on tinted backgrounds (`bg-<tone>/10…`, chips, badges): `text-<tone>-chip-text`.
- Green is the brand only: the primary never signals severity; errors/warnings/info use
  destructive/warning/info tokens.
- No gradients, no glow, no coloured or heavy shadows (flat `shadow-sm`-style only). No `dark:`:
  themes swap tokens. Check all three themes mentally: dark (default), light, high_contrast.

**Links and focus**
- Inline links in running text are underlined (the kit `Link` does it).
- Focusable elements show `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring`
  (or come from a kit component that does).

**Accessibility**
- Correct roles and accessible names (icon-only buttons have `label`/`aria-label`; decorative icons `aria-hidden`).
- Keyboard: every interaction reachable and operable; overlays trap and return focus; documented
  `doc.keyboard` rows are tested.
- New examples/compositions have an `expectNoAxeViolations()` test; `motion-reduce:` on animations.

**Content and structure**
- English, product-agnostic copy in kit packages; product names/data only in app fixtures or presets.
- Kit code is reused, not copied: a page restyling a kit component with ad-hoc classes, or
  re-implementing an existing block, is a finding (`list_kit query=…` to find the item).
- Package imports (`@gntik-ai/*`) in apps; apps/musematic and apps/falcone stay kit-only.
- Files under the size limit; strict TS, no `any`.

## 3. Verdict

End with: blocking findings (rule violations, a11y failures, token value changes), suggestions,
and the gate commands still to run (`pnpm lint && pnpm typecheck && pnpm test && pnpm registry:check`,
`pnpm a11y` for ui/blocks/templates).
