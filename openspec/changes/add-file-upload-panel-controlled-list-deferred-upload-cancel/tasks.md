# Tasks

## 1. Implementation

- [x] 1.1 Add controlled lists, change reasons, manual upload, beforeUpload, cancellation and removal veto.
- [x] 1.2 Extend UploadItem/UploadStatus and make simulateUpload honor abort.
- [x] 1.3 Add en/es messages and optional label overrides.
- [x] 1.4 Add controlled manual submission and automatic cancellation examples.

## 2. Tests

- [x] 2.1 Derive public component and uploader tests from the acceptance criteria, with red before green for each new behavior.
- [x] 2.2 Cover progress dedupe, batch order, cancellation settles, unmount, retry, and synchronous/asynchronous removal.
- [x] 2.3 Add axe coverage for pending, uploading and pending-removal states across all three themes.
- [ ] 2.4 Browser accessibility/contrast suites run in PR CI.

## 3. Docs and release

- [x] 3.1 Document APIs, transport signal forwarding and consumer compatibility changes; add a minor blocks changeset.
- [x] 3.2 Run scoped library build/tests, lint, typecheck, registry:check and kit-only checks; regenerate the registry.
- [x] 3.3 Run openspec validate add-file-upload-panel-controlled-list-deferred-upload-cancel --strict.

## Validation limits

The full library aggregate stops at the unrelated tokens mirror-install fixture in this offline sandbox: its local-pack fallback expects gntik-ai-tokens-0.2.1.tgz, while the current package produces 0.3.0 (ENOENT). Libraries other than tokens are tested separately. Full monorepo, MCP/evals and browser suites remain with PR CI.

Final focused validation: 44 FileUploadPanel tests pass, including unchanged existing regression files, legacy fractional progress, and axe checks in all three themes. Two unrelated template files failed collection during a concurrent dependency rebuild; both passed on isolated retry after the outputs were stable. The remaining library files passed. Library build, lint, monorepo typecheck, registry:check, docs build/coverage, kit-only checks and strict OpenSpec validation passed.

## Checker follow-up

- Reproduced controlled update loss at the public component seam with a stateful parent, two uploads and batched progress: a.csv remained at 0% instead of 50%. Command: `pnpm --filter @gntik-ai/blocks exec vitest run src/forms/FileUploadPanel/FileUploadPanel.controlled.test.tsx --configLoader runner`.
- Confirmed cause: changeItems advanced its pending-list ref only in uncontrolled mode. It now advances the ref in both modes and still renders only the supplied controlled list, resynchronizing when that list changes.
- Added regression coverage for concurrent progress/completion and async preprocessing followed by immediate upload completion.
- Reproduced and fixed cancellation labeling/reason when a controlled parent omits the optional File property. Upload tracking retains cancellation semantics; existing fixture-only removal remains unchanged.
- Kept the documented pending-size convention and legacy fractional progress behavior to satisfy the existing acceptance criteria without widening the shared formatter API.
- Follow-up validation: all 47 focused upload tests pass, including the four unchanged regression files and axe states in all three themes. Library build, lint, monorepo typecheck, registry generation/check, docs coverage and both kit-only checks pass.
- The full blocks unit suite also passes. The remaining-library run passed CLI, codemods, icons, charts, editor and flow; its UI and dependent suites had not completed at handoff and remain with PR CI.
- The aggregate library tests stop at the existing offline tokens mirror fixture: ENOENT for gntik-ai-tokens-0.2.1.tgz (the local package produces 0.3.0). Browser suites remain with PR CI.
