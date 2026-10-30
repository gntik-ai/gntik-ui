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
