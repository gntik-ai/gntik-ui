---
name: add-component
description: Add or change a component in @gntik-ai/ui (or a block/template) following the gntik-ui folder contract — Base UI primitive, tv() variants, *.doc.ts with keyboard table, examples, keyboard + axe tests, index export, registry regeneration and a changeset. Use when asked to create, port or extend a kit component in the gntik-ui repo.
---

# Add a component to gntik-ui

Read `packages/ui/CONTRIBUTING.md` first; it is the contract. Look at a sibling of similar shape
(e.g. `Switch`, `Dialog`, `Menu`) and copy its structure. Base UI API docs:
`packages/ui/node_modules/@base-ui/react/docs/react/components/<name>.md`.
The visual reference (sizes, spacing, radii, token colours) is the legacy catalog in
`apps/docs/src/catalog/*.jsx`: port its look, not its copy.

## Folder: `packages/ui/src/components/<Name>/`

| File | Content |
| --- | --- |
| `<Name>.tsx` | Wrapper(s) on the Base UI part when one exists. Takes `className?: string`, merged with `cn()`. Style via Base UI data attributes (`data-checked:`, `data-open:`, `data-disabled:`, `data-highlighted:`, `data-starting-style:`…). |
| `<name>.variants.ts` | `tv()` from `../../utils/tv`; slots for compound parts. Token classes only. |
| `<Name>.doc.ts` | `export const doc: ComponentDoc` — name, group (Actions/Forms/Overlays/Navigation/Display/Feedback/Layout/Theme), status, description, primitive, pattern, `keyboard: [[key, behaviour]…]`, tokens. |
| `examples/*.tsx` | Real default-exported examples, English and product-agnostic copy. The docs and MCP show them as usage. |
| `<Name>.test.tsx` | One test per `doc.keyboard` row (userEvent) + `await expectNoAxeViolations()` (from `../../test/a11y`) on each example. |
| `index.ts` | Re-export components, variants and `doc as <name>Doc`. |

Layouts go in `packages/ui/src/layouts/<Name>/` with the same contract (`embedded` prop when they
can sit inside a shell that already renders `<main>`).

## Style rules (ESLint enforces the first ones)

- No Tailwind palette colours, no `dark:`, no gradients, no hex; flat shadows, no glow.
- Brand text: `text-primary-text` / `-success-` / `-warning-` / `-destructive-text`; on tinted
  chips `text-<tone>-chip-text`. Focus ring:
  `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring`.
- Icons from `lucide-react` with `aria-hidden`. `motion-reduce:` on animations.
- Strict TS, no `any`, react-hooks v7 (no sync setState in effects, no `ref.current` in render).

## Wire it up

1. Export from `packages/ui/src/index.ts` (if you may not edit it, report the exact line).
2. `cd packages/ui && npx vitest run src/components/<Name> && npx tsc -p tsconfig.json --noEmit`, then `npx tsdown` so dependants see the new `dist`.
3. `pnpm registry` (regenerates `kit-registry.json`, `INVENTORY.md`, `registry.json`, llms files).
4. `pnpm changeset` — minor for a new component, patch for a fix.
5. Optional catalog entry: section in `apps/docs/src/catalog/<group>.jsx` with preview + `<CodeBlock>`,
   `window.SECTIONS['id']`, `status:'done'` in `registry.jsx`.

Blocks: `packages/blocks/src/<family>/<Name>/` with `<Name>.tsx`, `fixtures.ts` (props default to
them), `block.meta.ts` (`uses`), test. Templates: `packages/templates/src/<id>/Page.tsx`, `data.ts`,
`template.meta.ts` (`layout`, `blocks`), test; console pages use `shared/ConsoleShell`.

## Done means

`pnpm lint && pnpm typecheck && pnpm test && pnpm registry:check`, plus `pnpm a11y` when ui, blocks
or templates changed. Visual baselines regenerate in CI (`[visual-update]` in the commit message).
