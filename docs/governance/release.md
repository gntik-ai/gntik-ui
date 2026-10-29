# Releasing

Packages publish to npmjs.org (`@gntik-ai/*`, public) through
[Changesets](https://github.com/changesets/changesets). Config: `.changeset/config.json`;
workflow: `.github/workflows/release.yml`.

## Every PR

1. If the PR changes a published package under `packages/`, run `pnpm changeset`: pick the
   packages, the bump and write a one-line, user-facing summary. Apps and private packages
   (`docs`, examples, `musematic`, `mcp`) are ignored.
2. Bump rules (pre-1.0 the minor plays the role of the major):

   | Change                                                                     | 0.x                        | ≥ 1.0 |
   | -------------------------------------------------------------------------- | -------------------------- | ----- |
   | Fix, docs, internal refactor                                               | patch                      | patch |
   | New component, prop, token, block                                          | minor                      | minor |
   | Breaking change (renamed/removed prop, changed default, new required peer) | minor + `BREAKING:` prefix | major |
   | Deprecation                                                                | minor                      | minor |

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

## Registry release baseline

The live registry follows main. Its offline PR gate, `pnpm registry:check`, derives the
inventory from source discovery and compares generated files at the same commit. The committed
[`registry-release-snapshot.json`](../../packages/mcp/registry-release-snapshot.json) records
the item names from `apps/docs/public/r/registry.json` at `b464709`; checking or generating the
manifest needs no historical Git objects. `missingComponents` means discovered ids absent
from that historical inventory, rather than components missing from today's registry.

The manifest pins are explicit and are **not** advanced by `pnpm registry` or Changesets.
Before enabling the release workflow fidelity step, a maintainer must advance the baseline to
the intended published release: update `RELEASE_COMMIT` and the per-package `PINNED_VERSIONS`
in `packages/mcp/scripts/build-registry-manifest.ts`, replace the snapshot with the sorted item
names from that commit's registry index (recording its commit and path), then run `pnpm registry`.
Update the README, adoption guide and historical fidelity test expectations for the new release.
Commit these together; never edit `registry-manifest.json` by hand.

Run `pnpm registry:check`, then `pnpm registry:release-check` with the version tags available
and access to public npm. The release check fails on missing tags or unavailable npm artifacts;
only its historical test fixtures skip when a shallow PR checkout lacks the tags. The current
base includes unreleased data-table changes relative to blocks 0.6.0, so the release check
correctly reports those files until the baseline advances to a release containing them.
The release workflow integration remains a maintainer follow-up.

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
- Named palettes: new palettes ship as a minor tokens release with full light/dark completeness
  and contrast tests. Green stays the default; high contrast and categorical accents are shared.
  Products opt in through ThemeProvider or BrandPreset.palette.
- Tokens: colour values in `brand.css` are frozen and never deprecated; a token _name_ is
  deprecated by aliasing it to its replacement in `pairing.css` for a full major.
