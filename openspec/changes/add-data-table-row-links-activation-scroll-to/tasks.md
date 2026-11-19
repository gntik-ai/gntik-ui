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

## Validation handoff

The 25 focused activation/scroll/example tests and all 18 resource-index tests pass. Library build, lint, typecheck, registry checks, docs coverage, both kit-only checks and strict OpenSpec validation pass. The library unit gate stops at the offline tokens mirror-install tarball ENOENT. Broad worker runs were interrupted after roughly 30–40 minutes without completion: UI is not verified by that run; blocks reported an unrelated FilterBar debounce assertion and templates reported unrelated sidebar and password-change failures. PR CI must complete the broad suites and browser accessibility checks.
