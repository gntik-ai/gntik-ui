## Summary

<!-- What changes and why. Link the issue (Closes #…) and, for a new component, its spec
     (docs/governance/component-spec-template.md). -->

## Screenshots

<!-- Before / after in dark · light · high_contrast for any visual change. Delete if none. -->

| Theme | Before | After |
| --- | --- | --- |
| dark | | |
| light | | |
| high_contrast | | |

## Checklist

Gate (all green locally):
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test` (keyboard contract + `expectNoAxeViolations()` for touched components)
- [ ] `pnpm registry:check` (ran `pnpm registry` if inventory, docs or status changed)
- [ ] `pnpm a11y` — if `packages/ui`, `blocks` or `templates` changed

Release:
- [ ] Changeset added (`pnpm changeset`) for every published package touched — or not needed
- [ ] Breaking change? Called out in the changeset and a codemod added in `packages/codemods`
- [ ] Visual change? Commit message carries `[visual-update]` to refresh baselines in CI

Brand rules ([review rubric](../docs/governance/review-rubric.md)):
- [ ] Token classes only — no hex/rgb, palette colours, `dark:`, gradients or glow
- [ ] Brand-coloured text uses `text-*-text` / `text-*-chip-text`; focus uses `outline-focus-ring`
- [ ] `brand.css` values untouched
- [ ] Product-agnostic, English copy; no product names in core packages
- [ ] Animations respect reduced motion (`motion-reduce:` or motion tokens)
- [ ] `status` in `*.doc.ts` / `*.meta.ts` matches the [lifecycle](../docs/governance/lifecycle.md) gates
