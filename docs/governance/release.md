# Releasing

Packages publish to GitHub Packages (`@gntik-ai/*`, restricted) through
[Changesets](https://github.com/changesets/changesets). Config: `.changeset/config.json`;
workflow: `.github/workflows/release.yml`.

## Every PR

1. If the PR changes a published package under `packages/`, run `pnpm changeset`: pick the
   packages, the bump and write a one-line, user-facing summary. Apps and private packages
   (`docs`, examples, `musematic`, `mcp`) are ignored.
2. Bump rules (pre-1.0 the minor plays the role of the major):

   | Change | 0.x | ≥ 1.0 |
   | --- | --- | --- |
   | Fix, docs, internal refactor | patch | patch |
   | New component, prop, token, block | minor | minor |
   | Breaking change (renamed/removed prop, changed default, new required peer) | minor + `BREAKING:` prefix | major |
   | Deprecation | minor | minor |

3. `@gntik-ai/ui`, `icons`, `charts`, `flow`, `editor`, `chat`, `blocks`, `templates` and `cli`
   are **linked**: they share the highest version bump in a release. `@gntik-ai/tokens` and
   `@gntik-ai/codemods` version on their own.

## Version Packages PR

On every push to `main` the Release workflow runs `changesets/action`:

- with pending changesets it opens (or updates) the **"Version Packages"** PR, which bumps
  versions, updates internal dependency ranges and writes each `CHANGELOG.md`;
- merging that PR runs `pnpm release` (`pnpm -r build && changeset publish`), publishes the
  new versions and pushes the git tags.

Review the Version Packages PR like any other: the changelog is what consumers read.

## Canary releases

For testing an unmerged change in a product app:

```sh
pnpm changeset version --snapshot canary   # 0.4.0-canary-20261003104500
pnpm -r build
pnpm changeset publish --tag canary --no-git-tag
```

Canaries never move the `latest` dist-tag. Consumers opt in with
`pnpm add @gntik-ai/ui@canary`. Do not commit the snapshot version bump. Pre-releases of a
whole major use `pnpm changeset pre enter next` … `pre exit` on a release branch.

## Breaking changes and codemods

A breaking change in a stable API ships, in the same PR:

1. the changeset (`BREAKING:` summary with before/after);
2. a codemod in `packages/codemods/src/transforms/<id>.ts` when the migration is mechanical,
   with `meta` (`id`, `package`, `fromVersion`, `toVersion`, `reportOnly`) and a fixture test,
   registered in `src/registry.ts` (oldest first). Use `reportOnly: true` when the change can
   only be flagged, not rewritten;
3. a migration note in the component docs.

Consumers run `gntik-ui upgrade` (CLI, backed by `@gntik-ai/codemods`), which selects the
transforms whose version range the upgrade crosses; `gntik-ui upgrade --list` shows them.

## Deprecation policy

- Deprecate before removing: a deprecated export keeps working for **at least one minor
  release** and is removed only in the next major (0.x: next minor after that window).
- A deprecation changeset names the replacement and the planned removal version.
- Deprecated exports carry `@deprecated <replacement>` JSDoc (editors strike them through) and
  warn once in development (`process.env.NODE_ENV !== 'production'`).
- The catalog and registry show the Deprecated badge and list the replacement first.
- When the replacement is mechanical, the codemod ships with the deprecation, not with the
  removal, so teams can migrate early.
- Tokens: colour values in `brand.css` are frozen and never deprecated; a token *name* is
  deprecated by aliasing it to its replacement in `pairing.css` for a full major.
