# Component lifecycle

Every component, layout, block and template moves through four stages:

```
lab  →  beta  →  stable  →  deprecated  →  (removed in the next major)
```

A stage is a promise to consumers about how much the API can still move. Promotion is
earned by passing gates that CI already runs; nothing is promoted by opinion alone.

## Where the stage lives

| Stage | `status` in `<Name>.doc.ts` | Catalog / registry badge | Semver promise |
| --- | --- | --- | --- |
| lab | `'experimental'` | Lab | none: may change or disappear in any release |
| beta | `'beta'` | Beta | breaking changes allowed in a **minor**, always with a changeset that says so |
| stable | `'stable'` | Stable | breaking changes only in a **major**, with a codemod when mechanical |
| deprecated | `'stable'` + `deprecated` note (see below) | Deprecated | works unchanged until the next major |

`ComponentDoc.status` (`packages/ui/src/doc.ts`) is the single source; `pnpm registry` copies
it into `kit-registry.json`, which feeds the catalog, the CLI (`gntik-ui list`) and the MCP
server. Blocks and templates carry the same field in `block.meta.ts` / `template.meta.ts`.

> Deprecation is not yet a `status` value. Until `doc.ts` gains `'deprecated'` (plus a
> `replacement?: string`), mark it with a `@deprecated` JSDoc tag on the export, a line in
> `description`, and a runtime `console.warn` in development builds only.

## Gates per stage

| Gate (CI job / command) | lab | beta | stable |
| --- | :-: | :-: | :-: |
| Folder contract (`packages/ui/CONTRIBUTING.md`): `Name.tsx`, `name.variants.ts`, `Name.doc.ts`, `examples/`, `index.ts` | yes | yes | yes |
| Brand rules: `pnpm lint` (no palette colours, no `dark:`, no gradients, no hex) | yes | yes | yes |
| `pnpm typecheck` (strict, `noUncheckedIndexedAccess`) | yes | yes | yes |
| Keyboard contract test: every `doc.keyboard` row covered (`pnpm test`) | — | yes | yes |
| `expectNoAxeViolations()` on every example (`pnpm test`) | — | yes | yes |
| Listed in `kit-registry.json`, `pnpm registry:check` clean | — | yes | yes |
| Catalog section with live preview + copyable code | — | yes | yes |
| Browser a11y gate: `pnpm a11y` (axe in Chromium, all 3 themes) | — | — | yes |
| Visual baseline recorded in CI (`[visual-update]` commit) | — | — | yes |
| Used by at least one app (`apps/musematic`, `apps/falcone`, examples) | — | — | yes |
| One review cycle with no API change requested ([review rubric](./review-rubric.md)) | — | — | yes |
| Spec doc ([template](./component-spec-template.md)) linked from the PR | yes | yes | yes |

## Moving between stages

- **lab → beta**: open a PR that flips `status` to `'beta'`, adds the tests and the catalog
  section, and runs `pnpm registry`. Changeset: `minor`.
- **beta → stable**: the a11y and visual gates pass, a consuming app uses it, and the last
  review raised no API change. Changeset: `minor` ("Button is now stable").
- **stable → deprecated**: there is a replacement (or a reason to drop it), the deprecation
  is announced in a changeset (`minor`), docs show the replacement first, and — when the
  migration is mechanical — a codemod lands in `@gntik-ai/codemods` in the same PR. See
  [release.md](./release.md#deprecation-policy).
- **deprecated → removed**: only in the next major, at least one minor release after the
  deprecation shipped.
- **Demotion** (stable → beta) is a breaking signal: only in a major, with a changeset.

## Tokens

`@gntik-ai/tokens` has no lab stage. Colour values in `brand.css` are frozen
(`test/frozen-values.json`); new tokens (e.g. motion) arrive as `beta` in a separate file and
become stable after one release cycle without changes.
