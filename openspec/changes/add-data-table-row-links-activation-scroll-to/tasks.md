# Tasks

- [x] Add typed row activation props and export the ref handle.
- [x] Render the identifying link/button and share the interactive-target guard with detail rows.
- [x] Support modifiers, cancellation, double click, selection and precedence warnings.
- [x] Reveal rows across client pages, groups and virtual windows with optional focus.
- [x] Migrate resource-index without changing its public props.
- [x] Add activation, scrolling and template regression tests.
- [x] Add translated live examples, metadata and a changeset.
- [x] Run scoped repository validation and regenerate registry.
- [x] Commit the bounded source change locally.
- [ ] PR CI: browser accessibility checks in all three themes.

## Checker repair

The public regression seam is the rendered DataTable ref handle, its scroll container and the row's first control. Layout is mocked only at the browser boundary: a 512px viewport, a 40px sticky header and a body origin 72px below the container top (including a 32px top caption). Expected row 800 scroll positions are independently specified as center 31816, start 32032, end/auto 31600. Tests retain meaningful geometry after virtual body elements are replaced.

Before the source fix, `pnpm --filter @gntik-ai/blocks exec vitest run src/tables/DataTable/DataTable.scroll-to-row.test.tsx --maxWorkers=1` failed all four non-zero-layout alignments (for example, end received 31528 instead of 31600). The body origin was missing from the row offset, and the sticky header was missing from the usable viewport. The same command subsequently reproduced the non-virtual sticky-header defect and delayed controlled reveals after pointer, keyboard or assistive click input before their respective fixes.

The scroll hook now measures the body origin in container coordinates and accounts for the sticky header in both virtual and auto-sized native scrolling. The virtual hook updates its own rendered window on imperative scrolls, without dispatching a synthetic event. Both hooks receive the same fallback viewport height. Pending controlled requests cancel on subsequent user input or another request; metadata documents this. The translated example's interaction test also uses explicit browser layout geometry.

Row click precedence is resolved once in the activation hook; disabled row selection does not fall through to detail toggling. DataTable remains wiring, under the 1000-line limit. The existing single changeset covers this repair and registry output is regenerated. No browser suite or visual baseline was run or changed.

## Validation handoff

Final checks and any unrelated or sandbox-limited results are recorded in the structured implementation result. Browser accessibility suites run in PR CI. The tokens mirror-install test cannot run offline: its fallback packs the current 0.5.0 manifest but then reads gntik-ai-tokens-0.2.1.tgz, yielding ENOENT at test/mirror-install.test.mjs:93.

Final repair verification: 39 activation/scroll/example tests pass after the final helper extraction, and the eight-file regression run passes 120 tests. Resource-index passes 18 tests, i18n passes 93, and the isolated sidebar examples pass all 7 with a 60-second test allowance. Workspace lint passes with two existing warnings, typecheck passes, formatting and registry checks pass, strict OpenSpec validation passes, docs coverage passes, and both kit-only checks pass.

The final recursive library gate passes CLI/codemods/icons, then stops at the offline tokens mirror-install ENOENT above. The complete templates run reports 573/574 passing: its untouched sidebar example hits the repository's 5-second timeout on this CPU-limited worker, with no assertion failure. All 7 sidebar tests pass with a 60-second allowance. Per the sandbox reporting rule, the timed-out broad gate is SKIPPED and the isolated pass is recorded separately. The optional full UI run was cancelled after more than 20 minutes on this 2.5-CPU worker without reporting an assertion failure; its i18n suite passes independently. PR CI must finish the full UI and browser suites and complete the templates gate without the sandbox startup timeout. No browser suite was launched here.
