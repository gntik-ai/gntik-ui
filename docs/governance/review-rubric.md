# Review rubric

Reviewers walk the five areas below on every PR that touches `packages/**`. A PR merges when
every **must** is met; **should** items may be deferred with a linked follow-up issue.
CI catches most of it — the rubric is for what CI cannot see.

## 1. Brand

- **must** Token classes only: no hex/rgb, no Tailwind palette colours, no `dark:` (ESLint
  enforces in class strings; check `style={}` and SVG `fill` by eye).
- **must** Sober: no gradients, no glow, flat brand-tinted shadows (`shadow-sm|md|lg`).
- **must** Green (`primary`) is the only brand colour and never signals severity; status uses
  `destructive` / `warning` / `info` / `success`.
- **must** Brand-coloured text uses `text-*-text`; text on tinted chips uses `text-*-chip-text`.
- **must** `brand.css` values unchanged (frozen test). New tokens go in their own file.
- **should** Radii, spacing and type sizes match the legacy catalog section it ports.
- **should** Motion uses `duration-fast|normal|slow` and `ease-standard|emphasized|exit`.

## 2. Accessibility

- **must** Correct role and accessible name; built on the Base UI primitive when one exists.
- **must** Every `doc.keyboard` row has a test; focus is visible (`outline-focus-ring`),
  trapped and returned where the pattern says so.
- **must** `expectNoAxeViolations()` passes on every example; `pnpm a11y` passes for
  ui/blocks/templates changes.
- **must** Animations respect `prefers-reduced-motion` (`motion-reduce:` or motion tokens).
- **should** Checked in high_contrast and at 200% zoom; touch targets ≥ 24×24 px.

## 3. API

- **must** Product-agnostic names and copy (no musematic / Falcone / llmwiki in the core).
- **must** `className?: string` merged with `cn()`; controlled + uncontrolled state where it
  applies; strict TypeScript, no `any`.
- **must** Consistent with sibling components (prop names, `size`/`variant` values, event
  names `on<Thing>Change`).
- **must** Breaking changes are called out in the changeset; mechanical ones ship a codemod.
- **should** Composition (parts, `render`) over configuration (boolean flags).
- **should** Files under 400 lines.

## 4. Tests

- **must** `pnpm lint && pnpm typecheck && pnpm test && pnpm registry:check` green.
- **must** Bug fixes come with a test that fails before the fix.
- **should** Behaviour tested through roles and keys, not class names or snapshots.
- **should** Visual baseline refreshed (`[visual-update]`) when the look changes on purpose.

## 5. Docs

- **must** `Name.doc.ts` complete (description, primitive, pattern, keyboard, tokens) and the
  `status` matches the [lifecycle](./lifecycle.md) gates.
- **must** Examples are real, default-exported, copy-pasteable and in English.
- **must** Catalog section and `kit-registry.json` updated (`pnpm registry`).
- **must** Changeset present for every published package touched.
- **should** Spec linked ([template](./component-spec-template.md)) for new components.

## Verdicts

- **Approve** — every must met.
- **Approve with follow-ups** — shoulds deferred, issues linked in the review.
- **Request changes** — any must missing; name the rubric item (e.g. "Brand 4").
